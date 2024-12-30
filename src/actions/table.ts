'use server';

import { getManager, User } from "@/database";
import SchemaServer from "@/lib/schema-server";
import { getCurrentUser } from "@/lib/server";
import { denies, nanoid, sortObjectByKeys } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cache } from "react";

const getSchema = cache(SchemaServer.load);

export async function createTable({
  baseId,
  label,
  name,
}: {
  baseId: string;
  label: string;
  name: string;
}, options?: {
  originalPath?: string;
}) {
  const user = await getCurrentUser() as User;
  const schema = await getSchema(baseId);
  
  if (!schema) {
    return {
      error: 'Base not found'
    }
  }

  if (denies(schema.getRole(), 'table:create') || !schema.isDefaultProvider()) {
    return {
      error: 'Cannot create table'
    }
  }

  name = name || nanoid(10);
  const manager = getManager(schema);
  const connection = manager.connection();
  const tableName = schema.getTrueTableName(name);
  await connection.schema.createTable(tableName, (table) => {
    table.increments('id');
    table.string('name');
    table.string('created_by', 21);
    table.string('updated_by', 21);
    table.datetime('created_at');
    table.datetime('updated_at');
  });

  schema.set(`tables.${name}`, {
    label,
    fields: {
      id: {
        type: 'int',
        is_primary_key: true,
      },
      name: {
        type: 'string',
      },
      created_by: {
        type: 'string',
        ui: {
          type: 'created-by',
        }
      },
      updated_by: {
        type: 'string',
        ui: {
          type: 'updated-by',
        }
      },
      created_at: {
        type: 'datetime',
        ui: {
          type: 'created-at',
        }
      },
      updated_at: {
        type: 'datetime',
        ui: {
          type: 'updated-at',
        }
      },
    },
  });

  await schema.sync();
  options?.originalPath && revalidatePath(options.originalPath);
}

export async function setTableDisplay({
  baseId, tableName, visible
}: {
  baseId: string;
  tableName: string;
  visible: boolean;
}) {
  const schema = await getSchema(baseId);
  if (!schema) {
    return {
      error: 'Base not found'
    }
  }

  if (!schema.hasTable(tableName) || denies(schema.getRole(), 'table:update')) {
    return {
      error: 'Table not found'
    }
  }

  if (visible === false) {
    schema.set(`tables.${tableName}.ui:display`, false);
  } else {
    schema.set(`tables.${tableName}.ui:display`, undefined);
  }
  
  await schema.sync();

  revalidatePath(`/bases/${baseId}/tables/${tableName}`);
  revalidatePath(`/bases/${baseId}/settings/table`);
}

export async function updateTablesOrder({
  baseId, tables
}: {
  baseId: string;
  tables: string[];
}) {
  const user = await getCurrentUser() as User;
  const schema = await getSchema(baseId);
  if (!schema) {
    return {
      error: 'Base not found'
    }
  }

  if (!schema.hasTable(tables[0]) || denies(schema.getRole(), 'table:update')) {
    return {
      error: 'Table not found'
    }
  }

  const tablesSchema = schema.get().tables;
  schema.set(`tables`, sortObjectByKeys(tablesSchema, tables));
  await schema.sync();

  revalidatePath(`/bases/${baseId}/settings/table`);
}

export async function updateTableLabel({
  baseId, tableName, label
}: {
  baseId: string;
  tableName: string;
  label: string;
}) {
  const user = await getCurrentUser() as User;
  const schema = await getSchema(baseId);
  if (!schema) {
    return {
      error: 'Base not found'
    }
  }

  if (!schema.hasTable(tableName) || denies(schema.getRole(), 'table:update')) {
    return {
      error: 'Table not found'
    }
  }

  schema.set(`tables.${tableName}.label`, label);
  await schema.sync();

  revalidatePath(`/bases/${baseId}/settings/table`);
}

export async function updateTableIcon({
  baseId, tableName, icon, type
}: {
  baseId: string;
  tableName: string;
  icon: string;
  type: string;
}) {
  const schema = await getSchema(baseId);
  
  if (!schema) {
    return {
      error: 'Base not found'
    }
  }

  if (!schema.hasTable(tableName) || denies(schema.getRole(), 'table:update')) {
    return {
      error: 'Table not found'
    }
  }

  schema.set(`tables.${tableName}.icon`, icon);
  await schema.sync();

  return {};
}

export async function deleteTable({
  baseId, tableName
}: {
  baseId: string;
  tableName: string;
}) {
  const schema = await getSchema(baseId);
  if (!schema) {
    return {
      error: 'Base not found'
    }
  }

  if (!schema.hasTable(tableName) || denies(schema.getRole(), 'table:delete')) {
    return {
      error: 'Table not found'
    }
  }

  const tablesSchema = schema.getTablesSchema();
  for (let table in tablesSchema) {
    if (table === tableName) {
      continue;
    }

    const tableSchema = tablesSchema[table];
    const relations = tableSchema.relations;
    if (relations) {
      for (let relationName in relations) {
        const relation = relations[relationName];
        if (relation.table === tableName || relation.pivot_table === tableName) {
          return {
            error: 'This table is associated with other tables. Please delete the relationship first.'
          };
        }
      }
    }
  }

  schema.set(`tables.${tableName}`, undefined);
  await schema.sync();
  redirect(`/bases/${baseId}`);
}
