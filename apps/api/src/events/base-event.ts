/**
 * Base event class for all domain events
 * Provides idempotency support through event IDs
 */
export abstract class BaseEvent {
  public readonly eventId: string;
  public readonly timestamp: Date;
  public readonly correlationId?: string;

  constructor(
    eventId?: string,
    correlationId?: string
  ) {
    this.eventId = eventId || this.generateEventId();
    this.timestamp = new Date();
    this.correlationId = correlationId;
  }

  private generateEventId(): string {
    return `${this.constructor.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

