'use server';

import SchemaServer from "@/lib/schema-server";
import { cache } from "react";
import { revalidatePath } from "next/cache";
import type { TableSchemaType } from "@/lib/schema-builder";
import { denies, isSystemField, sortObjectByKeys } from "@/lib/utils";
import { getCurrentUser } from "@/lib/server";
import { getManager, User } from "@/database";
import { onCreateField } from "@/components/field-types/server";

const getSchema = cache(SchemaServer.load);

export async function createField({
  baseId, tableName, fieldName, value
}: {
  baseId: string;
  tableName: string;
  fieldName: string;
  value: any;
}) {
  const schema = await getSchema(baseId);
  if (!schema) {
    return {
      error: 'Field not found'
    }
  }

  if (denies(schema.getRole(), 'field:create') || !schema.isDefaultProvider()) {
    return {
      error: 'Cannot create field'
    }
  }

  if (schema.hasField(tableName, fieldName)) {
    return {
      error: 'Field already exists'
    }
  }

  const manager = getManager(schema);
  const connection = manager.connection();
  const trueTableName = schema.getTrueTableName(tableName);
  await connection.schema.table(trueTableName, (table) => {
    onCreateField(value.ui.type, {
      fieldName, table, value
    });
  });

  schema.set(`tables.${tableName}.fields.${fieldName}`, value);
  await schema.sync();
}

export async function updateField({
  baseId, tableName, fieldName, value
}: {
  baseId: string;
  tableName: string;
  fieldName: string;
  value: any;
}) {
  const schema = await getSchema(baseId);
  if (!schema) {
    return {
      error: 'Field not found'
    }
  }

  if (denies(schema.getRole(), 'field:update')) {
    return {
      error: 'Field not found'
    }
  }

  if (schema.isDefaultProvider() && isSystemField(fieldName)) {
    const fieldSchema = schema.getFieldSchema(tableName, fieldName);
    const type = fieldSchema.ui.type;
    if (value?.ui?.type !== type) {
      return {
        error: 'Cannot update system field'
      }
    }
  }

  schema.set(`tables.${tableName}.fields.${fieldName}`, value);
  await schema.sync();

  // revalidatePath(`/bases/${base}/tables/${table}/settings/field`);
}

export async function updateFieldsOrder({
  baseId, tableName, fields
}: {
  baseId: string;
  tableName: string;
  fields: string[];
}) {
  const user = await getCurrentUser() as User;
  const schema = await getSchema(baseId);
  if (!schema) {
    return {
      error: 'Field not found'
    }
  }

  if (denies(schema.getRole(), 'field:update')) {
    return {
      error: 'Field not found'
    }
  }

  const fieldsSchema = schema.table(tableName).get<TableSchemaType>().fields;
  schema.set(`tables.${tableName}.fields`, sortObjectByKeys(fieldsSchema, fields));
  await schema.sync();

  revalidatePath(`/bases/${baseId}/tables/${tableName}/settings/field`);
}

export async function deleteField({
  baseId, tableName, fieldName
}: {
  baseId: string;
  tableName: string;
  fieldName: string;
}, options?: {
  originalPath?: string;
}) {
  const schema = await getSchema(baseId);
  if (!schema) {
    return {
      error: 'Field not found'
    }
  }

  if (denies(schema.getRole(), 'field:delete')) {
    return {
      error: 'Field not found'
    }
  }

  if (schema.isDefaultProvider()) {
    if (isSystemField(fieldName)) {
      return {
        error: 'Cannot delete system field'
      }
    } else {
      const manager = getManager(schema);
      const connection = manager.connection();
      await connection.schema.table(
        schema.getTrueTableName(tableName),
        (table) => {
          table.dropColumn(fieldName);
        }
      );
    }
  }

  schema.set(`tables.${tableName}.fields.${fieldName}`, undefined);
  await schema.sync();

  options?.originalPath && revalidatePath(options.originalPath);
}