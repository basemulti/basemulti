import SchemaServer from '@/lib/schema-server';
import { getCurrentUser } from '@/lib/server';
import { Hono } from 'hono';
import { cache } from 'react';
import Papa from 'papaparse';
import { getExportValue } from '@/components/field-types/server';
import { denies } from '@/lib/utils';
import { User } from '@/database';
import { UserVariables } from '../middlewares/authenticate';

const getSchema = cache(SchemaServer.load);

const records = new Hono<{ Variables: UserVariables }>();

records.use('/bases/:baseId/tables/:tableName/*', async (c, next) => {
  let user = await getCurrentUser();

  if (!user) {
    const token = c.req.header('x-bm-token');
    if (token) {
      user = await User.findAuth(token);
    }
  }

  if (!user) {
    return c.json({
      message: 'Unauthorized'
    }, 401);
  }

  c.set('user', user);
  await next();
});

records.get('/bases/:baseId/tables/:tableName/records', async (c) => {
  const user = c.get('user');
  const { baseId, tableName } = c.req.param();
  const schema = await getSchema(baseId, user);

  if (!schema) {
    return c.json({
      message: 'Base not found',
    }, 404);
  }

  if (!schema.hasTable(tableName)) {
    return c.json({
      message: `Table "${tableName}" not found`
    }, 404);
  }

  const { page, pageLimit, sort, searchQ, searchField, filters, sorts } = c.req.query();
  const query = schema.query(tableName);

  if (filters) {
    try {
      const filtersObject = JSON.parse(atob(filters));
      schema.withQuery(query, filtersObject);
    } catch (e) {}
  }

  if (sorts) {
    try {
      const sortsObject = JSON.parse(atob(sorts));
      schema.withQuery(query, sortsObject);
    } catch (e) {}
  }

  if (sort) {
    const [key, order] = sort.split(" ");
    query.clearOrder().orderBy(key, order != 'desc' ? 'asc' : 'desc');
  }

  if (searchQ && searchField) {
    query.where(searchField, 'like', `%${searchQ}%`);
  }
  
  const fallbackPage = page ? Number(page) : 1;
  const fallbackPageLimit = pageLimit ? Number(pageLimit) : 15;
  const data = await query.paginate(fallbackPage, fallbackPageLimit);

  return c.json(data);
});

records.get('/bases/:baseId/tables/:tableName/records/:id', async (c) => {
  const { baseId, tableName, id } = c.req.param();
  const user = c.get('user');
  const schema = await getSchema(baseId, user);

  if (!schema) {
    return c.json({
      message: 'Base not found'
    }, 404);
  }

  if (!schema.hasTable(tableName)) {
    return c.json({
      message: `Table "${tableName}" not found`
    }, 404);
  }

  const record = await schema.query(tableName).find(id);
  if (!record) {
    return c.json({
      message: `Record "${id}" not found`
    }, 404);
  }

  return c.json(record);
});

records.post('/bases/:baseId/tables/:tableName/records', async (c) => {
  const { baseId, tableName } = c.req.param();
  const data = await c.req.json();
  const user = c.get('user');

  const schema = await SchemaServer.load(baseId);

  if (!schema) {
    return c.json({
      message: 'Base not found'
    }, 404);
  }

  if (denies(schema.getRole(), 'record:create')) {
    return c.json({
      message: 'You do not have permission to create records'
    }, 403);
  }
  
  if (!schema.hasTable(tableName)) {
    return c.json({
      message: `Table "${tableName}" not found`
    }, 404);
  }

  if (schema.isDefaultProvider()) {
    data.created_by = user.id;
    data.updated_by = user.id;
  }
  
  const record = await schema.query(tableName).create(data);

  // webhook
  await schema.loadWebhooks(['record.create']);

  if (schema.hasWebhooks(tableName)) {
    try {
      await record.refresh();
      await schema.loadRecordRelations(record, tableName);
      await schema.touchWebhooks(tableName, 'record.create', [record.toData()]);
    } catch (e: any) {
    }
  }

  return c.json(record);
});

