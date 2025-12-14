import { Injectable, Inject } from '@nestjs/common';
import {
  Summary,
  SummaryType,
  SummaryOptions,
  SummaryFormat,
  SummaryLanguage,
  PortfolioSummary,
  PropertySummary,
  DealSummary,
  MarketSummary,
  ExecutiveSummary,
} from '@real-estate-analyzer/types';
import { ILLMProvider } from '../../llm/providers/llm-provider.interface';
import { PropertyService } from '../../property/property.service';
import { DealService } from '../../deal/deal.service';
import { ValuationService } from '../../valuation/valuation.service';
import { AnalyticsService } from '../../analytics/analytics.service';
import { MarketService } from '../../market/market.service';
import { StructuredLoggerService } from '../../common/logging/structured-logger.service';
import { buildPortfolioSummaryPrompt } from '../prompts/portfolio-summary.prompt';
import { buildPropertySummaryPrompt } from '../prompts/property-summary.prompt';
import { buildDealSummaryPrompt } from '../prompts/deal-summary.prompt';
import { buildMarketSummaryPrompt } from '../prompts/market-summary.prompt';
import { buildExecutiveSummaryPrompt } from '../prompts/executive-summary.prompt';
import { LLMMessage } from '@real-estate-analyzer/types';

@Injectable()
export class SummaryGenerationService {
  constructor(
    @Inject('ILLMProvider')
    private readonly llmProvider: ILLMProvider,
    private readonly propertyService: PropertyService,
    private readonly dealService: DealService,
    private readonly valuationService: ValuationService,
    private readonly analyticsService: AnalyticsService,
    private readonly marketService: MarketService,
    private readonly logger: StructuredLoggerService
  ) {}

