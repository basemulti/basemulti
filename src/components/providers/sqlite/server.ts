import { databaseInspector } from "@/lib/server";
import { sutando } from "sutando";

export const name = 'sqlite';

export async function testConnection(connection: any) {
  if (connection?.filename === ':memory:') {
    throw new Error('SQLite in-memory databases are not supported');
  }

  try {
    const manager = new sutando();
    const connectionInfo = {
      client: 'sqlite3',
      connection: {
        filename: connection.filename,
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
  return await databaseInspector('sqlite', sutandoConfig(connection));
}

export function sutandoConfig(connection: any) {
  return {
    client: 'sqlite3',
    connection: {
      filename: connection.filename,
    },
    useNullAsDefault: true,
  };
}