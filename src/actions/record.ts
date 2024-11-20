'use server'

import { User } from "@/database";
import SchemaServer from "@/lib/schema-server";
import { getCurrentUser } from "@/lib/server";
import { denies } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function getRecord({
  baseId,
  tableName,
  recordId,
}: {
  baseId: string;
  tableName: string;
  recordId: string;
}) {
  const schema = await SchemaServer.loadWithoutAuth(baseId);
  if (!schema) {
    return {
      error: 'Base not found'
    }
  }

  // if (denies(schema.getRole(), 'record:read')) {
  //   return {
  //     error: 'You do not have permission to read this record'
  //   }
  // }
  const query = await schema.relationQuery(tableName)
  const initialData = await query.find<any>(recordId);
  return {
    data: initialData.toData()
  }
}

export async function editRecord({
  baseId, tableName, id, data
}: {
  baseId: string, tableName: string, id: string, data: any
}, options?: {
  originalPath?: string;
}) {
  const user = await getCurrentUser() as User;
  const schema = await SchemaServer.load(baseId);
  if (!schema) {
    return {
      error: 'Base not found'
    }
  }

  if (denies(schema.getRole(), 'record:update')) {
    return {
      error: 'You do not have permission to edit this record'
    }
  }

  if (!schema.hasTable(tableName)) {
    return {
      error: `Table "${tableName}" not found`
    };
  }

  if (schema.isDefaultProvider()) {
    data.updated_by = user.id;
  }

  const record = await schema.query(tableName).where('id', id).first();
  if (!record) {
    return {
      error: `Record "${id}" not found`
    };
  }

  await record?.update(data);

  options?.originalPath && revalidatePath(options?.originalPath);

  // webhook
  await schema.loadWebhooks(['record.update']);

  if (schema.hasWebhooks(tableName)) {
    try {
      await schema.loadRecordRelations(record, tableName);
      await schema.touchWebhooks(tableName, 'record.update', [record.toData()]);
    } catch (e: any) {
      return {
        error: `Record update successfully, ${e.message}`
      }
    }
  }

  return {};
}

export async function createRecord({
  baseId,
  tableName,
  data
}: {
  baseId: string, tableName: string, data: any
}, options?: {
  originalPath?: string;
}) {
  const user = await getCurrentUser() as User;
  const schema = await SchemaServer.load(baseId);

  if (!schema) {
    return {
      error: 'Base not found'
    }
  }

  if (denies(schema.getRole(), 'record:create')) {
    return {
      error: 'You do not have permission to create records'
    }
  }
  
  if (!schema.hasTable(tableName)) {
    return {
      error: `Table "${tableName}" not found`
    };
  }

  if (schema.isDefaultProvider()) {
    data.created_by = user.id;
    data.updated_by = user.id;
  }
  
  const record = await schema.query(tableName).create(data);

  options?.originalPath && revalidatePath(options?.originalPath);

  // webhook
  await schema.loadWebhooks(['record.create']);

  if (schema.hasWebhooks(tableName)) {
    try {
      await record.refresh();
      await schema.loadRecordRelations(record, tableName);
      await schema.touchWebhooks(tableName, 'record.create', [record.toData()]);
    } catch (e: any) {
      return {
        error: `Record create successfully, ${e.message}`
      }
    }
  }

  return {
    record: record.toData(),
  };
}

export async function deleteRecord({
  baseId, tableName, id
}: {
  baseId: string, tableName: string, id: string
}, options?: {
  originalPath?: string;
}) {
  const user = await getCurrentUser() as User;
  const schema = await SchemaServer.load(baseId);
  if (!schema) {
    return {
      error: 'Base not found'
    }
  }

  if (denies(schema.getRole(), 'record:delete')) {
    return {
      error: 'You do not have permission to delete records'
    }
  }
  
  if (!schema.hasTable(tableName)) {
    return {
      error: `Table "${tableName}" not found`
    };
  }

  const primaryKey = schema.getPrimaryKey(tableName);

  if (!primaryKey) {
    return {
      error: `Table "${tableName}" has no primary key`
    };
  }

  const record = await schema.query(tableName).where(primaryKey, id).first();

  if (record) {
    await record.delete();
    options?.originalPath && revalidatePath(options?.originalPath);

    // webhook
    await schema.loadWebhooks(['record.delete']);

    if (schema.hasWebhooks(tableName)) {
      try {
        await schema.loadRecordRelations(record, tableName);
        await schema.touchWebhooks(tableName, 'record.delete', [record.toData()]);
      } catch (e: any) {
        return {
          error: `Record delete successfully, ${e.message}`
        }
      }
    }
  }

  return {};
}

export async function deleteRecords({
  baseId, tableName, ids
}: {
  baseId: string, tableName: string, ids: (string | number)[]
}, options?: {
  originalPath?: string;
}) {
  const user = await getCurrentUser() as User;
  const schema = await SchemaServer.load(baseId);
  if (!schema) {
    return {
      error: 'Base not found'
    }
  }

  if (denies(schema.getRole(), 'record:delete')) {
    return {
      error: 'You do not have permission to delete records'
    }
  }
  
  if (!schema.hasTable(tableName)) {
    return {
      error: `Table "${tableName}" not found`
    };
  }

  const primaryKey = schema.getPrimaryKey(tableName);

  if (!primaryKey) {
    return {
      error: `Table "${tableName}" has no primary key`
    };
  }

  await schema.query(tableName).whereIn(primaryKey, ids).delete();
  options?.originalPath && revalidatePath(options?.originalPath);
  return {};
}