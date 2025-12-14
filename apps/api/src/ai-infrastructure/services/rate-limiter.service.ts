import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RateLimitConfig } from '@real-estate-analyzer/types';
import { StructuredLoggerService } from '../../common/logging/structured-logger.service';

interface RateLimitState {
  count: number;
  resetAt: number; // Timestamp
}

/**
 * Rate Limiter Service
 * Implements multiple rate limiting strategies
 */
@Injectable()
export class RateLimiterService {
  private rateLimits: Map<string, RateLimitState> = new Map();
  private tokenBuckets: Map<string, { tokens: number; lastRefill: number }> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: StructuredLoggerService
  ) {}

  /**
   * Check if request is allowed based on rate limit config
   */
  async checkRateLimit(
    key: string,
    config: RateLimitConfig
  ): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
    switch (config.strategy) {
      case 'fixed':
        return this.checkFixedWindow(key, config);
      case 'sliding':
        return this.checkSlidingWindow(key, config);
      case 'token-bucket':
        return this.checkTokenBucket(key, config);
      default:
        return this.checkFixedWindow(key, config);
    }
  }

  /**
   * Fixed window rate limiting
   */
  private checkFixedWindow(
    key: string,
    config: RateLimitConfig
  ): { allowed: boolean; remaining: number; resetAt: Date } {
    const now = Date.now();
    const windowStart = Math.floor(now / config.windowMs) * config.windowMs;
    const stateKey = `${key}:${windowStart}`;

    let state = this.rateLimits.get(stateKey);
    if (!state || state.resetAt < now) {
      state = { count: 0, resetAt: windowStart + config.windowMs };
      this.rateLimits.set(stateKey, state);
    }

    const allowed = state.count < config.maxRequests;
    if (allowed) {
      state.count++;
    }

    const remaining = Math.max(0, config.maxRequests - state.count);
    const resetAt = new Date(state.resetAt);

    // Cleanup old entries periodically
    if (Math.random() < 0.01) {
      this.cleanupOldEntries();
    }

    return { allowed, remaining, resetAt };
  }

  /**
   * Sliding window rate limiting
   */
  private checkSlidingWindow(
    key: string,
    config: RateLimitConfig
  ): { allowed: boolean; remaining: number; resetAt: Date } {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    const stateKey = key;

    let state = this.rateLimits.get(stateKey);
    if (!state) {
      state = { count: 0, resetAt: now + config.windowMs };
      this.rateLimits.set(stateKey, state);
    }

    // Remove old entries (simplified - in production use Redis or similar)
    // For now, we'll use a simple counter that resets
    if (state.resetAt < now) {
      state.count = 0;
      state.resetAt = now + config.windowMs;
    }

    const allowed = state.count < config.maxRequests;
    if (allowed) {
      state.count++;
    }

    const remaining = Math.max(0, config.maxRequests - state.count);
    const resetAt = new Date(state.resetAt);

    return { allowed, remaining, resetAt };
  }

  /**
   * Token bucket rate limiting
   */
  private checkTokenBucket(
    key: string,
    config: RateLimitConfig
  ): { allowed: boolean; remaining: number; resetAt: Date } {
    const now = Date.now();
    let bucket = this.tokenBuckets.get(key);

    if (!bucket) {
      bucket = { tokens: config.maxRequests, lastRefill: now };
      this.tokenBuckets.set(key, bucket);
    }

    // Refill tokens based on time passed
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = Math.floor((timePassed / config.windowMs) * config.maxRequests);
    bucket.tokens = Math.min(config.maxRequests, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    const allowed = bucket.tokens >= 1;
    if (allowed) {
      bucket.tokens--;
    }

    const remaining = Math.floor(bucket.tokens);
    const resetAt = new Date(now + config.windowMs);

    return { allowed, remaining, resetAt };
  }

  /**
   * Cleanup old rate limit entries
   */
  private cleanupOldEntries(): void {
    const now = Date.now();
    for (const [key, state] of this.rateLimits.entries()) {
      if (state.resetAt < now - 3600000) { // 1 hour old
        this.rateLimits.delete(key);
      }
    }

    for (const [key, bucket] of this.tokenBuckets.entries()) {
      if (bucket.lastRefill < now - 3600000) {
        this.tokenBuckets.delete(key);
      }
    }
  }

  /**
   * Get rate limit config for provider
   */
  getRateLimitConfig(provider: string): RateLimitConfig {
    // Default rate limits (can be overridden via config)
    const defaults: Record<string, RateLimitConfig> = {
      ollama: {
        maxRequests: 100,
        windowMs: 60000, // 1 minute
        strategy: 'token-bucket',
      },
      openai: {
        maxRequests: 60,
        windowMs: 60000, // 1 minute
        strategy: 'fixed',
      },
      anthropic: {
        maxRequests: 50,
        windowMs: 60000, // 1 minute
        strategy: 'fixed',
      },
    };

    const config = this.configService.get<RateLimitConfig>(
      `RATE_LIMIT_${provider.toUpperCase()}`,
      defaults[provider] || {
        maxRequests: 100,
        windowMs: 60000,
        strategy: 'fixed',
      }
    );

    return config;
  }
}

