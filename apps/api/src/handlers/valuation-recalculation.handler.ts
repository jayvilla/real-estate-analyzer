import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ValuationRecalculationRequestedEvent } from '../events/valuation-recalculation-requested.event';
import { StructuredLoggerService } from '../common/logging/structured-logger.service';
import { EventStoreService } from '../common/event-store/event-store.service';
import { ValuationService } from '../valuation/valuation.service';
import { DealService } from '../deal/deal.service';
import { ValuationCompletedEvent } from '../events/valuation-completed.event';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * Handler for ValuationRecalculationRequested events
 * Performs async valuation recalculation and emits completion event
 */
@Injectable()
export class ValuationRecalculationHandler {
  constructor(
    private readonly logger: StructuredLoggerService,
    private readonly eventStore: EventStoreService,
    private readonly valuationService: ValuationService,
    private readonly dealService: DealService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  @OnEvent('valuation.recalculation.requested')
  async handleValuationRecalculation(
    event: ValuationRecalculationRequestedEvent
  ): Promise<void> {
    // Idempotency check
    if (this.eventStore.hasBeenProcessed(event.eventId)) {
      this.logger.warn(
        `ValuationRecalculationRequested event already processed: ${event.eventId}`,
        'ValuationRecalculationHandler',
        { eventId: event.eventId }
      );
      return;
    }

    try {
      this.logger.logWithMetadata(
        'info',
        `Handling valuation recalculation request for property ${event.propertyId}`,
        {
          eventId: event.eventId,
          propertyId: event.propertyId,
          dealId: event.dealId,
          reason: event.reason,
          correlationId: event.correlationId,
        },
        'ValuationRecalculationHandler'
      );

      // Mark event as processed
      this.eventStore.markAsProcessed(event);

      // Perform async recalculation
      if (event.dealId) {
        // Recalculate specific deal
        const deal = await this.dealService.findOne(event.dealId);
        const valuation = this.valuationService.calculateDealValuation(deal);

        // Emit completion event
        const completionEvent = new ValuationCompletedEvent(
          event.propertyId,
          event.dealId,
          valuation,
          undefined,
          event.correlationId
        );

        this.eventEmitter.emit('valuation.completed', completionEvent);

        this.logger.logWithMetadata(
          'info',
          `Valuation recalculation completed for deal ${event.dealId}`,
          {
            dealId: event.dealId,
            propertyId: event.propertyId,
            capRate: valuation.capRate.capRate,
            cashOnCashReturn: valuation.returns.cashOnCashReturn,
            completionEventId: completionEvent.eventId,
          },
          'ValuationRecalculationHandler'
        );
      } else {
        // Recalculate all deals for property
        const deals = await this.dealService.findByPropertyId(event.propertyId);
        
        if (deals.length === 0) {
          this.logger.warn(
            `No deals found for property ${event.propertyId}, skipping recalculation`,
            'ValuationRecalculationHandler',
            { propertyId: event.propertyId }
          );
          return;
        }

        // Calculate valuations for all deals
        const valuations = deals.map((deal) =>
          this.valuationService.calculateDealValuation(deal)
        );

        // Emit completion event for property-level valuation
        const completionEvent = new ValuationCompletedEvent(
          event.propertyId,
          undefined,
          undefined, // Property-level valuation would be calculated separately
          undefined,
          event.correlationId
        );

        this.eventEmitter.emit('valuation.completed', completionEvent);

        this.logger.logWithMetadata(
          'info',
          `Valuation recalculation completed for property ${event.propertyId} (${deals.length} deals)`,
          {
            propertyId: event.propertyId,
            dealsCount: deals.length,
            completionEventId: completionEvent.eventId,
          },
          'ValuationRecalculationHandler'
        );
      }
    } catch (error) {
      this.logger.error(
        `Error handling valuation recalculation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'ValuationRecalculationHandler',
        {
          eventId: event.eventId,
          propertyId: event.propertyId,
          dealId: event.dealId,
        }
      );
    }
  }
}

