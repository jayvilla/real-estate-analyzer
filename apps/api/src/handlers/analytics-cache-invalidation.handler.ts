import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DealCreatedEvent } from '../events/deal-created.event';
import { DealUpdatedEvent } from '../events/deal-updated.event';
import { PropertyCreatedEvent } from '../events/property-created.event';
import { AnalyticsCacheService } from '../analytics/cache/analytics-cache.service';
import { StructuredLoggerService } from '../common/logging/structured-logger.service';

/**
 * Event handler for invalidating analytics cache when data changes
 * Implements event-driven cache invalidation pattern
 */
@Injectable()
export class AnalyticsCacheInvalidationHandler {
  constructor(
    private readonly cacheService: AnalyticsCacheService,
    private readonly logger: StructuredLoggerService
  ) {}

  /**
   * Handle deal created event - invalidate analytics cache
   */
  @OnEvent('deal.created')
  async handleDealCreated(event: DealCreatedEvent): Promise<void> {
    this.logger.debug(
      `Invalidating analytics cache due to deal creation: ${event.dealId}`,
      'AnalyticsCacheInvalidationHandler',
      { dealId: event.dealId, propertyId: event.propertyId }
    );
    this.invalidateAnalyticsCache();
  }

  /**
   * Handle deal updated event - invalidate analytics cache
   */
  @OnEvent('deal.updated')
  async handleDealUpdated(event: DealUpdatedEvent): Promise<void> {
    this.logger.debug(
      `Invalidating analytics cache due to deal update: ${event.dealId}`,
      'AnalyticsCacheInvalidationHandler',
      { dealId: event.dealId, propertyId: event.propertyId }
    );
    this.invalidateAnalyticsCache();
  }

  /**
   * Handle property created event - invalidate analytics cache
   */
  @OnEvent('property.created')
  async handlePropertyCreated(event: PropertyCreatedEvent): Promise<void> {
    this.logger.debug(
      `Invalidating analytics cache due to property creation: ${event.propertyId}`,
      'AnalyticsCacheInvalidationHandler',
      { propertyId: event.propertyId }
    );
    this.invalidateAnalyticsCache();
  }

  /**
   * Invalidate all analytics cache entries
   * This ensures fresh data is calculated on the next request
   */
  private invalidateAnalyticsCache(): void {
    try {
      // Invalidate all analytics cache entries
      this.cacheService.invalidatePattern('analytics:.*');
      this.logger.debug(
        'Analytics cache invalidated successfully',
        'AnalyticsCacheInvalidationHandler'
      );
    } catch (error) {
      // Log error but don't throw - cache invalidation failure shouldn't break the app
      this.logger.error(
        `Failed to invalidate analytics cache: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'AnalyticsCacheInvalidationHandler'
      );
    }
  }
}

