import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PropertyCreatedEvent } from '../events/property-created.event';
import { StructuredLoggerService } from '../common/logging/structured-logger.service';
import { EventStoreService } from '../common/event-store/event-store.service';
import { ValuationRequestedEvent } from '../events/valuation-requested.event';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * Handler for PropertyCreated events
 * Demonstrates event-driven workflow: property creation triggers initial valuation
 */
@Injectable()
export class PropertyCreatedHandler {
  constructor(
    private readonly logger: StructuredLoggerService,
    private readonly eventStore: EventStoreService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  @OnEvent('property.created')
  async handlePropertyCreated(event: PropertyCreatedEvent): Promise<void> {
    // Idempotency check
    if (this.eventStore.hasBeenProcessed(event.eventId)) {
      this.logger.warn(
        `PropertyCreated event already processed: ${event.eventId}`,
        'PropertyCreatedHandler',
        { eventId: event.eventId }
      );
      return;
    }

    try {
      this.logger.logWithMetadata(
        'info',
        `Handling PropertyCreated event for property ${event.propertyId}`,
        {
          eventId: event.eventId,
          propertyId: event.propertyId,
          address: event.property.address,
          correlationId: event.correlationId,
        },
        'PropertyCreatedHandler'
      );

      // Mark event as processed
      this.eventStore.markAsProcessed(event);

      // Example workflow: Auto-request initial valuation for new properties
      // This demonstrates event chaining in a saga pattern
      const valuationEvent = new ValuationRequestedEvent(
        event.propertyId,
        'system',
        undefined,
        event.correlationId
      );

      this.eventEmitter.emit('valuation.requested', valuationEvent);

      this.logger.logWithMetadata(
        'info',
        `Triggered initial valuation request for property ${event.propertyId}`,
        {
          propertyId: event.propertyId,
          valuationEventId: valuationEvent.eventId,
        },
        'PropertyCreatedHandler'
      );
    } catch (error) {
      this.logger.error(
        `Error handling PropertyCreated event: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'PropertyCreatedHandler',
        {
          eventId: event.eventId,
          propertyId: event.propertyId,
        }
      );
      // Don't rethrow - event handlers should be fault-tolerant
    }
  }
}

