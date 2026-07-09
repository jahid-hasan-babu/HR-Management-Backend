import dotenv from 'dotenv';
import type { Knex } from 'knex';
import path from 'path';

dotenv.config();

const dbHost = process.env.DB_HOST || 'localhost';
const isConnectionString =
  dbHost.startsWith('postgres://') || dbHost.startsWith('postgresql://');

const connectionConfig = isConnectionString
  ? {
      connectionString: dbHost,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: dbHost,
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'hr_management',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    };

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: connectionConfig,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: path.resolve(__dirname, 'src', 'database', 'migrations'),
      extension: 'ts',
    },
    seeds: {
      directory: path.resolve(__dirname, 'src', 'database', 'seeds'),
      extension: 'ts',
    },
  },

  production: {
    client: 'pg',
    connection: connectionConfig,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: path.resolve(__dirname, 'src', 'database', 'migrations'),
      extension: 'ts',
    },
    seeds: {
      directory: path.resolve(__dirname, 'src', 'database', 'seeds'),
      extension: 'ts',
    },
  },
};

export default config;

