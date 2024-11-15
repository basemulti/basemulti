// Update with your config settings.
require('dotenv').config({ path: ['.env.local', '.env'] });

const connections = {
  sqlite: {
    client: 'sqlite3',
    connection: {
      filename: process.env.DB_DATABASE,
    },
    useNullAsDefault: true,
  },
  mysql: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    }
  },
  postgres: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    }
  }
};

const config = connections[process.env.DB_DRIVER] ?? {
  client: 'sqlite3',
  connection: {
    filename: process.env.DB_DATABASE,
  },
  useNullAsDefault: true,
};

module.exports = {
  ...config,
  migrations: {
    table: 'migrations',
    path: './src/database/migrations',
  },
  models: {
    path: './src/database/models'
  }
};
