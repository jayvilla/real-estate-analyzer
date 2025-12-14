import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DealService } from './deal.service';
import { DealController } from './deal.controller';
import { DealEntity } from './entities/deal.entity';
import { PropertyModule } from '../property/property.module';

@Module({
  imports: [TypeOrmModule.forFeature([DealEntity]), PropertyModule],
  controllers: [DealController],
  providers: [DealService],
  exports: [DealService],
})
export class DealModule {}

