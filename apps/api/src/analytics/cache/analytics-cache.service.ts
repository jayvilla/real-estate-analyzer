import { Injectable } from '@nestjs/common';
import { AnalyticsDashboard, PortfolioSummary } from '@real-estate-analyzer/types';
import { StructuredLoggerService } from '../../common/logging/structured-logger.service';

/**
 * Cache service for analytics data
 * Implements cached read models pattern for performance
 */
@Injectable()
export class AnalyticsCacheService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(private readonly logger: StructuredLoggerService) {}

  /**
   * Get cached data if available and not expired
   */
  get<T>(key: string): T | null {
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      this.logger.debug(`Cache expired for key: ${key}`, 'AnalyticsCacheService');
      return null;
    }

    this.logger.debug(`Cache hit for key: ${key}`, 'AnalyticsCacheService');
    return cached.data as T;
  }

  /**
   * Set cached data with TTL
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    this.logger.debug(`Cache set for key: ${key} (TTL: ${ttl}ms)`, 'AnalyticsCacheService');
  }

  /**
   * Invalidate cache for a specific key
   */
  invalidate(key: string): void {
    this.cache.delete(key);
    this.logger.debug(`Cache invalidated for key: ${key}`, 'AnalyticsCacheService');
  }

  /**
   * Invalidate all cache entries matching a pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    let count = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    this.logger.debug(
      `Cache invalidated for pattern: ${pattern} (${count} entries)`,
      'AnalyticsCacheService'
    );
  }

  /**
   * Clear all cache
   */
  clear(): void {
    const count = this.cache.size;
    this.cache.clear();
    this.logger.log(`Cache cleared (${count} entries)`, 'AnalyticsCacheService');
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Generate cache key for analytics queries
   */
  generateKey(
    type: string,
    options?: Record<string, any>
  ): string {
    const optionsStr = options
      ? JSON.stringify(options, Object.keys(options).sort())
      : '';
    return `analytics:${type}:${optionsStr}`;
  }
}

