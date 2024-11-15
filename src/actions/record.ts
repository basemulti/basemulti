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

  await schema.query(tableName).where(
    schema.getPrimaryKey(tableName) as string,
    id
  ).update(data);
  // const record = await schema.query(table).where('id', id).firstOrFail();
  // Object.entries(data).forEach(([key, value]) => {
  //   record.setAttribute(key, value);
  // });
  // await record.save();
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

  await schema.query(tableName).where(primaryKey, id).delete();
  options?.originalPath && revalidatePath(options?.originalPath);
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