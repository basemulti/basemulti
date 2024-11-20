import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { NavItem } from "@/types";
import { customAlphabet } from 'nanoid';
import type { RoleType } from "./types";
import packageJson from '@/../package.json';

export const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 16);

export const APP_NAME = 'basemulti';
export function appString(s?: string) {
  return s ? `${APP_NAME}_${s}` : APP_NAME;
}

export const selectId = appString("table_select");
export const systemFields = [selectId, 'created_by', 'updated_by', 'created_at', 'updated_at'];
export function isSystemField(field: string) {
  return systemFields.includes(field);
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms) && console.log(`slept for ${ms}ms`));

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function randomString(len = 16) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < len; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export function isNumberType(type: string) {
  // 使用正则表达式匹配'int', 'tinyint', 'bigint'等类型
  const numberTypes = /^(number|tinyint|smallint|mediumint|int|bigint|float|double|decimal|numeric|real)/i;
  return numberTypes.test(type);
}

export function simpleClone(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

export function formatWithCommas(number: number) {
  return new Intl.NumberFormat().format(number);
}

export function getDefaultUItype(type: string) {
  switch (true) {
    case ['bool', 'boolean'].includes(type):
      return "switch";
    case (['int', 'decimal'].includes(type) || type?.startsWith('bigint')):
      return "number";
    case (['datetime', 'timestamp'].includes(type)):
      return "datetime";
    case (['date'].includes(type)):
      return "date";
    case (['text'].includes(type)):
      return "textarea";
    default:
      return "string";
  }
}

export function getModelSidebar(schema: any): NavItem[] {
  return Object.keys(schema?.tables)?.map((tableName: any) => {
    return {
      title: schema.tables?.[tableName]?.label || tableName,
      href: `/bases/${schema?.name}/tables/${tableName}`,
      icon: "list",
      label: schema.tables?.[tableName]?.label || tableName,
    }
  }) || [];
}

export function sortObjectByKeys(obj: Record<string, any>, keys: string[]) {
  let sortedObj: Record<string, any> = {};
  keys.forEach(key => {
    if (obj.hasOwnProperty(key)) {
      sortedObj[key] = obj[key];
    }
  });
  return sortedObj;
}

export interface ConnectionObject {
  host: string;
  port: string;
  database: string;
  user: string;
  password: string;
  ssl: boolean;
  parameters?: Record<string, string>;
}

export function parsePostgresConnectionString(connectionString: string): ConnectionObject | null {
  const protocolEnd = connectionString.indexOf("://");
  if (protocolEnd < 0) return null;

  const protocol = connectionString.slice(0, protocolEnd);
  if (protocol !== "postgresql") return null;

  const authEnd = connectionString.indexOf("@");
  if (authEnd < 0 || authEnd <= protocolEnd) return null;

  const auth = connectionString.slice(protocolEnd + 3, authEnd).split(":");
  if (auth.length !== 2) return null;

  const [user, password] = auth.map(decodeURIComponent);

  const pathStart = connectionString.indexOf("/", authEnd) + 1;
  if (pathStart <= 0 || pathStart <= authEnd) return null;

  const hostAndPort = connectionString.slice(authEnd + 1, pathStart - 1).split(":");
  if (hostAndPort.length !== 2) return null;

  const [host, port] = hostAndPort;
  
  const paramsStart = connectionString.indexOf("?", pathStart);
  const databaseEnd = paramsStart >= 0 ? paramsStart : connectionString.length;
  const database = decodeURIComponent(connectionString.slice(pathStart, databaseEnd));

  let params: Record<string, string> = {};
  let ssl: boolean = false;
  if (paramsStart >= 0) {
    const paramsString = connectionString.slice(paramsStart + 1);
    params = paramsString.split("&").reduce((obj, pair) => {
      const [key, value] = pair.split("=").map(decodeURIComponent);
      obj[key] = value;
      return obj;
    }, {} as Record<string, string>);

    ssl = params.ssl === "true" ? true : false;
    delete params.ssl;
  }

  const connectionObject: ConnectionObject = {
    host,
    port,
    database,
    user,
    password,
    ssl,
    parameters: params,
  };

  return connectionObject;
}

export function parseMySqlConnectionString(connectionString: string): ConnectionObject | null {
  const protocolEnd = connectionString.indexOf("://");
  if (protocolEnd < 0) return null;

  const protocol = connectionString.slice(0, protocolEnd);
  if (protocol !== "mysql") return null;

  const authEnd = connectionString.indexOf("@");
  if (authEnd < 0 || authEnd <= protocolEnd) return null;

  const auth = connectionString.slice(protocolEnd + 3, authEnd).split(":");
  if (auth.length !== 2) return null;

  const [user, password] = auth.map(decodeURIComponent);

  const pathStart = connectionString.indexOf("/", authEnd) + 1;
  if (pathStart <= 0 || pathStart <= authEnd) return null;

  const hostAndPort = connectionString.slice(authEnd + 1, pathStart - 1).split(":");
  if (hostAndPort.length !== 2) return null;

  const [host, port] = hostAndPort;

  const database = decodeURIComponent(connectionString.slice(pathStart));

  const connectionObject: ConnectionObject = {
    host,
    port,
    database,
    user,
    password,
    ssl: false, // MySQL 连接字符串通常不包含 SSL 信息
  };

  return connectionObject;
}

export function generateId(prefix: string = '') {
  return prefix + nanoid();
}

export const rolesMap: Record<RoleType, string[]> = {
  owner: [
    'workspace:create', 'workspace:update', 'workspace:read', 'workspace:delete', 'workspace:grant_role', 'workspace:invite_link',
    'base:read', 'base:create', 'base:update', 'base:delete',
    'table:create', 'table:read', 'table:update', 'table:delete',
    'field:create', 'field:read', 'field:update', 'field:delete',
    'webhook:create', 'webhook:update', 'webhook:delete', 'webhook:touch',
    'view:create', 'view:read', 'view:update', 'view:delete',
    'record:create', 'record:read', 'record:update', 'record:delete'
  ],
  creator: [
    'workspace:create', 'workspace:invite_link',
    'base:read', 'base:create', 'base:update', 'base:delete',
    'table:create', 'table:read', 'table:update', 'table:delete',
    'field:create', 'field:read', 'field:update', 'field:delete',
    'webhook:create', 'webhook:update', 'webhook:delete', 'webhook:touch',
    'view:create', 'view:read', 'view:update', 'view:delete',
    'record:create', 'record:read', 'record:update', 'record:delete'
  ],
  editor: [
    'workspace:read', 
    'base:read',
    'table:read',
    'field:read',
    'webhook:touch',
    'view:create', 'view:read', 'view:update', 'view:delete',
    'record:create', 'record:read', 'record:update', 'record:delete'
  ],
  viewer: [
    'workspace:read',
    'base:read',
    'table:read',
    'field:read',
    'view:read', 
    'record:read'
  ],
  'no-access': [
    'workspace:read',
  ],
};

export function getRole(roleName: RoleType) {
  return {
    role: roleName,
    abilities: rolesMap[roleName],
  };
}

export function allows(roleName: RoleType, ability: string | string[], all: boolean = true) {
  const role = getRole(roleName);
  return role && (Array.isArray(ability)
      ? (all ? ability.every(a => role.abilities.includes(a)) : ability.some(a => role.abilities.includes(a)))
      : role.abilities.includes(ability));
}

export function denies(roleName: RoleType, ability: string | string[]) {
  return allows(roleName, ability) === false;
}

export function getInitials(name: string | undefined): string {
  if (name === undefined || name.length === 0) {
    return '';
  }

  const parts = name.split(' ');
  const initials = parts.map(part => part.charAt(0)).join('');
  return initials;
}

export function version() {
  return packageJson.version;
}

export function url(path: string) {
  return process.env.NEXT_PUBLIC_URL + '/' + path;
}

export const roleLevels: Record<RoleType, number> = {
  owner: 100,
  creator: 90,
  editor: 80,
  viewer: 70,
  'no-access': 0,
};