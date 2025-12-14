import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsCacheService } from './cache/analytics-cache.service';
import { PropertyModule } from '../property/property.module';
import { DealModule } from '../deal/deal.module';
import { ValuationModule } from '../valuation/valuation.module';

@Module({
  imports: [PropertyModule, DealModule, ValuationModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsCacheService],
  exports: [AnalyticsService, AnalyticsCacheService],
})
export class AnalyticsModule {}