records.patch('/bases/:baseId/tables/:tableName/records/:id', async (c) => {
  const { baseId, tableName, id } = c.req.param();
  const data = await c.req.json();
  const user = c.get('user');
  const schema = await getSchema(baseId, user);

  if (!schema) {
    return c.json({
      message: 'Base not found'
    }, 404);
  }

  if (denies(schema.getRole(), 'record:update')) {
    return c.json({
      error: 'You do not have permission to edit this record'
    }, 403);
  }

  if (!schema.hasTable(tableName)) {
    return c.json({
      error: `Table "${tableName}" not found`
    }, 404);
  }

  if (schema.isDefaultProvider()) {
    data.updated_by = user.id;
  }

  const primaryKey = schema.getPrimaryKey(tableName);

  if (!primaryKey) {
    return c.json({
      error: `Table "${tableName}" has no primary key`
    }, 400);
  }

  const record = await schema.query(tableName).where(primaryKey, id).first();
  if (!record) {
    return c.json({
      error: `Record "${id}" not found`
    }, 404);
  }

  await record?.update(data);

  // webhook
  await schema.loadWebhooks(['record.update']);

  if (schema.hasWebhooks(tableName)) {
    try {
      await schema.loadRecordRelations(record, tableName);
      await schema.touchWebhooks(tableName, 'record.update', [record.toData()]);
    } catch (e: any) {
    }
  }

  return c.json({
    [primaryKey]: id
  });
});

records.delete('/bases/:baseId/tables/:tableName/records/:id', async (c) => {
  const { baseId, tableName, id } = c.req.param();
  const user = c.get('user');
  const schema = await getSchema(baseId, user);

  if (!schema) {
    return c.json({}, 404);
  }

  if (!schema.hasTable(tableName)) {
    return c.json({}, 404);
  }

  if (denies(schema.getRole(), 'record:delete')) {
    return c.json({
      error: 'You do not have permission to delete records'
    }, 403);
  }

  const primaryKey = schema.getPrimaryKey(tableName);

  if (!primaryKey) {
    return c.json({
      error: `Table "${tableName}" has no primary key`
    }, 400);
  }


  const record = await schema.query(tableName).where(primaryKey, id).first();
  
  if (record) {
    await record.delete();

    // webhook
    await schema.loadWebhooks(['record.delete']);

    if (schema.hasWebhooks(tableName)) {
      try {
        await schema.loadRecordRelations(record, tableName);
        await schema.touchWebhooks(tableName, 'record.delete', [record.toData()]);
      } catch (e: any) {
        return c.json({
          error: `Record delete successfully, ${e.message}`
        }, 200);
      }
    }
  }

  return c.json({
    [primaryKey]: id
  });
});

records.get('/bases/:baseId/tables/:tableName/export', async (c) => {
  const user = c.get('user');
  const { baseId, tableName } = c.req.param();
  const schema = await getSchema(baseId, user);

  if (!schema) {
    return c.json({
      error: 'Not Found.0x1',
    });
  }

  if (schema.hasTable(tableName) === false) {
    return c.json({
      error: 'Not Found.0x2',
    });
  }

  const { viewId, filters } = c.req.query();
  
  const query = schema.relationQuery(tableName);
  const tableSchema = schema.getTableSchema(tableName);
  const fieldsSchema = schema.getFields(tableName);
  const allFields = Object.keys(fieldsSchema);

  let filename = tableSchema.label;
  let filteredFields = [...allFields];
  if (viewId) {
    if (schema.hasView(tableName, viewId) === false) {
      return c.json({
        error: 'Not Found.0x3',
      });
    }

    schema.withViewQuery(query, tableName, viewId);
    const viewSchema = tableSchema.views[viewId];
    filteredFields = allFields.filter(field => viewSchema?.fields?.[field] !== false);
    filename = viewSchema.label;
  }

  try {

    if (filters) {
      try {
        const filtersObject = JSON.parse(atob(filters));
        schema.withQuery(query, filtersObject);
      } catch (e) {}
    }

    const csvStream = new ReadableStream({
      async start(controller) {
        controller.enqueue('\uFEFF');
        controller.enqueue(filteredFields.map(fieldName => {
          return fieldsSchema[fieldName].label;
        }).join(','));
        controller.enqueue('\n');

        await query.chunk(1000, async (records) => {
          const csvData = Papa.unparse(records.toData().map((record: any) => {
            const newRecord: Record<string, string> = {};
            filteredFields.forEach(fieldName => {
              newRecord[fieldName] = getExportValue(fieldsSchema[fieldName].ui.type, {
                tableName,
                fieldName,
                fieldSchema: fieldsSchema[fieldName],
                label: fieldsSchema[fieldName].label,
                value: record[fieldName],
                data: record,
              });
            });

            return newRecord;
          }), {
            header: false
          });

          controller.enqueue(csvData);
          controller.enqueue('\n');
        });

        controller.close();
      },
    });

    return new Response(csvStream, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}.csv"`,
      },
    });
  } catch (e) {
    return c.json({
      error: 'Server Error',
    });
  }
});

export default records;