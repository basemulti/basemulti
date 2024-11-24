import crypto from 'crypto';
import { sutando } from 'sutando';
import { schemaInspector } from '@sutando/schema-inspector';
import startCase from "lodash/startCase";
import { Share, User } from "@/database";
import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { cache } from 'react';
import { appString } from './utils';
import { env } from './env';

const key = crypto.createHash('sha256').update(env.BASEMULTI_KEY as string).digest();

export function encrypt(obj: any): string {
  let text = JSON.stringify(obj);
  let iv = crypto.randomBytes(16);
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): any {
  let textParts = text.split(':');
  // @ts-ignore
  let iv = Buffer.from(textParts.shift(), 'hex');
  let encryptedText = Buffer.from(textParts.join(':'), 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return JSON.parse(decrypted.toString());
}

export const ProviderMap = {
  mysql: 'mysql2',
  postgres: 'pg',
  sqlite: 'sqlite3',
};

export async function databaseInspector(provider: string, connection: any) {
  const manager = new sutando();
  manager.addConnection(connection);
  const inspector = schemaInspector(
    manager.connection(),
    provider
  );
  const columns = await inspector.columnInfo();
  const tableSchema: any = {};

  for (const column of columns) {
    if (!tableSchema[column.table]) {
      tableSchema[column.table] = {
        label: startCase(column.table),
        fields: {},
      }
    }
    tableSchema[column.table].fields[column.name] = {
      type: column.data_type,
    };

    if (column.is_primary_key) {
      tableSchema[column.table].fields[column.name].is_primary_key = true;
    }

    if (column.data_type === 'enum') {
      tableSchema[column.table].fields[column.name].ui = {
        type: 'select',
        enum: column?.enum_values?.map((v) => ({ label: v, value: v })),
      };
    }
  }

  const keys = await inspector.foreignKeys();
  for (const key of keys) {
    if (!tableSchema[key.table] || !tableSchema[key.foreign_key_table]) {
      continue;
    }

    if (!tableSchema[key.table].relations) {
      tableSchema[key.table].relations = {};
    }

    if (!tableSchema[key.foreign_key_table].relations) {
      tableSchema[key.foreign_key_table].relations = {};
    }

    tableSchema[key.table].relations[key.foreign_key_table] = {
      type: 'belongs_to',
      table: key.foreign_key_table,
      foreign_key: key.column,
    };

    tableSchema[key.foreign_key_table].relations[key.table] = {
      type: 'has_many',
      table: key.table,
      foreign_key: key.column,
    };
  }

  await manager.destroyAll();

  return {
    tables: tableSchema
  };
}

export const sessionOptions: SessionOptions = {
  password: env.BASEMULTI_KEY as string,
  cookieName: appString("cookie"),
  cookieOptions: {
    httpOnly: true,
    // secure only works in `https` environments
    // if your localhost is not on `https`, then use: `secure: env.NODE_ENV === "production"`
    secure: process.env.NODE_ENV === "production",
  },
};

type SessionData = {
  id: string;
  isLoggedIn: boolean;
}

export async function getSession() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  if (!session.isLoggedIn) {
    session.isLoggedIn = false;
    session.id = '';
  }

  return session;
}

export const getCurrentUser = cache(async () => {
  const session = await getSession();

  if (!session.isLoggedIn) {
    return null;
  }

  const user = await User.query().find(session.id);
  return user;
});

export const getUserWorkspace = cache(async (user: User | null, id: string) => {
  return await user?.getWorkspace(id);
});

export const getShare = cache(async (id: string) => {
  return await Share.query().find(id);
});
