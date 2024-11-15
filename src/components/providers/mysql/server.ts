import { databaseInspector } from "@/lib/server";
import { sutando } from "sutando";

export const name = 'mysql';

export async function testConnection(connection: any) {
  try {
    const manager = new sutando();
    const connectionInfo = {
      client: 'mysql2',
      connection: {
        host: connection.host,
        port: connection.port,
        user: connection.user,
        password: connection.password,
        database: connection.database,
        ssl: connection.ssl ? { rejectUnauthorized: false } : undefined,
      },
      userParams: Object.keys(connection.parameters).length > 0 ? connection.parameters : undefined,
    };
    
    manager.addConnection(connectionInfo);
    const db = manager.connection();
    await db.raw(`SELECT 1`);
    await db?.destroy();
    return true;
  } catch (e: any) {
    console.log(e)
    throw e;
  }
}

export async function schemaInspector(connection: any) {
  return await databaseInspector('mysql', sutandoConfig(connection));
}

export function sutandoConfig(connection: any) {
  return {
    client: 'mysql2',
    connection: {
      host: connection.host,
      port: connection.port,
      user: connection.user,
      password: connection.password,
      database: connection.database,
      ssl: connection.ssl ? { rejectUnauthorized: false } : undefined,
    },
    userParams: Object.keys(connection.parameters).length > 0 ? connection.parameters : undefined,
  };
}

export function formValuesToConnection(values: any) {

}