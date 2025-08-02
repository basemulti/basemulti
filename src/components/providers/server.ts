import * as MysqlProvider from './mysql/server';
import * as PostgresProvider from './postgres/server';
import * as SqliteProvider from './sqlite/server';
import * as D1Provider from './d1/server';

export const baseProviderActions: Record<string, ProviderActionType> = {};

export function registerBaseProviderActions(customProvider: ProviderActionType) {
  baseProviderActions[customProvider.name] = customProvider;
}

export async function testProviderConnection({ provider, connection }: { provider: string, connection: any }) {
  const providerAction = baseProviderActions[provider];
  if (!providerAction) {
    throw new Error(`Provider ${provider} not found`);
  }
  return await providerAction.testConnection(connection);
}

export function providerSchemaInspector({ provider, connection }: { provider: string, connection: any }) {
  const providerAction = baseProviderActions[provider];
  if (!providerAction) {
    throw new Error(`Provider ${provider} not found`);
  }
  return providerAction.schemaInspector(connection);
}

export function providerConfig({ provider, connection }: { provider: string, connection: any }) {
  const providerAction = baseProviderActions[provider];
  if (!providerAction) {
    throw new Error(`Provider ${provider} not found`);
  }
  return providerAction.sutandoConfig(connection);
}

registerBaseProviderActions(MysqlProvider);
registerBaseProviderActions(PostgresProvider);
registerBaseProviderActions(SqliteProvider);
registerBaseProviderActions(D1Provider);