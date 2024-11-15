import * as MysqlProvider from './mysql';
import * as PostgresProvider from './postgres';
import * as SqliteProvider from './sqlite';

export const baseProviders: Record<string, ProviderType> = {};

export function registerProvider(provider: ProviderType) {
  const disabled = process.env.NEXT_PUBLIC_DISABLE_PROVIDERS?.split(',').includes(provider.name);
  console.log(`Registering provider`, process.env.NEXT_PUBLIC_DISABLE_PROVIDERS?.split(','), provider.name, disabled);
  if (disabled) {
    return;
  }
  baseProviders[provider.name] = provider;
}

export function getBaseProvider(key: string) {
  return baseProviders[key];
}

export function getBaseProviderLabel(key: string) {
  return baseProviders[key].label;
}

export function ProviderIcon({ name, ...props }: IconProps & {
  name: string;
}) {
  const baseProvider = baseProviders[name];

  if (baseProvider?.Icon) {
    return <baseProvider.Icon {...props} />;
  } else {
    return null;
  }
}

export function ProviderConnectionEditor({ name, ...props }: ConnectionEditorProps & {
  name: string;
}) {
  const baseProvider = baseProviders[name];

  if (baseProvider?.ConnectionEditor) {
    return <baseProvider.ConnectionEditor {...props} />;
  } else {
    return null;
  }
}

export function getProviderDefaultValues(name: string) {
  const baseProvider = baseProviders[name];
  if (!baseProvider) {
    return {};
  }

  return baseProvider.defaultValues;
}

export function connectionToFormValues({ name, connection }: { name: string, connection: any }) {
  const baseProvider = baseProviders[name];
  if (!baseProvider || baseProvider.connectionToFormValues === undefined) {
    return connection;
  }

  return baseProvider.connectionToFormValues(connection);
}

registerProvider(MysqlProvider);
registerProvider(PostgresProvider);
registerProvider(SqliteProvider);