import { Injectable, Inject } from '@nestjs/common';
import { ILLMProvider } from './providers/llm-provider.interface';
import { LLMCacheService } from './cache/llm-cache.service';
import { PropertyService } from '../property/property.service';
import { DealService } from '../deal/deal.service';
import { ValuationService } from '../valuation/valuation.service';
import { MarketService } from '../market/market.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { StructuredLoggerService } from '../common/logging/structured-logger.service';
import {
  PropertyAnalysis,
  DealRecommendation,
  RiskAssessment,
  InvestmentStrategy,
  MarketCommentary,
  PropertyDescription,
  PortfolioInsight,
  LLMMessage,
} from '@real-estate-analyzer/types';
import { buildPropertyAnalysisPrompt } from './prompts/property-analysis.prompt';
import { buildDealRecommendationPrompt } from './prompts/deal-recommendation.prompt';
import { buildRiskAssessmentPrompt } from './prompts/risk-assessment.prompt';
import { buildInvestmentStrategyPrompt } from './prompts/investment-strategy.prompt';
import { buildMarketCommentaryPrompt } from './prompts/market-commentary.prompt';
import { buildPropertyDescriptionPrompt } from './prompts/property-description.prompt';
import { buildPortfolioInsightPrompt } from './prompts/portfolio-insight.prompt';

@Injectable()
export class LLMService {
  constructor(
    @Inject('ILLMProvider')
    private readonly llmProvider: ILLMProvider,
    private readonly cacheService: LLMCacheService,
    private readonly propertyService: PropertyService,
    private readonly dealService: DealService,
    private readonly valuationService: ValuationService,
    private readonly marketService: MarketService,
    private readonly analyticsService: AnalyticsService,
    private readonly logger: StructuredLoggerService
  ) {}

  /**
   * Analyze a property with LLM insights
   */
  async analyzeProperty(
    propertyId: string,
    organizationId: string
  ): Promise<PropertyAnalysis> {
    const startTime = Date.now();

    try {
      const property = await this.propertyService.findOne(propertyId, organizationId, true);
      const deals = property.deals || [];
      const marketTrend = await this.marketService.getMarketTrend(property.zipCode).catch(() => null);

      const prompt = buildPropertyAnalysisPrompt(property, deals, marketTrend || undefined);
      const response = await this.generateWithCache(prompt);

      const analysis = this.parseJSONResponse<PropertyAnalysis>(response.content);

      const duration = Date.now() - startTime;
      this.logger.logWithMetadata(
        'info',
        `Property analysis completed for ${propertyId}`,
        {
          propertyId,
          duration,
          provider: this.llmProvider.getName(),
        },
        'LLMService'
      );

      return {
        ...analysis,
        propertyId,
      };
    } catch (error) {
      this.logger.error(
        `Failed to analyze property: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'LLMService',
        { propertyId }
      );
      throw error;
    }
  }

  /**
   * Get deal recommendation
   */
  async getDealRecommendation(
    dealId: string,
    organizationId: string
  ): Promise<DealRecommendation> {
    const startTime = Date.now();

    try {
      const deal = await this.dealService.findOne(dealId, organizationId);
      const valuation = this.valuationService.calculateDealValuation(deal);
      const property = await this.propertyService.findOne(deal.propertyId, organizationId, false);
      const marketTrend = await this.marketService.getMarketTrend(property.zipCode).catch(() => null);

      const prompt = buildDealRecommendationPrompt(deal, valuation, marketTrend || undefined);
      const response = await this.generateWithCache(prompt);

      const recommendation = this.parseJSONResponse<DealRecommendation>(response.content);

      const duration = Date.now() - startTime;
      this.logger.logWithMetadata(
        'info',
        `Deal recommendation completed for ${dealId}`,
        {
          dealId,
          duration,
          provider: this.llmProvider.getName(),
        },
        'LLMService'
      );

      return {
        ...recommendation,
        dealId,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get deal recommendation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'LLMService',
        { dealId }
      );
      throw error;
    }
  }

  /**
   * Assess risk for property or deal
   */
  async assessRisk(
    propertyId?: string,
    dealId?: string,
    organizationId?: string
  ): Promise<RiskAssessment> {
    const startTime = Date.now();

    try {
      let property: any = null;
      let deal: any = null;
      let valuation: any = null;
      let marketTrend: any = null;

      if (dealId && organizationId) {
        deal = await this.dealService.findOne(dealId, organizationId);
        property = await this.propertyService.findOne(deal.propertyId, organizationId, false);
        valuation = this.valuationService.calculateDealValuation(deal);
        marketTrend = await this.marketService.getMarketTrend(property.zipCode).catch(() => null);
      } else if (propertyId && organizationId) {
        property = await this.propertyService.findOne(propertyId, organizationId, false);
        marketTrend = await this.marketService.getMarketTrend(property.zipCode).catch(() => null);
      }

      const prompt = buildRiskAssessmentPrompt(property, deal, valuation, marketTrend);
      const response = await this.generateWithCache(prompt);

      const assessment = this.parseJSONResponse<RiskAssessment>(response.content);

      const duration = Date.now() - startTime;
      this.logger.logWithMetadata(
        'info',
        `Risk assessment completed`,
        {
          propertyId,
          dealId,
          duration,
          provider: this.llmProvider.getName(),
        },
        'LLMService'
      );

      return {
        ...assessment,
        propertyId,
        dealId,
      };
    } catch (error) {
      this.logger.error(
        `Failed to assess risk: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'LLMService',
        { propertyId, dealId }
      );
      throw error;
    }
  }

