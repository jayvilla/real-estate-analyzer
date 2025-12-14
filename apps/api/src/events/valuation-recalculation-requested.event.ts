import { BaseEvent } from './base-event';

export class ValuationRecalculationRequestedEvent extends BaseEvent {
  constructor(
    public readonly propertyId: string,
    public readonly dealId?: string,
    public readonly reason: string = 'deal_updated',
    eventId?: string,
    correlationId?: string
  ) {
    super(eventId, correlationId);
  }
}

