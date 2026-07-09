import knex, { Knex } from 'knex';
import envConfig from './env';

const isConnectionString =
  envConfig.DB_HOST.startsWith('postgres://') ||
  envConfig.DB_HOST.startsWith('postgresql://');

const db: Knex = knex({
  client: 'pg',
  connection: isConnectionString
    ? {
        connectionString: envConfig.DB_HOST,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: envConfig.DB_HOST,
        port: envConfig.DB_PORT,
        database: envConfig.DB_NAME,
        user: envConfig.DB_USER,
        password: envConfig.DB_PASSWORD,
      },
  pool: {
    min: 2,
    max: 10,
  },
});

export default db;

