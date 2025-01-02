import set from "lodash/set";
import unset from "lodash/unset";
import mapValues from "lodash/mapValues";
import snakeCase from "lodash/snakeCase";
import startCase from "lodash/startCase";
import defaults from "lodash/defaults";
import { simpleClone } from "./utils";
import { TableNavItem } from "@/types";
import pluralize from "pluralize";
import { ProviderType, RoleType } from "./types";

export type UISchemaType = {
  type: string;
  label: string;
}

export type FieldSchema = {
  name?: string;
  type: string;
  label: string;
  default?: string | number | boolean | null;
  is_primary_key?: boolean;
  ui: UISchemaType;
  "ui:diabled": boolean;
}

export type ActionType = {
  label: string;
  webhook: string;
  icon?: string;
}

export type FilterType = [
  'where' | 'andWhere' | 'orWhere',
  [string, string, string | number | null]
];

export type FilterGroupType = [
  'where' | 'andWhere' | 'orWhere',
  FilterType[]
];

export type FiltersType = (FilterType | FilterGroupType)[];

export type SortType = [
  'orderBy',
  [string, 'desc' | 'asc']
];

export type SortsType = SortType[];

export type ViewType = {
  value?: string;
  label: string;
  sorts?: SortsType;
  fields?: Record<string, boolean>;
  filters?: FiltersType;
}

export type WebhookSchemaType = {
  id: string;
  label: string;
  endpoint: string;
  method: string;
  type: string;
  headers?: Record<string, string>;
  active: boolean;
}

export type RelationSchema = {
  name: string;
  label: string;
  type: 'has_one' | 'has_many' | 'belongs_to' | 'belongs_to_many';
  table: string;
  foreign_key?: string;
  local_key?: string;
  owner_key?: string;
  parent_key?: string;
  related_key?: string;
  pivot_table?: string;
  foreign_pivot_key?: string;
  related_pivot_key?: string;
}

export type TableSchemaType = {
  name?: string;
  label: string;
  icon?: string;
  fields: Record<string, FieldSchema>;
  relations?: Record<string, RelationSchema>;
  search?: string[];
  actions?: Record<string, ActionType>;
  views: Record<string, ViewType>;
  webhooks?: Record<string, WebhookSchemaType>;
}

export type ConnectionType = {
  host: string;
  user: string;
  password: string;
  database: string;
  port?: number;
};

export type MetadataType = 'id' | 'label' | 'createAt' | 'updateAt';

export type SchemaType = {
  id: string;
  workspace_id?: string;
  label?: string;
  prefix?: string;
  provider?: ProviderType;
  connection?: ConnectionType;
  tables: Record<string, any>;
  role: RoleType;
  created_at?: string;
  updated_at?: string;
}

export function withDefaultUI(field: string, fieldSchema: any) {
  const uiSchema: any = simpleClone(fieldSchema);

  defaults(uiSchema, {
    label: startCase(field),
    ui: {}
  });

  switch (true) {
    case ['bool', 'boolean'].includes(uiSchema.type):
      defaults(uiSchema.ui, {
        type: "switch",
      });
      break;
    case ['int', 'decimal', 'integer'].includes(uiSchema.type) || uiSchema.type?.startsWith('bigint'):
      defaults(uiSchema.ui, {
        type: "number",
      });
      break;
    case ['datetime', 'timestamp'].includes(uiSchema.type) || uiSchema.type?.includes('timestamp'):
      defaults(uiSchema.ui, {
        type: "datetime",
        format: "YYYY-MM-DD HH:mm:ss",
      });
      break;
    case ['date'].includes(uiSchema.type):
      defaults(uiSchema.ui, {
        type: "date",
        format: "YYYY-MM-DD",
      });
      break;
    case ['varchar', 'char', 'string'].includes(uiSchema.type):
      defaults(uiSchema.ui, {
        type: "string",
      });
      break;
    case ['text'].includes(uiSchema.type):
      defaults(uiSchema.ui, {
        type: "textarea",
      });
      break;
  }

  return uiSchema;
}

