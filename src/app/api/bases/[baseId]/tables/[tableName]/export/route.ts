import { NextResponse } from 'next/server';
import SchemaServer from '@/lib/schema-server';
import { cache } from 'react';
import { getExportValue } from '@/components/field-types/server';
import { getCurrentUser } from '@/lib/server';
import Papa from 'papaparse';

const getSchema = cache(SchemaServer.load);

export async function GET(
  req: Request,
  { params }: any
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({
      error: 'Not Found',
    });
  }
  const { baseId, tableName } = params;
  const schema = await getSchema(baseId);

  if (!schema) {
    return NextResponse.json({
      error: 'Not Found.0x1',
    });
  }

  if (schema.hasTable(tableName) === false) {
    return NextResponse.json({
      error: 'Not Found.0x2',
    });
  }
  
  const { searchParams } = new URL(req.url);
  const viewId = searchParams.get('viewId');
  const filters = searchParams.get('filters');

  
  const query = schema.relationQuery(tableName);
  const tableSchema = schema.getTableSchema(tableName);
  const fieldsSchema = schema.getFields(tableName);
  const allFields = Object.keys(fieldsSchema);

  let filename = tableSchema.label;
  let filteredFields = [...allFields];
  if (viewId) {
    if (schema.hasView(tableName, viewId) === false) {
      return NextResponse.json({
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
    console.log(e)
    return NextResponse.json({
      error: 'Server Error',
    });
  }
}