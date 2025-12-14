import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DealCreatedEvent } from '../events/deal-created.event';
import { StructuredLoggerService } from '../common/logging/structured-logger.service';
import { EventStoreService } from '../common/event-store/event-store.service';
import { ValuationRecalculationRequestedEvent } from '../events/valuation-recalculation-requested.event';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * Handler for DealCreated events
 * Triggers valuation recalculation when a new deal is created
 */
@Injectable()
export class DealCreatedHandler {
  constructor(
    private readonly logger: StructuredLoggerService,
    private readonly eventStore: EventStoreService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  @OnEvent('deal.created')
  async handleDealCreated(event: DealCreatedEvent): Promise<void> {
    // Idempotency check
    if (this.eventStore.hasBeenProcessed(event.eventId)) {
      this.logger.warn(
        `DealCreated event already processed: ${event.eventId}`,
        'DealCreatedHandler',
        { eventId: event.eventId }
      );
      return;
    }

    try {
      this.logger.logWithMetadata(
        'info',
        `Handling DealCreated event for deal ${event.dealId}`,
        {
          eventId: event.eventId,
          dealId: event.dealId,
          propertyId: event.propertyId,
          purchasePrice: event.deal.purchasePrice,
          correlationId: event.correlationId,
        },
        'DealCreatedHandler'
      );

      // Mark event as processed
      this.eventStore.markAsProcessed(event);

      // Trigger valuation recalculation for the property
      const recalculationEvent = new ValuationRecalculationRequestedEvent(
        event.propertyId,
        event.dealId,
        'deal_created',
        undefined,
        event.correlationId
      );

      this.eventEmitter.emit('valuation.recalculation.requested', recalculationEvent);

      this.logger.logWithMetadata(
        'info',
        `Triggered valuation recalculation for property ${event.propertyId} due to new deal`,
        {
          propertyId: event.propertyId,
          dealId: event.dealId,
          recalculationEventId: recalculationEvent.eventId,
        },
        'DealCreatedHandler'
      );
    } catch (error) {
      this.logger.error(
        `Error handling DealCreated event: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'DealCreatedHandler',
        {
          eventId: event.eventId,
          dealId: event.dealId,
        }
      );
    }
  }
}

