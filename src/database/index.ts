import { sutando as Sutando, Model, Relation } from 'sutando';
import SchemaBuilder from '@/lib/schema-builder';
import config from './config';

import Workspace from './models/workspace';
import Base from './models/base';
import User from './models/user';
import Role from './models/role';
import Collaborator from './models/collaborator';
import InviteLink from './models/invite-links';
import Share from './models/share';
import Webhook from './models/webhook';
import { appString } from '@/lib/utils';
import snakeCase from "lodash/snakeCase";
import { providerConfig } from '@/components/providers/server';
import { String } from 'aws-sdk/clients/apigateway';

Sutando.addConnection(config);

export const DB = Sutando.connection();

// DB.connector.on('query', (query: any) => {
//   console.log('query => ', query)
// })

export {
  Workspace,
  Base,
  User,
  Role,
  Collaborator,
  InviteLink,
  Share,
  Webhook,
}

type Managers = Record<string, {
  client: Sutando,
  last_used_at: Date,
  disconnectTimeoutId: any
}>

// @ts-ignore
global.managers = global.managers || {};
// @ts-ignore
const { managers }: {
  managers: Managers
} = global;
// const managers: Managers = {};

const autoDisconnectTimeout = 1000 * 60 * 30;
const disconnectCallback = (schema: SchemaBuilder) => {
  return async () => {
    const manager = managers[schema.schema.id];
    await manager.client.destroyAll();
    delete managers[schema.schema.id];
  }
};

export const getModelName = (table: string) => {
  return table;
}

function getIncrementing(column: any) {
  if (!column) {
    return false;
  }

  if (column.has_auto_increment === false) {
    return false;
  }

  return true;
}

function getKeyType(column: any) {
  if (!column?.type || ['int', 'decimal'].includes(column.type) || column.type?.startsWith('bigint')) {
    return 'int';
  }

  return 'string';
}

export const getManager = (schema: SchemaBuilder) => {
  const connection = schema.schema.connection as any;
  const provider = schema.getProvider() as String;
  const managerKey = provider == 'default' ? 'default' : schema.schema.id;

  if (!managers[schema.schema.id]) {
    const manager = new Sutando();

    if (provider == 'default') {
      managers[managerKey] = {
        client: Sutando.instance as Sutando,
        last_used_at: new Date(),
        disconnectTimeoutId: null,
      }
    } else {
      const config = providerConfig({ provider, connection });
      manager.addConnection(config);

      managers[managerKey] = {
        client: manager,
        last_used_at: new Date(),
        disconnectTimeoutId: setTimeout(
          disconnectCallback(schema),
          autoDisconnectTimeout
        )
      };
    }
  }

  const managerItem  = managers[managerKey];
  managerItem.last_used_at = new Date();

  if (managerKey !== 'default') {
    clearTimeout(managerItem.disconnectTimeoutId);
    managerItem.disconnectTimeoutId = setTimeout(
      disconnectCallback(schema),
      autoDisconnectTimeout
    );
  }
  
  const manager = managerItem.client;
  manager.models = {};

  const tables = schema.get().tables as any;
  const tableNamePrefix = schema.schema.prefix ?? '';
  for (let tableName in tables) {
    const table = tables[tableName];

    const relations: Record<string, (model: Model) => Relation<Model>> = {};
    
    for (let relationName in table.relations) {
      const relation = table.relations[relationName];
      if (relation.type == 'has_one') {
        relations[relationName] = (model: Model) => model.hasOne(
          manager.models[getModelName(relation.table)],
          relation.foreign_key ?? schema.getDefaultForeignKey(tableName),
          relation.local_key ?? null,
        );
      } else if (relation.type == 'has_many') {
        relations[relationName] = (model: Model) => model.hasMany(
          manager.models[getModelName(relation.table)],
          relation.foreign_key ?? schema.getDefaultForeignKey(tableName),
          relation.local_key ?? null,
        );
      } else if (relation.type == 'belongs_to') {
        relations[relationName] = (model: Model) => model.belongsTo(
          manager.models[getModelName(relation.table)],
          relation.foreign_key ?? schema.getDefaultForeignKey(relation.table),
          relation.owner_key ?? null,
        );
      } else if (relation.type == 'belongs_to_many') {
        relations[relationName] = (model: Model) => model.belongsToMany(
          manager.models[getModelName(relation.table)],
          relation.pivot_table,
          relation.foreign_pivot_key ?? schema.getDefaultForeignKey(tableName),
          relation.related_pivot_key ?? schema.getDefaultForeignKey(relation.table),
          relation.parent_key ?? null,
          relation.related_key ?? null,
        );
      }
    }

    if (provider == 'default') {
      const userModel = snakeCase(appString('user'));
      relations['creator'] = (model: Model) => model.belongsTo(
        manager.models[userModel],
        'created_by',
      );

      relations['modifier'] = (model: Model) => model.belongsTo(
        manager.models[userModel],
        'updated_by',
      );

      manager.createModel(userModel, {
        table: `users`,
        keyType: 'string',
        primaryKey: 'id',
        incrementing: false,
      });
    }

    let createdAtColumn = null;
    let updatedAtColumn = null;
    let primaryKeyColumn = null;
    for (let fieldName in table.fields) {
      const field = table.fields[fieldName];
      if (field.is_created_at === true || field?.ui?.type == 'created-at') {
        createdAtColumn = fieldName;
      }
      if (field.is_updated_at === true || field?.ui?.type == 'updated-at') {
        updatedAtColumn = fieldName;
      }
      if (field.is_primary_key === true) {
        primaryKeyColumn = {
          ...field,
          name: fieldName,
        };
      }
    }

    const timestamps = createdAtColumn !== null || updatedAtColumn !== null;

    const options: any = {
      table: `${tableNamePrefix}${tableName}`,
      keyType: getKeyType(primaryKeyColumn),
      primaryKey: primaryKeyColumn?.name ?? null,
      incrementing: getIncrementing(primaryKeyColumn),
      properties: {},
      relations,
      timestamps: timestamps,
      CREATED_AT: createdAtColumn,
      UPDATED_AT: updatedAtColumn,
    };

    // if (provider === 'default') {
    //   options.plugins = [HasUniqueIds];
    // }

    manager.createModel(getModelName(tableName), options);

    // if (provider === 'default') {
    //   manager.models[getModelName(tableName)].prototype.newUniqueId = () => {
    //     return 'rec' + nanoid(16);
    //   }
    // }
  }

  return manager;
}

export async function removeManager(id: string) {
  const manager = managers[id];
  if (manager) {
    clearTimeout(manager.disconnectTimeoutId);
    await manager.client.destroyAll();
    delete managers[id];
  }
}
