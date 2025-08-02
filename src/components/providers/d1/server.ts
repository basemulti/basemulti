import { databaseInspector } from "@/lib/server";
import ClientD1 from 'knex-cloudflare-d1';
import RemoteClient from 'knex-cloudflare-d1/remote-client';
import { sutando } from "sutando";

export const name = 'd1';

export async function testConnection(connection: any) {
  const DB = new RemoteClient({
    accountId: connection.accountId,
    databaseId: connection.databaseId,
    apiToken: connection.apiToken,
  });

  try {
    const manager = new sutando();
    const connectionInfo = {
      client: ClientD1,
      connection: {
        database: DB,
      },
    };
    
    manager.addConnection(connectionInfo);
    const db = manager.connection();
    await db.raw(`SELECT 1`);
    await db?.destroy();
    return true;
  } catch (e: any) {
    throw e;
  }
}

export async function schemaInspector(connection: any) {
  return await databaseInspector('d1', sutandoConfig(connection), 'sqlite');
}

export function sutandoConfig(connection: any) {
  const DB = new RemoteClient({
    accountId: connection.accountId,
    databaseId: connection.databaseId,
    apiToken: connection.apiToken,
  });

  return {
    client: ClientD1,
    connection: {
      database: DB,
    },
    useNullAsDefault: true,
  };
}