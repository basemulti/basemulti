export type RoleType = 'owner' | 'creator' | 'editor' | 'viewer' | 'no-access';
export type WebhookType = 'record.create' | 'record.update' | 'record.delete' | 'action' | 'bulk-action';

export type Role = {
  role: RoleType;
  abilities: string[];
};

export type WorkspaceType = {
  id: string;
  label: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export type BaseType = {
  id: string;
  workspace_id: string;
  label: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export type OptionType = {
  label: string;
  value: string;
  color?: string;
};

export type OptionsType = OptionType[];

export type DatabaseProviderType = 'postgres' | 'mysql' | 'sqlite';
export type ProviderType = 'default' | DatabaseProviderType;

export type ConnectionType = {
  provider: ProviderType;
  connection: any;
};