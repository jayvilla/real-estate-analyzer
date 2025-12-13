import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ValuationRequestedEvent } from '../events/valuation-requested.event';
import { PropertyCreatedEvent } from '../events/property-created.event';

/**
 * Saga/Workflow for handling property valuation requests
 * This demonstrates event-driven architecture patterns
 */
@Injectable()
export class ValuationSaga {
  private readonly logger = new Logger(ValuationSaga.name);

  @OnEvent('valuation.requested')
  async handleValuationRequested(event: ValuationRequestedEvent) {
    this.logger.log(
      `Valuation requested for property ${event.propertyId} by ${event.requestedBy}`
    );

    // Step 1: Fetch property data
    this.logger.log(`Step 1: Fetching property data for ${event.propertyId}`);
    // In a real implementation, you would inject PropertyService here

    // Step 2: Gather market data
    this.logger.log(
      `Step 2: Gathering market data for property ${event.propertyId}`
    );
    // In a real implementation, this would call external APIs or services

    // Step 3: Calculate valuation
    this.logger.log(
      `Step 3: Calculating valuation for property ${event.propertyId}`
    );
    // In a real implementation, this would run valuation algorithms

    // Step 4: Store valuation result
    this.logger.log(
      `Step 4: Storing valuation result for property ${event.propertyId}`
    );
    // In a real implementation, this would update the property entity

    // Step 5: Emit completion event
    this.logger.log(
      `Valuation workflow completed for property ${event.propertyId}`
    );
    // In a real implementation, you would emit a ValuationCompletedEvent
  }

  @OnEvent('property.created')
  async handlePropertyCreated(event: PropertyCreatedEvent) {
    this.logger.log(
      `Property created event received for property ${event.propertyId}`
    );

    // Example: Auto-trigger initial valuation for new properties
    // This demonstrates how sagas can chain events
    // In a real implementation, you might want to:
    // - Schedule a background job for valuation
    // - Emit a valuation.requested event
    // - Perform initial data enrichment
  }
}

