import { Module } from '@nestjs/common';
import { PropertyCreatedHandler } from './property-created.handler';
import { DealCreatedHandler } from './deal-created.handler';
import { DealUpdatedHandler } from './deal-updated.handler';
import { ValuationRecalculationHandler } from './valuation-recalculation.handler';
import { AnalyticsCacheInvalidationHandler } from './analytics-cache-invalidation.handler';
import { ValuationModule } from '../valuation/valuation.module';
import { DealModule } from '../deal/deal.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { EventStoreModule } from '../common/event-store/event-store.module';

@Module({
  imports: [ValuationModule, DealModule, AnalyticsModule, EventStoreModule],
  providers: [
    PropertyCreatedHandler,
    DealCreatedHandler,
    DealUpdatedHandler,
    ValuationRecalculationHandler,
    AnalyticsCacheInvalidationHandler,
  ],
})
export class HandlersModule {}

