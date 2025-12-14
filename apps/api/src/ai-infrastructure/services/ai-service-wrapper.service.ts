import { Injectable, Inject, Optional } from '@nestjs/common';
import { ILLMProvider } from '../../llm/providers/llm-provider.interface';
import { LLMMessage, LLMRequest, LLMResponse } from '@real-estate-analyzer/types';
import { APIKeyService } from './api-key.service';
import { RateLimiterService } from './rate-limiter.service';
import { CostTrackingService } from './cost-tracking.service';
import { FallbackService } from './fallback.service';
import { FeatureFlagService } from './feature-flag.service';
import { StructuredLoggerService } from '../../common/logging/structured-logger.service';

/**
 * AI Service Wrapper
 * Provides a unified interface for AI operations with infrastructure features
 */
@Injectable()
export class AIServiceWrapper {
  private providers: Map<string, ILLMProvider> = new Map();

  constructor(
    @Optional() @Inject('ILLMProvider')
    private readonly primaryProvider: ILLMProvider | null,
    private readonly apiKeyService: APIKeyService,
    private readonly rateLimiterService: RateLimiterService,
    private readonly costTrackingService: CostTrackingService,
    private readonly fallbackService: FallbackService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly logger: StructuredLoggerService
  ) {
    // Register primary provider if available
    if (primaryProvider) {
      this.providers.set(primaryProvider.getName(), primaryProvider);
    }
  }

  /**
   * Register additional provider
   */
  registerProvider(name: string, provider: ILLMProvider): void {
    this.providers.set(name, provider);
  }

  /**
   * Generate with full infrastructure support
   */
  async generate(
    request: LLMRequest,
    options: {
      feature: string;
      userId?: string;
      organizationId?: string;
      useFallback?: boolean;
      trackCost?: boolean;
    }
  ): Promise<LLMResponse & { provider: string; fallbackUsed: boolean }> {
    const startTime = Date.now();

    // Check feature flag
    if (options.organizationId) {
      const enabled = await this.featureFlagService.isFeatureEnabled(
        options.feature,
        options.userId,
        options.organizationId
      );

      if (!enabled) {
        throw new Error(`Feature ${options.feature} is not enabled`);
      }
    }

    // Get provider name
    const providerName = this.primaryProvider?.getName() || 'unknown';

    // Check rate limit
    const rateLimitKey = options.userId
      ? `user:${options.userId}:${providerName}`
      : `org:${options.organizationId}:${providerName}`;

    const rateLimitConfig = this.rateLimiterService.getRateLimitConfig(providerName);
    const rateLimitResult = await this.rateLimiterService.checkRateLimit(
      rateLimitKey,
      rateLimitConfig
    );

    if (!rateLimitResult.allowed) {
      throw new Error(
        `Rate limit exceeded. Retry after ${rateLimitResult.resetAt.toISOString()}`
      );
    }

    // Get API key if needed
    let apiKey: string | null = null;
    if (options.organizationId && this.primaryProvider) {
      apiKey = await this.apiKeyService.getAPIKey(
        options.organizationId,
        this.primaryProvider.getName()
      );
    }

    // Execute with fallback if enabled
    let result: LLMResponse & { provider: string; fallbackUsed: boolean };
    if (options.useFallback) {
      const strategy = this.fallbackService.getFallbackStrategy(options.feature) ||
        this.fallbackService.getFallbackStrategy('default');

      if (strategy) {
        result = await this.fallbackService.executeWithFallback(
          strategy,
          this.providers,
          request,
          async (provider) => await provider.generate(request)
        );
      } else {
        // No fallback strategy, use primary
        if (!this.primaryProvider) {
          throw new Error('No LLM provider available');
        }
        const response = await this.primaryProvider.generate(request);
        result = {
          ...response,
          provider: this.primaryProvider.getName(),
          fallbackUsed: false,
        };
      }
    } else {
      // Direct call without fallback
      if (!this.primaryProvider) {
        throw new Error('No LLM provider available');
      }
      const response = await this.primaryProvider.generate(request);
      result = {
        ...response,
        provider: this.primaryProvider.getName(),
        fallbackUsed: false,
      };
    }

    // Track cost if enabled
    if (options.trackCost && result.usage) {
      const cost = this.costTrackingService.calculateCost(
        result.provider,
        result.model,
        result.usage.promptTokens,
        result.usage.completionTokens
      );

      await this.costTrackingService.trackCost({
        provider: result.provider,
        model: result.model,
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
        estimatedCost: cost,
        timestamp: new Date(),
        userId: options.userId,
        organizationId: options.organizationId,
        feature: options.feature,
      });
    }

    const duration = Date.now() - startTime;
    this.logger.logWithMetadata(
      'info',
      `AI generation completed`,
      {
        feature: options.feature,
        provider: result.provider,
        fallbackUsed: result.fallbackUsed,
        duration,
        tokens: result.usage?.totalTokens || 0,
      },
      'AIServiceWrapper'
    );

    return result;
  }

  /**
   * Check if feature is enabled
   */
  async isFeatureEnabled(
    feature: string,
    userId?: string,
    organizationId?: string
  ): Promise<boolean> {
    return this.featureFlagService.isFeatureEnabled(feature, userId, organizationId);
  }

  /**
   * Get cost summary
   */
  async getCostSummary(
    organizationId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    return this.costTrackingService.getCostSummary(organizationId, startDate, endDate);
  }
}

