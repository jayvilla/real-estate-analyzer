import { Injectable, Inject } from '@nestjs/common';
import {
  SummaryType,
  SummaryFormat,
  SummaryLanguage,
  SummaryGenerationOptions,
  PortfolioSummaryReport,
  PropertyPerformanceSummary,
  DealAnalysisSummary,
  MarketReport,
  ExecutiveDashboardSummary,
} from '@real-estate-analyzer/types';
import { ILLMProvider } from '../llm/providers/llm-provider.interface';
import { PropertyService } from '../property/property.service';
import { DealService } from '../deal/deal.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { ValuationService } from '../valuation/valuation.service';
import { MarketService } from '../market/market.service';
import { LLMService } from '../llm/llm.service';
import { StructuredLoggerService } from '../common/logging/structured-logger.service';
import { buildPortfolioSummaryPrompt } from './prompts/portfolio-summary.prompt';
import { buildPropertySummaryPrompt } from './prompts/property-summary.prompt';
import { buildDealSummaryPrompt } from './prompts/deal-summary.prompt';
import { buildMarketReportPrompt } from './prompts/market-report.prompt';
import { buildExecutiveSummaryPrompt } from './prompts/executive-summary.prompt';

@Injectable()
export class SummaryService {
  constructor(
    @Inject('ILLMProvider')
    private readonly llmProvider: ILLMProvider,
    private readonly propertyService: PropertyService,
    private readonly dealService: DealService,
    private readonly analyticsService: AnalyticsService,
    private readonly valuationService: ValuationService,
    private readonly marketService: MarketService,
    private readonly llmService: LLMService,
    private readonly logger: StructuredLoggerService
  ) {}

  /**
   * Generate portfolio summary
   */
  async generatePortfolioSummary(
    organizationId: string,
    options: SummaryGenerationOptions
  ): Promise<PortfolioSummaryReport> {
    const startTime = Date.now();

    try {
      const period = options.period || {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        end: new Date(),
      };

      // Gather portfolio data
      const properties = await this.propertyService.findAll(organizationId, false);
      const deals = await this.dealService.findAll(organizationId);
      const portfolioSummary = await this.analyticsService.getPortfolioSummary({});
      const dashboard = await this.analyticsService.getDashboard({});

      const portfolioData = {
        properties: properties.length,
        deals: deals.length,
        portfolioSummary,
        dashboard,
      };

      const prompt = buildPortfolioSummaryPrompt(
        portfolioData,
        period,
        options.language || SummaryLanguage.EN
      );

      const response = await this.generateWithLLM(prompt);
      const summaryData = this.parseJSONResponse(response.content);

      const duration = Date.now() - startTime;
      this.logger.logWithMetadata(
        'info',
        `Portfolio summary generated`,
        {
          organizationId,
          duration,
          format: options.format,
        },
        'SummaryService'
      );

      return {
        id: this.generateId(),
        organizationId,
        generatedAt: new Date(),
        period,
        ...summaryData,
        format: options.format,
        language: options.language || SummaryLanguage.EN,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate portfolio summary: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'SummaryService',
        { organizationId }
      );
      throw error;
    }
  }

  /**
   * Generate property performance summary
   */
  async generatePropertySummary(
    propertyId: string,
    organizationId: string,
    options: SummaryGenerationOptions
  ): Promise<PropertyPerformanceSummary> {
    const startTime = Date.now();

    try {
      const period = options.period || {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(),
      };

      const property = await this.propertyService.findOne(propertyId, organizationId, true);
      const deals = property.deals || [];
      const marketTrend = await this.marketService.getMarketTrend(property.zipCode).catch(() => null);

      // Calculate performance metrics
      const performanceData = {
        deals: deals.map((d) => {
          const valuation = this.valuationService.calculateDealValuation(d);
          return {
            dealId: d.id,
            capRate: valuation.capRate?.rate,
            cashOnCash: valuation.returnMetrics?.cashOnCashReturn,
            monthlyCashFlow: valuation.cashFlow?.monthlyCashFlow,
          };
        }),
      };

      const prompt = buildPropertySummaryPrompt(
        property,
        performanceData,
        marketTrend,
        period,
        options.language || SummaryLanguage.EN
      );

      const response = await this.generateWithLLM(prompt);
      const summaryData = this.parseJSONResponse(response.content);

      const duration = Date.now() - startTime;
      this.logger.logWithMetadata(
        'info',
        `Property summary generated`,
        {
          propertyId,
          duration,
          format: options.format,
        },
        'SummaryService'
      );

      return {
        id: this.generateId(),
        propertyId,
        organizationId,
        generatedAt: new Date(),
        period,
        ...summaryData,
        format: options.format,
        language: options.language || SummaryLanguage.EN,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate property summary: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'SummaryService',
        { propertyId }
      );
      throw error;
    }
  }

