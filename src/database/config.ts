import { APP_NAME } from "@/lib/utils";

const connections = {
  sqlite: {
    client: 'sqlite3',
    connection: {
      filename: process.env.DB_DATABASE as string,
    },
    useNullAsDefault: true,
  },
  mysql: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST as string,
      user: process.env.DB_USERNAME as string,
      password: process.env.DB_PASSWORD as string,
      database: process.env.DB_DATABASE as string,
    }
  },
  postgres: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST as string,
      user: process.env.DB_USERNAME as string,
      password: process.env.DB_PASSWORD as string,
      database: process.env.DB_DATABASE as string,
    }
  }
};

type DatabaseConfig = {
  client: string;
  connection: any;
}

const config: DatabaseConfig = connections[process.env.DB_DRIVER as keyof typeof connections] ?? {
  client: 'sqlite3',
  connection: {
    filename: `./${APP_NAME}.sqlite`,
  }
};

export default config;