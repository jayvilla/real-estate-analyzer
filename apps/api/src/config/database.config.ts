import { registerAs } from '@nestjs/config';

export const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'real_estate_analyzer',
  logging: process.env.NODE_ENV === 'development',
};

export default registerAs('database', () => config);
