// import { experimental_taintObjectReference } from "react";
import SchemaBuilder from "./schema-builder";
import { Base, getManager, User, Webhook } from "@/database";
import type { Builder, Model } from "sutando";
import { decrypt, getCurrentUser, hmac } from "./server";
import axios from "axios";
import dayjs from "dayjs";
import { WebhookType } from "./types";

export default class SchemaServer extends SchemaBuilder {
  static async load(id: string, auth?: User | null) {
    if (!id) {
      return null;
    }

    let user = auth;
    if (!user) {
      user = await getCurrentUser();
    }
    
    const base = await user?.getBase(id);

    if (!base) {
      return null;
    }
    // experimental_taintObjectReference(
    //   ``,
    //   base.schema_data
    // )
    const connection = base.provider === 'default' ? '' : decrypt(base.getAttribute('connection'));

    const schema = new SchemaServer({
      ...base.schema_data,
      id: id,
      workspace_id: base.workspace_id,
      label: base.label,
      role: base.role,
      prefix: base.prefix,
      provider: base.provider,
      connection: connection,
      created_at: base.created_at,
      updated_at: base.updated_at,
    });

    return schema;
  }

  static async loadWithoutAuth(id: string) {
    if (!id) {
      return null;
    }
    
    const base = await Base.query().where("id", id).first();

    if (!base) {
      return null;
    }
    // experimental_taintObjectReference(
    //   ``,
    //   base.schema_data
    // )
    const connection = base.provider === 'default' ? '' : decrypt(base.getAttribute('connection'));

    return new SchemaServer({
      ...base.schema_data,
      id: id,
      workspace_id: base.workspace_id,
      label: base.label,
      role: 'no-access',
      prefix: base.prefix,
      provider: base.provider,
      connection: connection,
      created_at: base.created_at,
      updated_at: base.updated_at,
    });
  }

  async sync() {
    const base = await Base.query().where("id", this.schema.id).firstOrFail();
    base.schema_data = this.pure();
    await base.save();
  }

  async loadWebhooks(types?: WebhookType[]) {
    const query = Webhook.query().where({
      base_id: this.schema.id,
      active: 1,
    });

    if (types) {
      query.whereIn('type', types);
    }
    
    const webhooks = await query.get();

    if (webhooks.count() > 0) {
      for (let webhook of webhooks) {
        this.set(`tables.${webhook.table_name}.webhooks.${webhook.id}`, {
          id: webhook.id,
          label: webhook.label,
          endpoint: webhook.endpoint,
          method: webhook.method,
          type: webhook.type,
          active: webhook.active,
        })
      }
    }

    return this;
  }

  query(tableName: string) {
    const manager = getManager(this);
    const query = manager.models[tableName].query();
    this.withDefaultQuery(query);

    return query;
  }

  withQuery(query: Builder<any>, conditions: any) {
    for (let [method, params] of conditions) {
      if (['with'].includes(method)) {
        query[method](...params);
      } else if (typeof params[0] === 'string') {
        let [column, operator, value] = params;
        if (['like', 'not like'].includes(operator) && !value.includes('%')) {
          value = `%${value}%`;
        }

        query[method](column, operator, value);
      } else {
        query[method]((q: any) => {
          for (let [childMethod, childParams] of params) {
            let [column, operator, value] = childParams;
            if (['like', 'not like'].includes(operator) && !value.includes('%')) {
              value = `%${value}%`;
            }

            q[childMethod](column, operator, value);
          }
        });
      }
    }

    return query;
  }

  withDefaultQuery(query: Builder<any>) {
    if (!this.isDefaultProvider()) {
      return query;
    }

    query.with('creator:id,email,name');
    query.with('modifier:id,email,name');
    return query;
  }

  withRelationQuery(query: Builder<any>, tableName: string) {
    const tableSchema = this.table(tableName);
    const tableSchemaValue = tableSchema.get();

    for (let fieldName in tableSchemaValue.fields) {
      const ui = tableSchema.field(fieldName).ui();
      if (['relation'].includes(ui.type) && this.hasRelation(tableName, ui.name)) {
        const relation = tableSchemaValue.relations[ui.name];
        const primary_key = this.getPrimaryKey(relation.table) || 'id';

        const fields: string[] = [
          primary_key,
          ui.label_field || this.getPrimaryKey(relation.table)
        ];
        
        query.with(`${ui.name}:${fields.filter((field: string) => field).join(',')}`);
      }
    }

    return query;
  }

  relationQuery(tableName: string) {
    const query = this.query(tableName);
    this.withRelationQuery(query, tableName);

    return query;
  }

  async loadRecordRelations(record: Model, tableName: string) {
    const tableSchema = this.table(tableName);
    const tableSchemaValue = tableSchema.get();

    for (let fieldName in tableSchemaValue.fields) {
      const ui = tableSchema.field(fieldName).ui();
      if (['relation'].includes(ui.type) && this.hasRelation(tableName, ui.name)) {
        const relation = tableSchemaValue.relations[ui.name];
        const primary_key = this.getPrimaryKey(relation.table) || 'id';

        const fields: string[] = [
          primary_key,
          ui.label_field || this.getPrimaryKey(relation.table)
        ];
        
        await record.load(`${ui.name}:${fields.filter((field: string) => field).join(',')}`);
      }
    }

    if (this.isDefaultProvider()) {
      await record.load('creator:id,email,name');
      await record.load('modifier:id,email,name');
    }
  }
  
  withViewQuery(query: Builder<any>, tableName: string, viewId: string | undefined) {
    const viewSchema = this.table(tableName).view(viewId);

    if (viewSchema?.filters) {
      this.withQuery(query, viewSchema.filters);
    }

    if (viewSchema?.sorts) {
      this.withQuery(query, viewSchema.sorts);
    }
  }

  viewQuery(tableName: string, viewId: string | undefined) {
    const query = this.relationQuery(tableName);
    this.withViewQuery(query, tableName, viewId);

    return query;
  }

  async touchWebhook(tableName: string, webhookId: string, records: any[]) {
    const webhook = this.getWebhook(tableName, webhookId);

    if (!webhook || !webhook.active) {
      throw new Error('webhook not found');
    }

    const requestData = {
      type: webhook.type,
      created_at: dayjs().toISOString(),
      data: {
        base_id: this.schema.id,
        table_name: tableName,
        records: records,
      }
    };

    return await axios.request({
      method: webhook.method,
      url: webhook.endpoint,
      data: requestData,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  async touchWebhooks(tableName: string, type: WebhookType, records: any[]) {
    const webhooks = this.getWebhooks(tableName);

    const results = await Promise.allSettled(
      Object.values(webhooks || {})
        .filter(webhook => webhook.type === type)
        .map(webhook => this.touchWebhook(tableName, webhook.id, records))
    );

    const failures = results.filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected'
    );

    if (failures.length > 0) {
      throw new Error(`${failures.length} webhooks failed to execute.`);
    }
  }
}