import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoringService } from './scoring.service';
import { ScoringController } from './scoring.controller';
import { DealScoreEntity } from './entities/deal-score.entity';
import { ScoringConfigurationEntity } from './entities/scoring-configuration.entity';
import { DealModule } from '../deal/deal.module';
import { ValuationModule } from '../valuation/valuation.module';
import { LoggingModule } from '../common/logging/logging.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DealScoreEntity, ScoringConfigurationEntity]),
    forwardRef(() => DealModule), // Use forwardRef to avoid circular dependency
    forwardRef(() => ValuationModule), // Use forwardRef to avoid circular dependency
    LoggingModule,
  ],
  controllers: [ScoringController],
  providers: [ScoringService],
  exports: [ScoringService],
})
export class ScoringModule {}

