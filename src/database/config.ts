import { env } from "@/lib/env";
import { APP_NAME } from "@/lib/utils";

const connections = {
  sqlite: {
    client: 'sqlite3',
    connection: {
      filename: env.DB_DATABASE as string,
    },
    useNullAsDefault: true,
  },
  mysql: {
    client: 'mysql2',
    connection: {
      host: env.DB_HOST as string,
      user: env.DB_USERNAME as string,
      password: env.DB_PASSWORD as string,
      database: env.DB_DATABASE as string,
    }
  },
  postgres: {
    client: 'pg',
    connection: {
      host: env.DB_HOST as string,
      user: env.DB_USERNAME as string,
      password: env.DB_PASSWORD as string,
      database: env.DB_DATABASE as string,
    }
  }
};

type DatabaseConfig = {
  client: string;
  connection: any;
}

const config: DatabaseConfig = connections[env.DB_DRIVER as keyof typeof connections] ?? {
  client: 'sqlite3',
  connection: {
    filename: `./${APP_NAME}.sqlite`,
  }
};

export default config;