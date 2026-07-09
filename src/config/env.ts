import dotenv from 'dotenv';

dotenv.config();

interface IEnvConfig {
  SERVER_PORT: number;
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  UPLOAD_PATH: string;
  BCRYPT_SALT_ROUNDS: number;
  NODE_ENV: string;
}

const envConfig: IEnvConfig = {
  SERVER_PORT: Number(process.env.SERVER_PORT) || 5000,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: Number(process.env.DB_PORT) || 5432,
  DB_NAME: process.env.DB_NAME || 'hr_management',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
  JWT_SECRET: process.env.JWT_SECRET || 'default_jwt_secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30d',
  UPLOAD_PATH: process.env.UPLOAD_PATH || 'uploads',
  BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
  NODE_ENV: process.env.NODE_ENV || 'development',
};

export default envConfig;
