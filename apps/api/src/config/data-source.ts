import { DataSource } from 'typeorm';
import { config } from './database.config';
import { PropertyEntity } from '../property/entities/property.entity';
import { DealEntity } from '../deal/entities/deal.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.host,
  port: config.port,
  username: config.username,
  password: config.password,
  database: config.database,
  entities: [PropertyEntity, DealEntity],
  migrations: [__dirname + '/../migrations/**/*.ts'],
  synchronize: false,
  logging: config.logging,
});

