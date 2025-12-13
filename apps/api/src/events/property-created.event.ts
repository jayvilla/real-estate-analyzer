import { PropertyEntity } from '../property/entities/property.entity';

export class PropertyCreatedEvent {
  constructor(
    public readonly propertyId: string,
    public readonly property: PropertyEntity,
  ) {}
}

