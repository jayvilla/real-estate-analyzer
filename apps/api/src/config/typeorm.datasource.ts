import { DataSourceOptions } from 'typeorm';
import { config } from './database.config';

export const typeormConfig: DataSourceOptions = {
  type: 'postgres',
  host: config.host,
  port: config.port,
  username: config.username,
  password: config.password,
  database: config.database,
  synchronize: false, // Always use migrations
  logging: config.logging,
  // Entities and migrations are handled by TypeOrmModule.forRoot with autoLoadEntities
};
