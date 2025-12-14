import { Injectable } from '@nestjs/common';
import { BaseEvent } from '../../events/base-event';
import { StructuredLoggerService } from '../logging/structured-logger.service';

/**
 * Event Store Service for idempotent event processing
 * Tracks processed events to prevent duplicate processing
 */
@Injectable()
export class EventStoreService {
  private readonly processedEvents = new Set<string>();
  private readonly eventHistory: Map<string, BaseEvent> = new Map();

  constructor(private readonly logger: StructuredLoggerService) {}

  /**
   * Check if an event has already been processed (idempotency check)
   */
  hasBeenProcessed(eventId: string): boolean {
    return this.processedEvents.has(eventId);
  }

  /**
   * Mark an event as processed
   */
  markAsProcessed(event: BaseEvent): void {
    this.processedEvents.add(event.eventId);
    this.eventHistory.set(event.eventId, event);

    this.logger.logWithMetadata(
      'info',
      `Event marked as processed: ${event.eventId}`,
      {
        eventId: event.eventId,
        eventType: event.constructor.name,
        timestamp: event.timestamp.toISOString(),
      },
      'EventStoreService'
    );
  }

  /**
   * Get event history for debugging/auditing
   */
  getEventHistory(eventId: string): BaseEvent | undefined {
    return this.eventHistory.get(eventId);
  }

  /**
   * Clear processed events (useful for testing or reset)
   */
  clearProcessedEvents(): void {
    this.processedEvents.clear();
    this.eventHistory.clear();
    this.logger.log('Event store cleared', 'EventStoreService');
  }

  /**
   * Get count of processed events
   */
  getProcessedCount(): number {
    return this.processedEvents.size;
  }
}

