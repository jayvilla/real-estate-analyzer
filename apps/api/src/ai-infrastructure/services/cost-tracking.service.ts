import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CostTracking, AIUsageAnalytics } from '@real-estate-analyzer/types';
import { CostTrackingEntity } from '../entities/cost-tracking.entity';
import { AIUsageAnalyticsEntity } from '../entities/ai-usage-analytics.entity';
import { StructuredLoggerService } from '../../common/logging/structured-logger.service';

/**
 * Cost tracking service for AI API usage
 * Tracks token usage and estimated costs per provider
 */
@Injectable()
export class CostTrackingService {
  // Pricing per 1M tokens (as of 2024, update as needed)
  private readonly pricing: Record<string, Record<string, { input: number; output: number }>> = {
    openai: {
      'gpt-4': { input: 30.0, output: 60.0 },
      'gpt-4-turbo': { input: 10.0, output: 30.0 },
      'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
    },
    anthropic: {
      'claude-3-opus': { input: 15.0, output: 75.0 },
      'claude-3-sonnet': { input: 3.0, output: 15.0 },
      'claude-3-haiku': { input: 0.25, output: 1.25 },
    },
    ollama: {
      default: { input: 0.0, output: 0.0 }, // Free/local
    },
  };

  constructor(
    @InjectRepository(CostTrackingEntity)
    private readonly costTrackingRepository: Repository<CostTrackingEntity>,
    @InjectRepository(AIUsageAnalyticsEntity)
    private readonly analyticsRepository: Repository<AIUsageAnalyticsEntity>,
    private readonly logger: StructuredLoggerService
  ) {}

  /**
   * Track cost for an AI API call
   */
  async trackCost(costTracking: CostTracking): Promise<void> {
    try {
      const entity = this.costTrackingRepository.create({
        userId: costTracking.userId,
        organizationId: costTracking.organizationId,
        provider: costTracking.provider,
        model: costTracking.model,
        feature: costTracking.feature,
        promptTokens: costTracking.promptTokens,
        completionTokens: costTracking.completionTokens,
        totalTokens: costTracking.totalTokens,
        estimatedCost: costTracking.estimatedCost,
        timestamp: costTracking.timestamp || new Date(),
      });

      await this.costTrackingRepository.save(entity);

      // Also track in analytics
      await this.trackUsage({
        feature: costTracking.feature,
        userId: costTracking.userId,
        organizationId: costTracking.organizationId,
        provider: costTracking.provider,
        model: costTracking.model,
        success: true,
        tokensUsed: costTracking.totalTokens,
        cost: costTracking.estimatedCost,
      });
    } catch (error) {
      this.logger.error(
        `Failed to track cost: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'CostTrackingService'
      );
    }
  }

  /**
   * Calculate estimated cost based on tokens and provider
   */
  calculateCost(
    provider: string,
    model: string,
    promptTokens: number,
    completionTokens: number
  ): number {
    const providerPricing = this.pricing[provider.toLowerCase()];
    if (!providerPricing) {
      return 0; // Unknown provider or free
    }

    const modelPricing = providerPricing[model] || providerPricing.default || { input: 0, output: 0 };

    const inputCost = (promptTokens / 1_000_000) * modelPricing.input;
    const outputCost = (completionTokens / 1_000_000) * modelPricing.output;

    return inputCost + outputCost;
  }

  /**
   * Get cost summary for organization
   */
  async getCostSummary(
    organizationId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalCost: number;
    totalTokens: number;
    byProvider: Record<string, { cost: number; tokens: number }>;
    byFeature: Record<string, { cost: number; tokens: number }>;
  }> {
    const query = this.costTrackingRepository
      .createQueryBuilder('cost')
      .where('cost.organizationId = :organizationId', { organizationId });

    if (startDate) {
      query.andWhere('cost.timestamp >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('cost.timestamp <= :endDate', { endDate });
    }

    const costs = await query.getMany();

    const summary = {
      totalCost: 0,
      totalTokens: 0,
      byProvider: {} as Record<string, { cost: number; tokens: number }>,
      byFeature: {} as Record<string, { cost: number; tokens: number }>,
    };

    for (const cost of costs) {
      summary.totalCost += Number(cost.estimatedCost);
      summary.totalTokens += cost.totalTokens;

      // By provider
      if (!summary.byProvider[cost.provider]) {
        summary.byProvider[cost.provider] = { cost: 0, tokens: 0 };
      }
      summary.byProvider[cost.provider].cost += Number(cost.estimatedCost);
      summary.byProvider[cost.provider].tokens += cost.totalTokens;

      // By feature
      if (!summary.byFeature[cost.feature]) {
        summary.byFeature[cost.feature] = { cost: 0, tokens: 0 };
      }
      summary.byFeature[cost.feature].cost += Number(cost.estimatedCost);
      summary.byFeature[cost.feature].tokens += cost.totalTokens;
    }

    return summary;
  }

  /**
   * Track usage analytics
   */
  async trackUsage(data: {
    feature: string;
    userId?: string;
    organizationId?: string;
    provider: string;
    model: string;
    success: boolean;
    responseTime?: number;
    tokensUsed: number;
    cost: number;
    errorCode?: string;
  }): Promise<void> {
    try {
      const entity = this.analyticsRepository.create({
        ...data,
        requestCount: 1,
        timestamp: new Date(),
      });

      await this.analyticsRepository.save(entity);
    } catch (error) {
      this.logger.error(
        `Failed to track usage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'CostTrackingService'
      );
    }
  }

  /**
   * Get usage analytics
   */
  async getUsageAnalytics(
    organizationId?: string,
    feature?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<AIUsageAnalytics[]> {
    const query = this.analyticsRepository.createQueryBuilder('analytics');

    if (organizationId) {
      query.where('analytics.organizationId = :organizationId', { organizationId });
    }
    if (feature) {
      query.andWhere('analytics.feature = :feature', { feature });
    }
    if (startDate) {
      query.andWhere('analytics.timestamp >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('analytics.timestamp <= :endDate', { endDate });
    }

    const results = await query
      .select([
        'analytics.feature',
        'analytics.provider',
        'analytics.model',
        'SUM(analytics.requestCount) as requestCount',
        'SUM(CASE WHEN analytics.success THEN 1 ELSE 0 END) as successCount',
        'SUM(CASE WHEN NOT analytics.success THEN 1 ELSE 0 END) as failureCount',
        'AVG(analytics.responseTime) as averageResponseTime',
        'SUM(analytics.cost) as totalCost',
        'SUM(analytics.tokensUsed) as totalTokens',
        'MIN(analytics.timestamp) as periodStart',
        'MAX(analytics.timestamp) as periodEnd',
      ])
      .groupBy('analytics.feature')
      .addGroupBy('analytics.provider')
      .addGroupBy('analytics.model')
      .getRawMany();

    return results.map((r) => ({
      feature: r.feature,
      provider: r.provider,
      model: r.model,
      requestCount: parseInt(r.requestCount, 10),
      successCount: parseInt(r.successCount, 10),
      failureCount: parseInt(r.failureCount, 10),
      averageResponseTime: parseFloat(r.averageResponseTime) || 0,
      totalCost: parseFloat(r.totalCost) || 0,
      totalTokens: parseInt(r.totalTokens, 10),
      period: {
        start: new Date(r.periodStart),
        end: new Date(r.periodEnd),
      },
    }));
  }
}

