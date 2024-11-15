import { create } from "zustand";
import SchemaBuilder from "@/lib/schema-builder";

export type State = {
  originalSchema: SchemaBuilder | null;
  schema: SchemaBuilder | null;
}

export type Actions = {
  init: (schema: any) => SchemaBuilder;
  updateSchema : (path: string, value: any) => void;
  setSchema: (schema: SchemaBuilder) => void;
  setTablesSchema: (value: any) => void;
  setTableSchema: (tableName: string, value: any) => void;
  setFieldSchema: (tableName: string, fieldName: string, value: any) => void;
  setRelationSchema: (tableName: string, relationName: string, value: any) => void;
}

export const useSchemaStore = create<State & Actions>((set, get) => {
  return {
    originalSchema: null,
    schema: null,
    init: (schema: any) => {
      const schemaBuilder = SchemaBuilder.make(schema);
      set({
        schema: schemaBuilder,
        originalSchema: SchemaBuilder.make(schema),
      });
      return schemaBuilder;
    },
    updateSchema: (path: string, value: any) => set((state) => {
      if (!state.schema) {
        return {};
      }

      state.schema?.set(path, value);
      state.originalSchema?.set(path, value);
      return {};
    }),
    setSchema: (value: SchemaBuilder) => set({ schema: value }),
    setTablesSchema: (value: any) => set((state) => {
      if (!state.schema) {
        return {};
      }

      const schema = state.schema.clone(true);
      schema.set(`tables`, value);
      return { schema };
    }),
    setTableSchema: (tableName: string, value: any) => {
      set((state) => {
        if (!state.schema) {
          return {};
        }

        const schema = state.schema.clone(true);
        schema.set(`tables.${tableName}`, value);
        return { schema };
      });
    },
    setFieldSchema: (tableName: string, fieldName: string, value: any) => {
      set((state) => {
        if (!state.schema) {
          return {};
        }

        const schema = state.schema.clone(true);
        schema.set(`tables.${tableName}.fields.${fieldName}`, value);
        return { schema };
      });
    },
    setRelationSchema: (tableName: string, relationName: string, value: any) => {
      set((state) => {
        if (!state.schema) {
          return {};
        }

        const schema = state.schema.clone(true);
        schema.set(`tables.${tableName}.relations.${relationName}`, value);
        return { schema };
      });
    },
  };
});