import { Injectable } from '@nestjs/common';
import { LLMRequest, LLMResponse } from '@real-estate-analyzer/types';
import { StructuredLoggerService } from '../../common/logging/structured-logger.service';

interface CacheEntry {
  response: LLMResponse;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

/**
 * Simple in-memory cache for LLM responses
 * In production, consider using Redis for distributed caching
 */
@Injectable()
export class LLMCacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly defaultTTL = 24 * 60 * 60 * 1000; // 24 hours

  constructor(private readonly logger: StructuredLoggerService) {
    // Clean up expired entries every hour
    setInterval(() => this.cleanup(), 60 * 60 * 1000);
  }

  /**
   * Generate cache key from request
   */
  private generateCacheKey(request: LLMRequest): string {
    // Create a hash of the request (simplified - in production use proper hashing)
    const key = JSON.stringify({
      messages: request.messages.map((m) => ({
        role: m.role,
        content: m.content.substring(0, 500), // Limit content length for key
      })),
      model: request.model,
      temperature: request.temperature,
    });
    return Buffer.from(key).toString('base64');
  }

  /**
   * Get cached response if available
   */
  get(request: LLMRequest): LLMResponse | null {
    const key = this.generateCacheKey(request);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    this.logger.debug(
      `LLM cache hit for key: ${key.substring(0, 20)}...`,
      'LLMCacheService'
    );

    return entry.response;
  }

  /**
   * Store response in cache
   */
  set(request: LLMRequest, response: LLMResponse, ttl?: number): void {
    const key = this.generateCacheKey(request);
    const entry: CacheEntry = {
      response,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };

    this.cache.set(key, entry);

    this.logger.debug(
      `LLM response cached with key: ${key.substring(0, 20)}...`,
      'LLMCacheService'
    );
  }

  /**
   * Invalidate cache by pattern (simple implementation)
   */
  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      this.logger.debug('LLM cache cleared', 'LLMCacheService');
      return;
    }

    // Simple pattern matching (in production, use more sophisticated matching)
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: number } {
    return {
      size: this.cache.size,
      keys: this.cache.size,
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(
        `Cleaned up ${cleaned} expired LLM cache entries`,
        'LLMCacheService'
      );
    }
  }
}

