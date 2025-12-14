import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationEntity } from './entities/organization.entity';
import { OrganizationService } from './organization.service';
import { LoggingModule } from '../common/logging/logging.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrganizationEntity]),
    LoggingModule,
  ],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}