  /**
   * Get investment strategy recommendations
   */
  async getInvestmentStrategy(
    organizationId: string
  ): Promise<InvestmentStrategy> {
    const startTime = Date.now();

    try {
      const properties = await this.propertyService.findAll(organizationId, false);
      const deals = await this.dealService.findAll(organizationId);
      const portfolioMetrics = await this.analyticsService.getPortfolioSummary({});

      const prompt = buildInvestmentStrategyPrompt(properties, deals, portfolioMetrics);
      const response = await this.generateWithCache(prompt);

      const strategy = this.parseJSONResponse<InvestmentStrategy>(response.content);

      const duration = Date.now() - startTime;
      this.logger.logWithMetadata(
        'info',
        `Investment strategy generated`,
        {
          organizationId,
          duration,
          provider: this.llmProvider.getName(),
        },
        'LLMService'
      );

      return {
        ...strategy,
        organizationId,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get investment strategy: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'LLMService',
        { organizationId }
      );
      throw error;
    }
  }

  /**
   * Generate market commentary
   */
  async generateMarketCommentary(zipCode: string): Promise<MarketCommentary> {
    const startTime = Date.now();

    try {
      const trend = await this.marketService.getMarketTrend(zipCode);
      const prompt = buildMarketCommentaryPrompt(trend);
      const response = await this.generateWithCache(prompt);

      const commentary = this.parseJSONResponse<MarketCommentary>(response.content);

      const duration = Date.now() - startTime;
      this.logger.logWithMetadata(
        'info',
        `Market commentary generated for ${zipCode}`,
        {
          zipCode,
          duration,
          provider: this.llmProvider.getName(),
        },
        'LLMService'
      );

      return {
        ...commentary,
        zipCode,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate market commentary: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'LLMService',
        { zipCode }
      );
      throw error;
    }
  }

  /**
   * Generate natural language property description
   */
  async generatePropertyDescription(
    propertyId: string,
    organizationId: string
  ): Promise<PropertyDescription> {
    const startTime = Date.now();

    try {
      const property = await this.propertyService.findOne(propertyId, organizationId, false);
      const prompt = buildPropertyDescriptionPrompt(property);
      const response = await this.generateWithCache(prompt);

      const description = this.parseJSONResponse<PropertyDescription>(response.content);

      const duration = Date.now() - startTime;
      this.logger.logWithMetadata(
        'info',
        `Property description generated for ${propertyId}`,
        {
          propertyId,
          duration,
          provider: this.llmProvider.getName(),
        },
        'LLMService'
      );

      return {
        ...description,
        propertyId,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate property description: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'LLMService',
        { propertyId }
      );
      throw error;
    }
  }

  /**
   * Get portfolio insights
   */
  async getPortfolioInsights(
    organizationId: string
  ): Promise<PortfolioInsight[]> {
    const startTime = Date.now();

    try {
      const properties = await this.propertyService.findAll(organizationId, false);
      const deals = await this.dealService.findAll(organizationId);
      const portfolioMetrics = await this.analyticsService.getPortfolioSummary({});
      const dashboard = await this.analyticsService.getDashboard({});

      const prompt = buildPortfolioInsightPrompt(
        properties,
        deals,
        portfolioMetrics,
        dashboard
      );
      const response = await this.generateWithCache(prompt);

      // Portfolio insights can be multiple, so parse as array
      const insights = this.parseJSONResponse<PortfolioInsight | PortfolioInsight[]>(
        response.content
      );

      const insightsArray = Array.isArray(insights) ? insights : [insights];

      const duration = Date.now() - startTime;
      this.logger.logWithMetadata(
        'info',
        `Portfolio insights generated`,
        {
          organizationId,
          insightCount: insightsArray.length,
          duration,
          provider: this.llmProvider.getName(),
        },
        'LLMService'
      );

      return insightsArray.map((insight) => ({
        ...insight,
        organizationId,
      }));
    } catch (error) {
      this.logger.error(
        `Failed to get portfolio insights: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'LLMService',
        { organizationId }
      );
      throw error;
    }
  }

  /**
   * Generate response with caching
   */
  private async generateWithCache(
    prompt: string,
    systemMessage?: string
  ): Promise<any> {
    const messages: LLMMessage[] = [];
    
    if (systemMessage) {
      messages.push({ role: 'system', content: systemMessage });
    }
    
    messages.push({ role: 'user', content: prompt });

    const request = {
      messages,
      temperature: 0.7,
      maxTokens: 2048,
    };

    // Check cache first
    const cached = this.cacheService.get(request);
    if (cached) {
      this.logger.debug('Using cached LLM response', 'LLMService');
      return cached;
    }

    // Generate new response
    const response = await this.llmProvider.generate(request);

    // Cache the response
    this.cacheService.set(request, response);

    return response;
  }

  /**
   * Parse JSON response from LLM, handling markdown code blocks
   */
  private parseJSONResponse<T>(content: string): T {
    try {
      // Remove markdown code blocks if present
      let cleaned = content.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }

      return JSON.parse(cleaned) as T;
    } catch (error) {
      this.logger.error(
        `Failed to parse LLM JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'LLMService',
        { content: content.substring(0, 200) }
      );
      throw new Error(`Invalid JSON response from LLM: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if LLM provider is available
   */
  async isAvailable(): Promise<boolean> {
    return this.llmProvider.isAvailable();
  }

  /**
   * Get available models
   */
  async getAvailableModels(): Promise<string[]> {
    return this.llmProvider.getAvailableModels();
  }
}

