import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ValuationRequestedEvent } from '../events/valuation-requested.event';
import { ValuationCompletedEvent } from '../events/valuation-completed.event';
import { StructuredLoggerService } from '../common/logging/structured-logger.service';
import { EventStoreService } from '../common/event-store/event-store.service';
import { ValuationService } from '../valuation/valuation.service';
import { PropertyService } from '../property/property.service';
import { DealService } from '../deal/deal.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * Saga/Workflow for handling property valuation requests
 * Implements a multi-step workflow orchestration pattern
 */
@Injectable()
export class ValuationSaga {
  constructor(
    private readonly logger: StructuredLoggerService,
    private readonly eventStore: EventStoreService,
    private readonly valuationService: ValuationService,
    private readonly propertyService: PropertyService,
    private readonly dealService: DealService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  @OnEvent('valuation.requested')
  async handleValuationRequested(event: ValuationRequestedEvent): Promise<void> {
    // Idempotency check
    if (this.eventStore.hasBeenProcessed(event.eventId)) {
      this.logger.warn(
        `ValuationRequested event already processed: ${event.eventId}`,
        'ValuationSaga',
        { eventId: event.eventId }
      );
      return;
    }

    try {
      this.logger.logWithMetadata(
        'info',
        `Starting valuation workflow for property ${event.propertyId}`,
        {
          eventId: event.eventId,
          propertyId: event.propertyId,
          requestedBy: event.requestedBy,
          correlationId: event.correlationId,
        },
        'ValuationSaga'
      );

      // Mark event as processed
      this.eventStore.markAsProcessed(event);

      // Step 1: Fetch property data
      this.logger.log(
        `Step 1: Fetching property data for ${event.propertyId}`,
        'ValuationSaga'
      );
      const property = await this.propertyService.findOne(event.propertyId);

      // Step 2: Fetch associated deals
      this.logger.log(
        `Step 2: Fetching deals for property ${event.propertyId}`,
        'ValuationSaga'
      );
      const deals = await this.dealService.findByPropertyId(event.propertyId);

      if (deals.length === 0) {
        this.logger.warn(
          `No deals found for property ${event.propertyId}, workflow complete`,
          'ValuationSaga',
          { propertyId: event.propertyId }
        );
        return;
      }

      // Step 3: Calculate valuations for all deals
      this.logger.log(
        `Step 3: Calculating valuations for ${deals.length} deal(s)`,
        'ValuationSaga'
      );
      const valuations = deals.map((deal) =>
        this.valuationService.calculateDealValuation(deal)
      );

      // Step 4: Emit completion event for each deal
      this.logger.log(
        `Step 4: Emitting completion events`,
        'ValuationSaga'
      );
      for (const valuation of valuations) {
        const completionEvent = new ValuationCompletedEvent(
          event.propertyId,
          valuation.dealId,
          valuation,
          undefined,
          event.correlationId
        );

        this.eventEmitter.emit('valuation.completed', completionEvent);
      }

      // Step 5: Workflow complete
      this.logger.logWithMetadata(
        'info',
        `Valuation workflow completed for property ${event.propertyId}`,
        {
          propertyId: event.propertyId,
          dealsProcessed: deals.length,
        },
        'ValuationSaga'
      );
    } catch (error) {
      this.logger.error(
        `Error in valuation workflow: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'ValuationSaga',
        {
          eventId: event.eventId,
          propertyId: event.propertyId,
        }
      );
    }
  }
}

