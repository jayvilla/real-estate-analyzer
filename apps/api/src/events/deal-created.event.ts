import { BaseEvent } from './base-event';
import { DealEntity } from '../deal/entities/deal.entity';

export class DealCreatedEvent extends BaseEvent {
  constructor(
    public readonly dealId: string,
    public readonly propertyId: string,
    public readonly deal: DealEntity,
    eventId?: string,
    correlationId?: string
  ) {
    super(eventId, correlationId);
  }
}

