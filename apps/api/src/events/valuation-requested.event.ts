export class ValuationRequestedEvent {
  constructor(
    public readonly propertyId: string,
    public readonly requestedBy: string,
  ) {}
}

