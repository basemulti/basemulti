'use server';

import SchemaServer from "@/lib/schema-server";
import { cache } from "react";
import { revalidatePath } from "next/cache";
import type { RelationSchema, TableSchemaType } from "@/lib/schema-builder";
import { denies, sortObjectByKeys } from "@/lib/utils";
import pluralize from "pluralize";
import snakeCase from "lodash/snakeCase";
import startCase from "lodash/startCase";
import SchemaBuilder from "@/lib/schema-builder";
import { getCurrentUser } from "@/lib/server";
import { User } from "@/database";

const getSchema = cache(SchemaServer.load);

function addRelationUI(schema: SchemaBuilder, tableName: string, relationSchema: RelationSchema) {
  if (relationSchema.type === 'belongs_to') {
    const field = relationSchema.foreign_key ?? schema.getDefaultForeignKey(relationSchema.table);

    if (schema.hasField(tableName, field)) {
      schema.set(`tables.${tableName}.fields.${field}.ui`, {
        type: 'relation',
        name: relationSchema.name,
        label: relationSchema.label,
      });
    }
  }
}

export async function createRelation({
  baseId, tableName, relationName, value, auto_reciprocal = false
}: {
  baseId: string;
  tableName: string;
  relationName: string;
  value: any;
  auto_reciprocal?: boolean;
}) {
  const schema = await getSchema(baseId);
  if (!schema) {
    return {
      error: 'Base not found'
    }
  }

  if (denies(schema.getRole(), 'table:update')) {
    return {
      error: 'Permission denied'
    }
  }

  if (schema.hasRelation(tableName, relationName)) {
    return {
      error: 'Relation already exists'
    };
  }

  if (!relationName) {
    return {
      error: 'Relation name is required'
    };
  }

  schema.set(`tables.${tableName}.relations.${relationName}`, value);
  addRelationUI(schema, tableName, value);

  if (auto_reciprocal) {
    if (['has_one', 'has_many'].includes(value.type)) {
      const name = snakeCase(pluralize.singular(tableName));
      if (schema.hasRelation(value.table, name) === false) {
        const relationSchema: RelationSchema = {
          table: tableName,
          type: 'belongs_to',
          name: name,
          label: startCase(name),
          foreign_key: value.foreign_key,
          owner_key: value.local_key,
        };

        schema.set(`tables.${value.table}.relations.${name}`, relationSchema);
        addRelationUI(schema, value.table, relationSchema);
      }
    } else if (value.type === 'belongs_to_many') {
      const name = snakeCase(pluralize(tableName));
      if (schema.hasRelation(value.table, name) === false) {
        if (schema.hasTable(value.pivot_table) === false) {
          return {
            error: 'Pivot table not found'
          }
        }

        const relationSchema: RelationSchema = {
          table: tableName,
          type: 'belongs_to_many',
          name: name,
          label: startCase(name),
          pivot_table: value.pivot_table,
          foreign_pivot_key: value.related_pivot_key,
          related_pivot_key: value.foreign_pivot_key,
          parent_key: value.related_key,
          related_key: value.parent_key,
        };

        schema.set(`tables.${value.table}.relations.${name}`, relationSchema);
        addRelationUI(schema, value.table, relationSchema);
      }
    } else if (value.type === 'belongs_to') {
      const name = snakeCase(pluralize(tableName));
      if (schema.hasRelation(value.table, name) === false) {
        const relationSchema: RelationSchema = {
          table: tableName,
          type: 'has_many',
          name: name,
          label: startCase(name),
          foreign_key: value.foreign_key,
          local_key: value.owner_key,
        };

        schema.set(`tables.${value.table}.relations.${name}`, relationSchema);
        addRelationUI(schema, value.table, relationSchema);
      }
    }
  }

  await schema.sync();

  revalidatePath(`/bases/${baseId}/tables/${tableName}/settings/relation`);
}

export async function updateRelation({
  baseId, tableName, relationName, value
}: {
  baseId: string;
  tableName: string;
  relationName: string;
  value: any;
}) {
  const user = await getCurrentUser() as User;
  const schema = await getSchema(baseId);
  if (!schema) {
    return {
      error: 'Base not found'
    }
  }
  
  if (denies(schema.getRole(), 'table:update')) {
    return {
      error: 'Permission denied'
    }
  }

  schema.set(`tables.${tableName}.relations.${relationName}`, value);
  await schema.sync();

  revalidatePath(`/bases/${baseId}/tables/${tableName}/settings/relation`);
}

export async function deleteRelation({
  baseId, tableName, relationName
}: {
  baseId: string;
  tableName: string;
  relationName: string;
}) {
  const user = await getCurrentUser() as User;
  const schema = await getSchema(baseId);
  if (!schema) {
    return {
      error: 'Base not found'
    }
  }

  if (denies(schema.getRole(), 'table:update')) {
    return {
      error: 'Permission denied'
    }
  }

  schema.set(`tables.${tableName}.relations.${relationName}`, undefined);
  await schema.sync();

  revalidatePath(`/bases/${baseId}/tables/${tableName}/settings/relation`);
}

export async function updateRelationsOrder({
  baseId, tableName, relations
}: {
  baseId: string;
  tableName: string;
  relations: string[];
}) {
  const user = await getCurrentUser() as User;
  const schema = await getSchema(baseId);
  if (!schema) {
    return {
      error: 'Base not found'
    }
  }

  if (denies(schema.getRole(), 'table:update')) {
    return {
      error: 'Permission denied'
    }
  }

  const relationsSchema = schema.table(tableName).get<TableSchemaType>().relations || {};
  schema.set(`tables.${tableName}.relations`, sortObjectByKeys(relationsSchema, relations));
  await schema.sync();

  revalidatePath(`/bases/${baseId}/tables/${tableName}/settings/relation`);
}
