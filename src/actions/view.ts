'use server';

import { User } from "@/database";
import SchemaServer from "@/lib/schema-server";
import { getCurrentUser } from "@/lib/server";
import { denies, generateId } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cache } from "react";

const getSchema = cache(SchemaServer.load);

export async function setViewFields({
  baseId, tableName, viewId, fields
}: {
  baseId: string;
  tableName: string;
  viewId: string;
  fields: any;
}) {
  const schema = await getSchema(baseId);
  if (!schema) {
    return {
      error: 'Base not found'
    }
  }

  if (!schema.hasView(tableName, viewId) || denies(schema.getRole(), 'view:update')) {
    return {
      error: 'View not found'
    }
  }

  schema.set(`tables.${tableName}.views.${viewId}.fields`, fields);
  await schema.sync();

  revalidatePath(`/bases/${baseId}/tables/${tableName}`);
}

export async function setViewFilter({
  baseId, tableName, viewId, filters
}: {
  baseId: string;
  tableName: string;
  viewId: string;
  filters: any;
}) {
  const schema = await getSchema(baseId);
  if (!schema) {
    return {
      error: 'Base not found'
    }
  }

  if (!schema.hasView(tableName, viewId) || denies(schema.getRole(), 'view:update')) {
    return {
      error: 'View not found'
    }
  }

  schema.set(`tables.${tableName}.views.${viewId}.filters`, filters);
  await schema.sync();

  revalidatePath(`/bases/${baseId}/tables/${tableName}`);
}

export async function setViewSort({
  baseId, tableName, viewId, sorts
}: {
  baseId: string;
  tableName: string;
  viewId: string;
  sorts: any;
}) {
  const user = await getCurrentUser() as User;
  const schema = await getSchema(baseId);
  if (!schema) {
    return {
      error: 'Base not found'
    }
  }

  if (!schema.hasView(tableName, viewId) || denies(schema.getRole(), 'view:update')) {
    return {
      error: 'View not found'
    }
  }

  schema.set(`tables.${tableName}.views.${viewId}.sorts`, sorts);
  await schema.sync();

  revalidatePath(`/bases/${baseId}/tables/${tableName}`);
}

export async function createView({
  baseId, tableName, label
}: {
  baseId: string;
  tableName: string;
  label: string;
}) {
  const schema = await getSchema(baseId);
  if (!schema) {
    return {
      error: 'Base not found'
    }
  }
  const key = generateId('vw');

  schema.set(`tables.${tableName}.views.${key}`, {
    label
  });
  await schema.sync();

  revalidatePath(`/bases/${baseId}/tables/${tableName}`);

  return {
    view: {
      value: key,
      label
    }
  };
}

export async function deleteView({
  baseId, tableName, viewId
}: {
  baseId: string;
  tableName: string;
  viewId: string;
}) {
  const schema = await getSchema(baseId);
  if (!schema) {
    return {
      error: 'Base not found'
    }
  }

  if (!schema.hasView(tableName, viewId) || denies(schema.getRole(), 'view:delete')) {
    return {
      error: 'View not found'
    }
  }

  if (Object.keys(schema.getViews(tableName)).length === 1) {
    return {
      error: 'Cannot delete last view'
    }
  }

  schema.set(`tables.${tableName}.views.${viewId}`, undefined);
  await schema.sync();

  revalidatePath(`/bases/${baseId}/tables/${tableName}`);
  redirect(`/bases/${baseId}/tables/${tableName}`);
}

export async function updateViewName({
  baseId, tableName, viewId, label
}: {
  baseId: string;
  tableName: string;
  viewId: string;
  label: string;
}) {
  const schema = await getSchema(baseId);
  if (!schema) {
    return {
      error: 'Base not found'
    }
  }
  schema.set(`tables.${tableName}.views.${viewId}.label`, label);
  await schema.sync();

  revalidatePath(`/bases/${baseId}/tables/${tableName}`);
}

export async function duplicateView({
  baseId, tableName, viewId
}: {
  baseId: string;
  tableName: string;
  viewId: string;
}) {
  const schema = await getSchema(baseId);
  if (!schema) {
    return {
      error: 'Base not found'
    }
  }

  const viewSchema = schema.table(tableName).view(viewId);
  const key = generateId('vw');

  schema.set(`tables.${tableName}.views.${key}`, {
    ...viewSchema,
    label: viewSchema.label ? viewSchema.label + ' (copy)' : 'New View',
  });
  await schema.sync();

  revalidatePath(`/bases/${baseId}/tables/${tableName}`);
}
