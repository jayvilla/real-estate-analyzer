/**
 * AI Infrastructure Types
 */

export interface AIProviderConfig {
  provider: 'ollama' | 'openai' | 'anthropic' | 'mock';
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // Time window in milliseconds
  strategy: 'fixed' | 'sliding' | 'token-bucket';
}

export interface CostTracking {
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number; // in USD
  timestamp: Date;
  userId?: string;
  organizationId?: string;
  feature: string; // e.g., 'property-analysis', 'nlq', 'summary'
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  targetUsers?: string[]; // User IDs
  targetOrganizations?: string[]; // Organization IDs
  rolloutPercentage?: number; // 0-100
  conditions?: Record<string, any>; // Additional conditions
  createdAt: Date;
  updatedAt: Date;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: ABTestVariant[];
  trafficSplit: number[]; // Percentage for each variant (must sum to 100)
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  metrics: string[]; // Metrics to track
  createdAt: Date;
}

export interface ABTestVariant {
  id: string;
  name: string;
  config: Record<string, any>; // Variant-specific configuration
}

export interface ABTestAssignment {
  userId: string;
  organizationId: string;
  testId: string;
  variantId: string;
  assignedAt: Date;
}

export interface AIUsageAnalytics {
  feature: string;
  userId?: string;
  organizationId?: string;
  provider: string;
  model: string;
  requestCount: number;
  successCount: number;
  failureCount: number;
  averageResponseTime: number; // milliseconds
  totalCost: number; // USD
  totalTokens: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface AIError {
  code: string;
  message: string;
  provider: string;
  feature: string;
  userId?: string;
  organizationId?: string;
  timestamp: Date;
  retryable: boolean;
  fallbackUsed?: boolean;
}

export interface FallbackStrategy {
  primary: string; // Primary provider
  fallbacks: string[]; // Fallback providers in order
  conditions: {
    errorCodes?: string[];
    maxRetries?: number;
    timeout?: number;
  };
}