export function getUISchema(schema: SchemaBuilder, tableName: string, fieldName: string, withMeta: boolean = false) {
  const fieldSchema = schema.getFieldSchema(tableName, fieldName);

  const uiSchema: any = withMeta ? {
    meta: {
      name: fieldName,
      ...fieldSchema,
      ui: undefined,
    }
  } : {};

  
  if (fieldSchema.ui) {
    Object.assign(uiSchema, fieldSchema.ui);
  }

  if (['bool', 'boolean'].includes(fieldSchema.type)) {
    return defaults(uiSchema, {
      type: "switch",
    });
  }

  if (['int', 'decimal', 'integer'].includes(fieldSchema.type) || fieldSchema.type?.startsWith('bigint')) {
    return defaults(uiSchema, {
      type: "number",
    });
  }


  if (['datetime', 'timestamp'].includes(fieldSchema.type) || fieldSchema.type?.includes('timestamp')) {
    return defaults(uiSchema, {
      type: "datetime",
      format: "YYYY-MM-DD HH:mm:ss",
    });
  }

  if (['date'].includes(fieldSchema.type)) {
    return defaults(uiSchema, {
      type: "date",
      format: "YYYY-MM-DD",
    });
  }

  if (['varchar', 'char', 'string'].includes(fieldSchema.type)) {
    return defaults(uiSchema, {
      type: "string",
    });
  }

  if (['text'].includes(fieldSchema.type)) {
    return defaults(uiSchema, {
      type: "textarea",
    });
  }

  return uiSchema;
}

export default class SchemaBuilder {
  schema: SchemaType;
  type: string = 'app';
  node: string[] = [];

  static make(schema: SchemaType) {
    return new this(schema);
  }

