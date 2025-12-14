import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DealUpdatedEvent } from '../events/deal-updated.event';
import { StructuredLoggerService } from '../common/logging/structured-logger.service';
import { EventStoreService } from '../common/event-store/event-store.service';
import { ValuationRecalculationRequestedEvent } from '../events/valuation-recalculation-requested.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AnalyticsCacheService } from '../analytics/cache/analytics-cache.service';

/**
 * Handler for DealUpdated events
 * Triggers valuation recalculation when deal financials change
 */
@Injectable()
export class DealUpdatedHandler {
  constructor(
    private readonly logger: StructuredLoggerService,
    private readonly eventStore: EventStoreService,
    private readonly eventEmitter: EventEmitter2,
    private readonly cacheService: AnalyticsCacheService
  ) {}

  @OnEvent('deal.updated')
  async handleDealUpdated(event: DealUpdatedEvent): Promise<void> {
    // Idempotency check
    if (this.eventStore.hasBeenProcessed(event.eventId)) {
      this.logger.warn(
        `DealUpdated event already processed: ${event.eventId}`,
        'DealUpdatedHandler',
        { eventId: event.eventId }
      );
      return;
    }

    try {
      // Check if financial fields changed (these affect valuation)
      const financialFields = [
        'purchasePrice',
        'loanAmount',
        'interestRate',
        'loanTerm',
        'monthlyRentalIncome',
        'annualRentalIncome',
        'monthlyExpenses',
        'annualExpenses',
        'vacancyRate',
        'propertyManagementRate',
      ];

      const hasFinancialChanges = financialFields.some(
        (field) => event.previousValues[field] !== undefined
      );

      this.logger.logWithMetadata(
        'info',
        `Handling DealUpdated event for deal ${event.dealId}`,
        {
          eventId: event.eventId,
          dealId: event.dealId,
          propertyId: event.propertyId,
          hasFinancialChanges,
          changedFields: Object.keys(event.previousValues),
          correlationId: event.correlationId,
        },
        'DealUpdatedHandler'
      );

      // Mark event as processed
      this.eventStore.markAsProcessed(event);

      // Only trigger recalculation if financial fields changed
      if (hasFinancialChanges) {
        const recalculationEvent = new ValuationRecalculationRequestedEvent(
          event.propertyId,
          event.dealId,
          'deal_updated',
          undefined,
          event.correlationId
        );

        this.eventEmitter.emit('valuation.recalculation.requested', recalculationEvent);

        // Invalidate analytics cache
        this.cacheService.invalidatePattern('analytics:.*');

        this.logger.logWithMetadata(
          'info',
          `Triggered valuation recalculation for property ${event.propertyId} due to deal financial changes`,
          {
            propertyId: event.propertyId,
            dealId: event.dealId,
            recalculationEventId: recalculationEvent.eventId,
          },
          'DealUpdatedHandler'
        );
      } else {
        this.logger.log(
          `Deal ${event.dealId} updated but no financial changes detected, skipping recalculation`,
          'DealUpdatedHandler'
        );
      }
    } catch (error) {
      this.logger.error(
        `Error handling DealUpdated event: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'DealUpdatedHandler',
        {
          eventId: event.eventId,
          dealId: event.dealId,
        }
      );
    }
  }
}

