'use server';

import { providerSchemaInspector, testProviderConnection } from "@/components/providers/server";
import { Base, removeManager, User } from "@/database";
import SchemaBuilder, { SchemaType } from "@/lib/schema-builder";
import SchemaServer from "@/lib/schema-server";
import { encrypt, getCurrentUser } from "@/lib/server";
import { DatabaseProviderType, ProviderType } from "@/lib/types";
import { denies, nanoid } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cache } from "react";

export async function updateConnection({
  id,
  connection,
}: {
  id: string;
  connection: any;
}) {
  if (!id) {
    return { error: 'id is required' };
  }
  if (!connection) {
    return { error: 'connection is required' };
  }

  const user = await getCurrentUser() as User;
  const base = await user?.getBase(id);

  if (!base || denies(base.role, 'base:update')) {
    return { error: 'Base not found' };
  }

  await Base.query().where('id', id).update({
    provider: connection.provider,
    connection: encrypt(connection.connection),
  });
  
  await removeManager(base.id);
}

export async function updateBaseLabel({
  id,
  label,
}: {
  id: string;
  label: string;
}) {
  if (!id) {
    return { error: 'id is required' };
  }
  if (!label) {
    return { error: 'label is required' };
  }
  
  const user = await getCurrentUser() as User;
  const base = await user?.getBase(id);

  if (!base || denies(base.role, 'base:update')) {
    return { error: 'Base not found' };
  }

  await Base.query().where('id', id).update({
    label
  });
}

export async function testConnection({
  provider,
  connection,
}: {
  provider: DatabaseProviderType;
  connection: any;
}) {
  

  try {
    await testProviderConnection({
      provider,
      connection
    });
    return { status: 'success', message: '' };
  } catch (e: any) {
    return { status: 'error', message: e.message };
  }
}

export async function createScratchBase({
  workspace_id,
  label,
}: {
  workspace_id: string;
  label: string;
}) {
  if (!label) {
    return { error: 'label is required' };
  }

  const user = await getCurrentUser() as User;
  const workspace = await user?.getWorkspace(workspace_id);

  if (!workspace || denies(workspace.role, 'base:create')) {
    return { error: 'Workspace not found' };
  }

  const prefix = nanoid(6) + '_';
  const base = await Base.query().create({
    workspace_id,
    label,
    prefix: prefix,
    provider: 'default',
    connection: '',
    schema_data: {
      tables: {}
    },
  });

  revalidatePath(`/workspace/${workspace_id}`);

  return {
    base: base.toData(),
  };
}

export async function createBase({
  workspace_id,
  label,
  provider,
  connection,
}: {
  workspace_id: string;
  label: string;
  provider: DatabaseProviderType;
  connection: any;
}) {
  if (!label) {
    return { error: 'label is required' };
  }
  if (!provider) {
    return { error: 'provider is required' };
  }
  if (!connection) {
    return { error: 'connection is required' };
  }

  const user = await getCurrentUser() as User;
  const workspace = await user?.getWorkspace(workspace_id);

  if (!workspace || denies(workspace.role, 'base:create')) {
    return { error: 'Workspace not found' };
  }

  let schema = { tables: {} };
  try {
    schema = await providerSchemaInspector({ provider, connection });
  } catch (e: any) {
    console.error(e);
    return { error: e.message };
  }
  
  const base = await Base.query().create({
    workspace_id,
    label,
    prefix: '',
    provider,
    connection: encrypt(connection),
    schema_data: schema,
  });

  return {
    base: base.toData(),
  };
}

export async function removeBase({
  id,
}: {
  id: string;
}) {
  if (!id) {
    return { error: 'id is required' };
  }

  const user = await getCurrentUser() as User;
  const base = await user?.getBase(id);

  if (!base || denies(base.role, 'base:delete')) {
    return { error: 'Base not found' };
  }
  
  await base.delete();
  await removeManager(id);
}