  /**
   * Generate summary based on options
   */
  async generateSummary(
    options: SummaryOptions,
    organizationId: string,
    userId: string
  ): Promise<Summary> {
    const startTime = Date.now();

    try {
      let summary: Summary;

      switch (options.type) {
        case SummaryType.PORTFOLIO:
          summary = await this.generatePortfolioSummary(
            options,
            organizationId,
            userId
          );
          break;

        case SummaryType.PROPERTY:
          if (!options.targetIds || options.targetIds.length === 0) {
            throw new Error('Property ID is required for property summary');
          }
          summary = await this.generatePropertySummary(
            options.targetIds[0],
            options,
            organizationId,
            userId
          );
          break;

        case SummaryType.DEAL:
          if (!options.targetIds || options.targetIds.length === 0) {
            throw new Error('Deal ID is required for deal summary');
          }
          summary = await this.generateDealSummary(
            options.targetIds[0],
            options,
            organizationId,
            userId
          );
          break;

        case SummaryType.MARKET:
          if (!options.targetIds || options.targetIds.length === 0) {
            throw new Error('Zip code is required for market summary');
          }
          summary = await this.generateMarketSummary(
            options.targetIds[0],
            options,
            organizationId,
            userId
          );
          break;

        case SummaryType.EXECUTIVE:
          summary = await this.generateExecutiveSummary(
            options,
            organizationId,
            userId
          );
          break;

        default:
          throw new Error(`Unsupported summary type: ${options.type}`);
      }

      const duration = Date.now() - startTime;
      this.logger.logWithMetadata(
        'info',
        `Summary generated successfully`,
        {
          type: options.type,
          format: options.format || SummaryFormat.TEXT,
          language: options.language || SummaryLanguage.EN,
          duration,
        },
        'SummaryGenerationService'
      );

      return summary;
    } catch (error) {
      this.logger.error(
        `Failed to generate summary: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'SummaryGenerationService',
        { type: options.type }
      );
      throw error;
    }
  }

  /**
   * Generate portfolio summary
   */
  private async generatePortfolioSummary(
    options: SummaryOptions,
    organizationId: string,
    userId: string
  ): Promise<PortfolioSummary> {
    const dashboard = await this.analyticsService.getDashboard({});
    const portfolioSummary = await this.analyticsService.getPortfolioSummary({});

    const prompt = buildPortfolioSummaryPrompt(
      dashboard,
      portfolioSummary,
      options.language || SummaryLanguage.EN
    );

    const response = await this.generateWithLLM(prompt, options.language);
    const data = this.parseJSONResponse(response.content);

    return {
      id: this.generateId(),
      organizationId,
      type: SummaryType.PORTFOLIO,
      generatedAt: new Date(),
      summary: data.summary,
      highlights: data.highlights || [],
      metrics: data.metrics || [],
      recommendations: data.recommendations || [],
      riskFactors: data.riskFactors || [],
      opportunities: data.opportunities || [],
      format: options.format || SummaryFormat.TEXT,
      language: options.language || SummaryLanguage.EN,
    };
  }

  /**
   * Generate property summary
   */
  private async generatePropertySummary(
    propertyId: string,
    options: SummaryOptions,
    organizationId: string,
    userId: string
  ): Promise<PropertySummary> {
    const property = await this.propertyService.findOne(propertyId, organizationId, false);
    const dashboard = await this.analyticsService.getDashboard({});
    const performance = dashboard.propertyPerformance?.find((p) => p.propertyId === propertyId);

    const prompt = buildPropertySummaryPrompt(
      property,
      performance,
      options.language || SummaryLanguage.EN
    );

    const response = await this.generateWithLLM(prompt, options.language);
    const data = this.parseJSONResponse(response.content);

    return {
      id: this.generateId(),
      propertyId,
      organizationId,
      type: SummaryType.PROPERTY,
      generatedAt: new Date(),
      summary: data.summary,
      performance: data.performance || {
        period: 'Last 12 months',
        cashFlow: 0,
        appreciation: 0,
        roi: 0,
        capRate: 0,
      },
      highlights: data.highlights || [],
      concerns: data.concerns || [],
      recommendations: data.recommendations || [],
      format: options.format || SummaryFormat.TEXT,
      language: options.language || SummaryLanguage.EN,
    };
  }

  /**
   * Generate deal summary
   */
  private async generateDealSummary(
    dealId: string,
    options: SummaryOptions,
    organizationId: string,
    userId: string
  ): Promise<DealSummary> {
    const deal = await this.dealService.findOne(dealId, organizationId);
    const valuation = this.valuationService.calculateDealValuation(deal);

    const prompt = buildDealSummaryPrompt(
      deal,
      valuation,
      options.language || SummaryLanguage.EN
    );

    const response = await this.generateWithLLM(prompt, options.language);
    const data = this.parseJSONResponse(response.content);

    return {
      id: this.generateId(),
      dealId,
      organizationId,
      type: SummaryType.DEAL,
      generatedAt: new Date(),
      summary: data.summary,
      financials: data.financials || {
        purchasePrice: deal.purchasePrice,
        downPayment: deal.downPayment || 0,
        monthlyCashFlow: valuation.cashFlow?.monthlyCashFlow || 0,
        capRate: valuation.capRate?.rate || 0,
        cashOnCashReturn: valuation.returnMetrics?.cashOnCashReturn || 0,
        dscr: valuation.returnMetrics?.dscr || 0,
      },
      strengths: data.strengths || [],
      weaknesses: data.weaknesses || [],
      recommendations: data.recommendations || [],
      riskAssessment: data.riskAssessment || '',
      format: options.format || SummaryFormat.TEXT,
      language: options.language || SummaryLanguage.EN,
    };
  }

  /**
   * Generate market summary
   */
  private async generateMarketSummary(
    zipCode: string,
    options: SummaryOptions,
    organizationId: string,
    userId: string
  ): Promise<MarketSummary> {
    const trend = await this.marketService.getMarketTrend(zipCode);
    const neighborhood = await this.marketService.getNeighborhoodAnalysis(zipCode).catch(() => null);

    const prompt = buildMarketSummaryPrompt(
      trend,
      neighborhood || undefined,
      options.language || SummaryLanguage.EN
    );

    const response = await this.generateWithLLM(prompt, options.language);
    const data = this.parseJSONResponse(response.content);

    return {
      id: this.generateId(),
      zipCode,
      organizationId,
      type: SummaryType.MARKET,
      generatedAt: new Date(),
      summary: data.summary,
      marketTrends: data.marketTrends || {
        trend: trend.trend,
        priceChange: trend.priceChange1Year || 0,
        inventory: trend.dataPoints?.[trend.dataPoints.length - 1]?.inventoryCount || 0,
        daysOnMarket: trend.dataPoints?.[trend.dataPoints.length - 1]?.daysOnMarket || 0,
      },
      insights: data.insights || [],
      predictions: data.predictions || [],
      recommendations: data.recommendations || [],
      format: options.format || SummaryFormat.TEXT,
      language: options.language || SummaryLanguage.EN,
    };
  }

  /**
   * Generate executive summary
   */
  private async generateExecutiveSummary(
    options: SummaryOptions,
    organizationId: string,
    userId: string
  ): Promise<ExecutiveSummary> {
    const dashboard = await this.analyticsService.getDashboard({});
    const portfolioSummary = await this.analyticsService.getPortfolioSummary({});

    const prompt = buildExecutiveSummaryPrompt(
      dashboard,
      portfolioSummary,
      options.language || SummaryLanguage.EN
    );

    const response = await this.generateWithLLM(prompt, options.language);
    const data = this.parseJSONResponse(response.content);

    return {
      id: this.generateId(),
      organizationId,
      type: SummaryType.EXECUTIVE,
      generatedAt: new Date(),
      summary: data.summary,
      keyMetrics: data.keyMetrics || [],
      portfolioOverview: data.portfolioOverview || '',
      topPerformers: data.topPerformers || [],
      concerns: data.concerns || [],
      strategicRecommendations: data.strategicRecommendations || [],
      format: options.format || SummaryFormat.TEXT,
      language: options.language || SummaryLanguage.EN,
    };
  }

  /**
   * Generate response using LLM
   */
  private async generateWithLLM(
    prompt: string,
    language?: SummaryLanguage
  ): Promise<any> {
    const messages: LLMMessage[] = [
      {
        role: 'user',
        content: prompt,
      },
    ];

    return await this.llmProvider.generate({
      messages,
      temperature: 0.7,
      maxTokens: 2048,
    });
  }

  /**
   * Parse JSON response from LLM
   */
  private parseJSONResponse(content: string): any {
    try {
      let cleaned = content.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }

      return JSON.parse(cleaned);
    } catch (error) {
      this.logger.error(
        `Failed to parse LLM JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'SummaryGenerationService'
      );
      throw new Error(`Invalid JSON response from LLM: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

