import { BaseEvent } from './base-event';
import { DealValuation } from '@real-estate-analyzer/types';

export class ValuationCompletedEvent extends BaseEvent {
  constructor(
    public readonly propertyId: string,
    public readonly dealId?: string,
    public readonly valuation?: DealValuation,
    eventId?: string,
    correlationId?: string
  ) {
    super(eventId, correlationId);
  }
}