export async function duplicateBase({
  id,
}: {
  id: string;
}) {
  if (!id) {
    return { error: 'id is required' };
  }

  const user = await getCurrentUser() as User;
  const base = await user?.getBase(id);
  if (!base || denies(base.role, 'base:read')) {
    return { error: 'Base not found' };
  }

  const workspace = await user?.getWorkspace(base.workspace_id);

  if (!workspace || denies(workspace.role, 'base:create')) {
    return { error: 'Workspace not found' };
  }

  const newBase = await Base.query().create({
    workspace_id: base.workspace_id,
    label: base.label + ' (copy)',
    provider: base.provider,
    connection: base.getAttribute('connection'),
    schema_data: base.schema_data,
  });

  return newBase.toData();
}

const getSchema = cache(SchemaServer.load);

interface Field {
  type: string;
  [key: string]: any;
}

interface Table {
  fields: Record<string, Field>;
  _status?: string;
}

interface Schema {
  [key: string]: Table;
}

function compareSchemas(schema1: Schema, schema2: Schema): Schema {
  const result: Schema = {};

  const compareFields = (
    fields1: Record<string, Field>,
    fields2: Record<string, Field>,
    resultFields: Record<string, Field>
  ): boolean => {
    let hasChanges = false;
    const allKeys = new Set([...Object.keys(fields1), ...Object.keys(fields2)]);
    allKeys.forEach(key => {
      if (!(key in fields1)) {
        resultFields[key] = { ...fields2[key], _status: 'added' };
        hasChanges = true;
      } else if (!(key in fields2)) {
        resultFields[key] = { ...fields1[key], _status: 'removed' };
        hasChanges = true;
      } else {
        const field1 = fields1[key];
        const field2 = fields2[key];
        resultFields[key] = { ...field1 };

        if (field1.type !== field2.type || field1.is_primary_key !== field2.is_primary_key) {
          resultFields[key]._status = 'modified';
          hasChanges = true;
        } else {
          resultFields[key]._status = 'unchanged';
        }
      }
    });
    return hasChanges;
  };

  const compareTables = (tables1: Schema, tables2: Schema, result: Schema) => {
    const allTables = new Set([...Object.keys(tables1), ...Object.keys(tables2)]);
    allTables.forEach(table => {
      if (!(table in tables1)) {
        result[table] = { ...tables2[table], _status: 'added' };
      } else if (!(table in tables2)) {
        result[table] = { ...tables1[table], _status: 'removed' };
      } else {
        result[table] = { fields: {} };
        const hasFieldChanges = compareFields(tables1[table].fields, tables2[table].fields, result[table].fields);
        result[table]._status = hasFieldChanges ? 'modified' : 'unchanged';
      }
    });
  };

  compareTables(schema1, schema2, result);

  return result;
}

export async function checkConnectionSchema({
  id,
}: {
  id: string;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const schema = await getSchema(id);

  if (!schema) {
    return { error: 'Base not found' };
  }

  if (denies(schema.getRole(), ['base:update', 'table:update'])) {
    return { error: 'You do not have permission to update this base' };
  }

  const provider = schema.getProvider() as DatabaseProviderType;
  let newSchema;
  try {
    newSchema = await providerSchemaInspector({
      provider,
      connection: schema.getConnection()
    }) as SchemaType;
  } catch (e: any) {
    return { error: e.message };
  }
  

  return {
    compare: compareSchemas(schema.getSkeleton(), SchemaBuilder.make(newSchema).getSkeleton())
  };
}

export async function updateConnectionSchema({
  id,
}: {
  id: string;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const schema = await getSchema(id);

  if (!schema) {
    return { error: 'Base not found' };
  }

  if (denies(schema.getRole(), ['base:update', 'table:update'])) {
    return { error: 'You do not have permission to update this base' };
  }

  const provider = schema.getProvider() as DatabaseProviderType;
  let newSchema;
  try {
    newSchema = await providerSchemaInspector({
      provider,
      connection: schema.getConnection()
    }) as SchemaType;
  } catch (e: any) {
    return { error: e.message };
  }
  schema.compareSkeleton(newSchema);
  await schema.sync();

  revalidatePath(`/base/${id}/settings/schema`);

  return { success: true };
}