  /**
   * Generate deal analysis summary
   */
  async generateDealSummary(
    dealId: string,
    organizationId: string,
    options: SummaryGenerationOptions
  ): Promise<DealAnalysisSummary> {
    const startTime = Date.now();

    try {
      const deal = await this.dealService.findOne(dealId, organizationId);
      const property = await this.propertyService.findOne(deal.propertyId, organizationId, false);
      const valuation = this.valuationService.calculateDealValuation(deal);
      
      // Get risk assessment from LLM service
      const riskAssessment = await this.llmService.assessRisk(undefined, dealId, organizationId).catch(() => null);

      const dealData = {
        ...deal,
        propertyAddress: property.address,
      };

      const prompt = buildDealSummaryPrompt(
        dealData,
        valuation,
        riskAssessment,
        options.language || SummaryLanguage.EN
      );

      const response = await this.generateWithLLM(prompt);
      const summaryData = this.parseJSONResponse(response.content);

      const duration = Date.now() - startTime;
      this.logger.logWithMetadata(
        'info',
        `Deal summary generated`,
        {
          dealId,
          duration,
          format: options.format,
        },
        'SummaryService'
      );

      return {
        id: this.generateId(),
        dealId,
        organizationId,
        generatedAt: new Date(),
        ...summaryData,
        format: options.format,
        language: options.language || SummaryLanguage.EN,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate deal summary: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'SummaryService',
        { dealId }
      );
      throw error;
    }
  }

  /**
   * Generate market report
   */
  async generateMarketReport(
    zipCode: string,
    organizationId: string,
    options: SummaryGenerationOptions
  ): Promise<MarketReport> {
    const startTime = Date.now();

    try {
      const period = options.period || {
        start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        end: new Date(),
      };

      const marketTrend = await this.marketService.getMarketTrend(zipCode);
      const neighborhoodAnalysis = await this.marketService.getNeighborhoodAnalysis(zipCode).catch(() => null);
      const rentalTrend = await this.marketService.getRentalMarketTrend(zipCode).catch(() => null);

      const marketData = {
        trend: marketTrend,
        neighborhood: neighborhoodAnalysis,
        rental: rentalTrend,
      };

      const prompt = buildMarketReportPrompt(
        marketData,
        marketTrend,
        period,
        options.language || SummaryLanguage.EN
      );

      const response = await this.generateWithLLM(prompt);
      const summaryData = this.parseJSONResponse(response.content);

      const duration = Date.now() - startTime;
      this.logger.logWithMetadata(
        'info',
        `Market report generated`,
        {
          zipCode,
          duration,
          format: options.format,
        },
        'SummaryService'
      );

      return {
        id: this.generateId(),
        organizationId,
        generatedAt: new Date(),
        market: { zipCode },
        period,
        ...summaryData,
        format: options.format,
        language: options.language || SummaryLanguage.EN,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate market report: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'SummaryService',
        { zipCode }
      );
      throw error;
    }
  }

  /**
   * Generate executive dashboard summary
   */
  async generateExecutiveSummary(
    organizationId: string,
    options: SummaryGenerationOptions
  ): Promise<ExecutiveDashboardSummary> {
    const startTime = Date.now();

    try {
      const period = options.period || {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(),
      };

      const dashboard = await this.analyticsService.getDashboard({});
      const portfolioSummary = await this.analyticsService.getPortfolioSummary({});
      const properties = await this.propertyService.findAll(organizationId, false);

      const prompt = buildExecutiveSummaryPrompt(
        dashboard,
        { portfolioSummary, propertyCount: properties.length },
        period,
        options.language || SummaryLanguage.EN
      );

      const response = await this.generateWithLLM(prompt);
      const summaryData = this.parseJSONResponse(response.content);

      const duration = Date.now() - startTime;
      this.logger.logWithMetadata(
        'info',
        `Executive summary generated`,
        {
          organizationId,
          duration,
          format: options.format,
        },
        'SummaryService'
      );

      return {
        id: this.generateId(),
        organizationId,
        generatedAt: new Date(),
        period,
        ...summaryData,
        format: options.format,
        language: options.language || SummaryLanguage.EN,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate executive summary: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'SummaryService',
        { organizationId }
      );
      throw error;
    }
  }

  /**
   * Generate summary using LLM
   */
  private async generateWithLLM(prompt: string): Promise<any> {
    const messages = [
      {
        role: 'system' as const,
        content: 'You are a real estate investment analyst. Generate comprehensive, data-driven summaries in JSON format.',
      },
      {
        role: 'user' as const,
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
        'SummaryService'
      );
      throw new Error(`Invalid JSON response from LLM: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