  static table(tableSchema: TableSchemaType & { name: string }) {
    const instance = this.make({
      id: `table_${tableSchema.name}`,
      tables: {
        [tableSchema.name]: tableSchema
      },
      role: 'no-access',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    instance.type = 'table';
    instance.node.push(tableSchema.name);

    return instance;
  }

  constructor(schema: SchemaType) {
    this.schema = schema;
    if (this.isDefaultProvider()) {
      Object.entries(this.schema.tables).map(([tableName, tableSchema]) => {
        tableSchema.fields.created_by.ui = {
          type: 'creator',
        };
        tableSchema.fields.updated_by.ui = {
          type: 'modifier',
        };
      })
    }
  }

  isDefaultProvider() {
    return this.schema.provider === 'default';
  }

  getProvider () {
    return this.schema.provider;
  }

  getPrefix() {
    return this.schema.prefix ?? '';
  }

  getTrueTableName(tableName: string) {
    return `${this.getPrefix()}${tableName}`;
  }

  getConnection() {
    return this.schema.connection;
  }

  getRole() {
    return this.schema.role;
  }

  getMeta(name?: string) {
    return name ? (this.schema[name as keyof SchemaType] ?? null) : null;
  }

  table(tableName: string) {
    const schema = this.clone();
    schema.type = 'table';
    schema.node.push(tableName);
    return schema;
  }

  field(fieldName: string) {
    const schema = this.clone();
    schema.type = 'field';
    schema.node.push(fieldName);
    return schema;
  }

  getTablesSchema() {
    const tables: Record<string, TableSchemaType> = {};

    for (const tableName in this.schema.tables) {
      const tableSchema = this.schema.tables[tableName];

      tables[tableName] = {
        ...tableSchema,
        label: tableSchema.label || startCase(tableName),
      };
    }
    
    return tables;
  }

  getTables() {
    return this.schema.tables;
  }

  getTableSchema(tableName: string): TableSchemaType {
    const tables = this.schema.tables;
    const tableSchema = tables?.[tableName];

    if (tableSchema === undefined) {
      throw new Error(`Table ${tableName} not found`);
    }
    
    return {
      ...tables?.[tableName],
      name: tableName,
      label: tableSchema.label || startCase(tableName),
    };
  }

  hasWebhook(tableName: string, webhookId: string) {
    const tableSchema = this.getTableSchema(tableName);
    return tableSchema?.webhooks?.[webhookId] !== undefined;
  }

  hasWebhooks(tableName: string) {
    const tableSchema = this.getTableSchema(tableName);
    return tableSchema?.webhooks !== undefined && Object.keys(tableSchema?.webhooks).length > 0;
  }

  getWebhook(tableName:string, webhookId: string) {
    return this.getTableSchema(tableName).webhooks?.[webhookId];
  }

  getWebhooks(tableName:string) {
    return this.getTableSchema(tableName).webhooks;
  }

  getFieldSchema(tableName: string, fieldName: string, withDefaultUI: boolean = true): FieldSchema {
    const tableSchema = this.getTableSchema(tableName);

    const fieldSchema = {
      ...tableSchema?.fields?.[fieldName],
    };
    fieldSchema.label = fieldSchema.label || startCase(fieldName);

    return fieldSchema;
  }

  getField(tableName: string, fieldName: string, withDefault: boolean = true) {
    const fieldSchema = this.getFieldSchema(tableName, fieldName);
    return withDefault ? withDefaultUI(fieldName, fieldSchema) : fieldSchema;
  }

  getFields(tableName: string, withDefault: boolean = true) {
    const tableSchema = this.getTableSchema(tableName);
    for (const field in tableSchema?.fields) {
      if (withDefault) {
        tableSchema.fields[field] = withDefaultUI(field, tableSchema.fields[field]);
      }
    }

    return tableSchema?.fields;
  }

  getViews(tableName: string) {
    const tableSchema = this.getTableSchema(tableName);
    return tableSchema?.views;
  }

  getPrimaryKey(tableName: string) {
    if (!this.hasTable(tableName)) return null;
    const tableSchema = this.getTableSchema(tableName);
    for (let fieldName in tableSchema.fields) {
      const field = tableSchema.fields[fieldName];
      if (field.is_primary_key === true) {
        return fieldName;
      }
    }

    return null;
  }

  getDefaultForeignKey(tableName: string) {
    return snakeCase(pluralize.singular(tableName)) + '_' + this.getPrimaryKey(tableName);
  }

  set(path: string, value: any, filtingUndefined: boolean = false) {
    if (value === undefined) {
      unset(this.schema, path);
      return this;
    }

    set(
      this.schema,
      path,
      value
    );
    return this;
  }

  get<T = any>() {
    let results;
    const schema = this.clone();

    if (schema.type == 'app') {
      results = schema.schema;
    } else if (schema.type == 'table') {
      results = schema.getTableSchema(schema.node[0]);
      results && (results.name = schema.node[0]);
    } else if (schema.type == 'field') {
      results = schema.getFieldSchema(schema.node[0], schema.node[1]);
      results && (results.name = schema.node[1]);
    }

    return results as T;
  }

  safe() {
    return {
      ...this.schema,
      client: undefined,
      connection: undefined,
    };
  }

  pure() {
    return {
      tables: this.schema.tables,
    }
  }
  
  hasTable(tableName: string) {
    return this.schema.tables.hasOwnProperty(tableName);
  }

  hasField(tableName: string, fieldName: string) {
    return !!this.schema.tables?.[tableName]?.fields?.hasOwnProperty(fieldName);
  }

  hasView(tableName: string, viewId: string) {
    return !!this.schema.tables?.[tableName]?.views?.hasOwnProperty(viewId);
  }

  hasRelation(tableName: string, relationName: string) {
    return !!this.schema.tables?.[tableName]?.relations?.hasOwnProperty(relationName);
  }

  getTableDisplays() {
    const tables = this.getTables();
    const results: Record<string, boolean> = {};

    for (const table in tables) {
      results[table] = tables[table]?.['ui:display'] !== false;
    }

    return results;
  }

  getRelations(tableName: string, withDefault: boolean = true) {
    const tableSchema = this.getTableSchema(tableName);
    // for (const relation in tableSchema?.relations) {
    //   if (withDefault) {
    //     // tableSchema.relations[relation] = withDefaultUI(relation, tableSchema.relations[relation]);
    //   }
    // }

    return tableSchema?.relations;
  }

  getRelation(tableName: string, relationName: string) {
    if (!this.hasRelation(tableName, relationName)) {
      return null;
    }
    
    const relationSchema = this.schema?.tables?.[tableName]?.relations?.[relationName];
    relationSchema.label = relationSchema.label || startCase(relationName);
    relationSchema.name = relationName;
    return relationSchema;
  }

  getView(tableName: string, viewId: string) {
    const viewsSchema = this.getViews(tableName);
    
    const viewSchema = viewsSchema?.[viewId] as ViewType & {
      name: string;
    };
    if (!viewSchema) {
      return null;
    }
    viewSchema.name = viewId;
    return viewSchema;
  }

  ui(withMeta: boolean = false) {
    const schema = this.clone();

    if (schema.type === 'field') {
      const results = getUISchema(schema, schema.node[0], schema.node[1], withMeta);
      if (results.type === 'relation') {
        results.relation = this.getTableSchema(schema.node[0])?.relations?.[results.name];
      }
      
      return results;
    } else if (schema.type === 'table') {
      const tableSchema = this.getTableSchema(schema.node[0]);
      const results: any = {};

      for (const fieldName in tableSchema?.fields) {
        results[fieldName] = getUISchema(schema, schema.node[0], fieldName, withMeta);
      }

      return results;
    }

    return {};
  }

  tabs() {
    // if (!this.node[0]) {
    //   return [];
    // }

    const tableSchema = this.getTableSchema(this.node[0]);
    const tabs = [];
    for (let tabKey in tableSchema?.views) {
      const tabSchema = tableSchema?.views?.[tabKey];
      tabSchema.value = tabKey;
      tabSchema.label = tabSchema.label || startCase(tabKey);

      tabs.push(tabSchema);
    }

    return tabs;
  }

  defaultView(view?: string) {
    const tableSchema = this.getTableSchema(this.node[0]);
    const tabs = Object.keys(tableSchema?.views ?? {});
    if (tabs.length > 0) {
      return {
        filters: [],
        sorts: [],
        ...tableSchema?.views?.[tabs[0]]
      };
    }

    return {
      filters: [],
      sorts: [],
      label: 'All',
    };
  }

  getDefaultViewId(tableName: string) {
    const tableSchema = this.getTableSchema(tableName);
    const tabs = Object.keys(tableSchema?.views ?? {});
    if (tabs.length > 0) {
      return tabs[0];
    }

    return undefined;
  }

  view(name?: string) {
    const tableSchema = this.getTableSchema(this.node[0]);

    if (name) {
      return {
        filters: [],
        sort: [],
        ...tableSchema?.views?.[name]
      };
    }
    
    const tabs = Object.keys(tableSchema?.views ?? {});
    if (tabs.length > 0) {
      return {
        filters: [],
        sort: [],
        ...tableSchema?.views?.[tabs[0]]
      };
    }

    return {
      filters: [],
      sorts: [],
      label: 'All',
    };
  }

  getDefaultRecord(tableName: string) {
    return this.table(tableName).defaultData();
  }

  defaultData() {
    const tableSchema = this.getTableSchema(this.node[0]);
    return mapValues(tableSchema?.fields, (field: any) => field?.ui?.default);
  }

  sidebar(): TableNavItem[] {
    return Object.keys(this.schema?.tables)
      ?.sort((a: any, b: any) => {
        if (this.schema.tables?.[a]?.['ui:display'] > this.schema.tables?.[b]?.['ui:display']) return 1;
        if (this.schema.tables?.[a]?.['ui:display'] < this.schema.tables?.[b]?.['ui:display']) return -1;
        return 0;
      })
      // ?.filter((tableName: string) => this.schema.tables?.[tableName]?.['ui:display'] !== false)
      ?.map((tableName: string) => {
        return {
          title: this.schema.tables?.[tableName]?.label || tableName,
          href: `/bases/${this.schema?.id}/tables/${tableName}`,
          icon: this.schema.tables?.[tableName]?.icon,
          label: this.schema.tables?.[tableName]?.label || tableName,
          value: tableName,
          visible: this.schema.tables?.[tableName]?.['ui:display'] !== false,
        }
      }) || [];
  }

  getSkeleton() {
    const skeleton: Record<string, {
      fields: Record<string, {
        type: string;
        is_primary_key?: boolean;
      }>
    }> = {};

    for (const table in this.schema.tables) {
      const tableSchema = this.schema.tables[table];
      skeleton[table] = {
        fields: {},
      };

      for (const field in tableSchema.fields) {
        skeleton[table].fields[field] = {
          type: tableSchema.fields[field].type,
        };

        if (tableSchema.fields[field].is_primary_key) {
          skeleton[table].fields[field].is_primary_key = true;
        }
      }
    }

    return skeleton;
  }

  compareSkeleton(newSchema: any) {
    const currentTables = this.schema.tables;
    const skeleton = newSchema.tables;
    const newTables: Record<string, any> = {};

    // 记录原始表的顺序
    const originalOrder = Object.keys(currentTables);

    // 添加新表和更新现有表
    for (const tableName of originalOrder) {
      if (skeleton[tableName]) {
        // 更新现有表
        newTables[tableName] = this.compareFields(currentTables[tableName], skeleton[tableName]);
      }
    }

    // 添加新表（不在原始顺序中的）
    for (const tableName in skeleton) {
      if (!currentTables[tableName]) {
        newTables[tableName] = skeleton[tableName];
      }
    }

    // 处理被移除的表
    const removedTables = Object.keys(currentTables).filter(table => !skeleton[table]);

    // 更新relations
    for (const tableName in newTables) {
      if (newTables[tableName].relations) {
        newTables[tableName].relations = this.updateRelations(newTables[tableName].relations, removedTables);
      }
    }

    // 更新字段中的relation类型ui
    for (const tableName in newTables) {
      this.updateRelationWidgets(newTables[tableName].fields, removedTables);
    }

    // 更新schema
    this.schema.tables = newTables;
  }

  private compareFields(currentTable: TableSchemaType, newTable: any): TableSchemaType {
    const updatedFields: Record<string, FieldSchema> = {};

    // 记录原始字段的顺序
    const originalFieldOrder = Object.keys(currentTable.fields);
  
    // 添加新字段和更新现有字段
    for (const fieldName of originalFieldOrder) {
      if (newTable.fields[fieldName]) {
        updatedFields[fieldName] = {
          ...currentTable.fields[fieldName],
          type: newTable.fields[fieldName].type,
          is_primary_key: newTable.fields[fieldName].is_primary_key,
        };
      }
    }
  
    // 添加新字段（不在原始顺序中的）
    for (const fieldName in newTable.fields) {
      if (!currentTable.fields[fieldName]) {
        updatedFields[fieldName] = newTable.fields[fieldName];
      }
    }
  
    return {
      ...currentTable,
      fields: updatedFields,
    };
  }
  
  private updateRelations(relations: Record<string, RelationSchema>, removedTables: string[]) {
    const updatedRelations: Record<string, RelationSchema> = {};
  
    for (const relationName in relations) {
      const relation = relations[relationName];
      if (!removedTables.includes(relation.table)) {
        updatedRelations[relationName] = relation;
      }
    }
  
    return updatedRelations;
  }
  
  private updateRelationWidgets(fields: Record<string, FieldSchema>, removedTables: string[]) {
    for (const fieldName in fields) {
      const field = fields[fieldName];
      if (field.ui?.type === "relation") {
        const relationTable = (field.ui as any).table;
        if (removedTables.includes(relationTable) && field.ui) {
          // @ts-ignore
          delete field.ui;
        }
      }
    }
  }

  reset() {
    this.node = [];
    this.type = 'app';
  }

  clone(deepClone = false) {
    const instance = SchemaBuilder.make(
      deepClone
        ? simpleClone(this.schema)
        : this.schema
    );
    instance.type = this.type;
    instance.node = [...this.node];
    return instance;
  }
}