import { Injectable } from '@nestjs/common';
import { FallbackStrategy, AIError } from '@real-estate-analyzer/types';
import { ILLMProvider } from '../../llm/providers/llm-provider.interface';
import { StructuredLoggerService } from '../../common/logging/structured-logger.service';

/**
 * Fallback Service for AI providers
 * Handles fallback logic when primary provider fails
 */
@Injectable()
export class FallbackService {
  private fallbackStrategies: Map<string, FallbackStrategy> = new Map();

  constructor(private readonly logger: StructuredLoggerService) {
    this.initializeDefaultStrategies();
  }

  /**
   * Execute request with fallback strategy
   */
  async executeWithFallback<T>(
    strategy: FallbackStrategy,
    providers: Map<string, ILLMProvider>,
    request: any,
    operation: (provider: ILLMProvider) => Promise<T>
  ): Promise<{ result: T; provider: string; fallbackUsed: boolean }> {
    let lastError: Error | null = null;
    let attempts = 0;
    const maxAttempts = 1 + strategy.fallbacks.length; // Primary + fallbacks

    // Try primary provider
    const primaryProvider = providers.get(strategy.primary);
    if (!primaryProvider) {
      throw new Error(`Primary provider ${strategy.primary} not available`);
    }

    try {
      const result = await this.executeWithTimeout(
        operation(primaryProvider),
        strategy.conditions.timeout || 30000
      );
      return { result, provider: strategy.primary, fallbackUsed: false };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      attempts++;

      this.logger.warn(
        `Primary provider ${strategy.primary} failed, trying fallbacks`,
        'FallbackService',
        { error: lastError.message }
      );
    }

    // Try fallback providers
    for (const fallbackProviderName of strategy.fallbacks) {
      if (attempts >= maxAttempts) break;

      const fallbackProvider = providers.get(fallbackProviderName);
      if (!fallbackProvider) {
        this.logger.warn(
          `Fallback provider ${fallbackProviderName} not available`,
          'FallbackService'
        );
        continue;
      }

      // Check if error is retryable
      if (!this.isRetryableError(lastError, strategy.conditions.errorCodes)) {
        break;
      }

      try {
        const result = await this.executeWithTimeout(
          operation(fallbackProvider),
          strategy.conditions.timeout || 30000
        );

        this.logger.logWithMetadata(
          'info',
          `Fallback provider ${fallbackProviderName} succeeded`,
          {
            originalProvider: strategy.primary,
            fallbackProvider: fallbackProviderName,
          },
          'FallbackService'
        );

        return { result, provider: fallbackProviderName, fallbackUsed: true };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        attempts++;

        this.logger.warn(
          `Fallback provider ${fallbackProviderName} also failed`,
          'FallbackService',
          { error: lastError.message }
        );
      }
    }

    // All providers failed
    throw new Error(
      `All providers failed. Last error: ${lastError?.message || 'Unknown error'}`
    );
  }

  /**
   * Execute operation with timeout
   */
  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
      ),
    ]);
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: Error | null, errorCodes?: string[]): boolean {
    if (!error) return false;

    // Default retryable errors
    const defaultRetryable = [
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'timeout',
      'rate_limit',
      'server_error',
      'temporary',
    ];

    const errorMessage = error.message.toLowerCase();
    const isDefaultRetryable = defaultRetryable.some((code) =>
      errorMessage.includes(code)
    );

    if (isDefaultRetryable) return true;

    // Check custom error codes
    if (errorCodes && errorCodes.length > 0) {
      return errorCodes.some((code) => errorMessage.includes(code.toLowerCase()));
    }

    // Don't retry on authentication/authorization errors
    if (
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('forbidden') ||
      errorMessage.includes('invalid_api_key')
    ) {
      return false;
    }

    return true;
  }

  /**
   * Get fallback strategy for feature
   */
  getFallbackStrategy(feature: string): FallbackStrategy | null {
    return this.fallbackStrategies.get(feature) || null;
  }

  /**
   * Set fallback strategy for feature
   */
  setFallbackStrategy(feature: string, strategy: FallbackStrategy): void {
    this.fallbackStrategies.set(feature, strategy);
  }

  /**
   * Initialize default fallback strategies
   */
  private initializeDefaultStrategies(): void {
    // Default: Ollama -> Mock (for development)
    this.setFallbackStrategy('default', {
      primary: 'ollama',
      fallbacks: ['mock'],
      conditions: {
        errorCodes: ['ECONNRESET', 'ETIMEDOUT', 'timeout'],
        maxRetries: 2,
        timeout: 30000,
      },
    });

    // For production: OpenAI -> Anthropic -> Ollama
    this.setFallbackStrategy('production', {
      primary: 'openai',
      fallbacks: ['anthropic', 'ollama'],
      conditions: {
        errorCodes: ['rate_limit', 'server_error', 'timeout'],
        maxRetries: 3,
        timeout: 60000,
      },
    });
  }
}

