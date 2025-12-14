import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DealService } from './deal.service';
import { DealController } from './deal.controller';
import { DealEntity } from './entities/deal.entity';
import { PropertyModule } from '../property/property.module';
import { ScoringModule } from '../scoring/scoring.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DealEntity]),
    PropertyModule,
    forwardRef(() => ScoringModule), // Use forwardRef to avoid circular dependency
  ],
  controllers: [DealController],
  providers: [DealService],
  exports: [DealService],
})
export class DealModule {}

