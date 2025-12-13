import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from '../config/database.config';
import { typeormConfig } from '../config/typeorm.datasource';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRoot({
      ...typeormConfig,
      autoLoadEntities: true,
    }),
  ],
})
export class DatabaseModule {}


