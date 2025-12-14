import { BaseEvent } from './base-event';
import { PropertyEntity } from '../property/entities/property.entity';

export class PropertyCreatedEvent extends BaseEvent {
  constructor(
    public readonly propertyId: string,
    public readonly property: PropertyEntity,
    eventId?: string,
    correlationId?: string
  ) {
    super(eventId, correlationId);
  }
}

