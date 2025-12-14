import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LLMService } from './llm.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  PropertyAnalysis,
  DealRecommendation,
  RiskAssessment,
  InvestmentStrategy,
  MarketCommentary,
  PropertyDescription,
  PortfolioInsight,
} from '@real-estate-analyzer/types';

@Controller('llm')
@UseGuards(JwtAuthGuard)
export class LLMController {
  constructor(private readonly llmService: LLMService) {}

  /**
   * Analyze a property with LLM insights
   */
  @Get('property/:propertyId/analysis')
  async analyzeProperty(
    @Param('propertyId') propertyId: string,
    @Request() req: any
  ): Promise<PropertyAnalysis> {
    return this.llmService.analyzeProperty(propertyId, req.user.organizationId);
  }

  /**
   * Get deal recommendation
   */
  @Get('deal/:dealId/recommendation')
  async getDealRecommendation(
    @Param('dealId') dealId: string,
    @Request() req: any
  ): Promise<DealRecommendation> {
    return this.llmService.getDealRecommendation(dealId, req.user.organizationId);
  }

  /**
   * Assess risk for property or deal
   */
  @Get('risk')
  async assessRisk(
    @Query('propertyId') propertyId?: string,
    @Query('dealId') dealId?: string,
    @Request() req?: any
  ): Promise<RiskAssessment> {
    return this.llmService.assessRisk(
      propertyId,
      dealId,
      req?.user?.organizationId
    );
  }

  /**
   * Get investment strategy recommendations
   */
  @Get('strategy')
  async getInvestmentStrategy(
    @Request() req: any
  ): Promise<InvestmentStrategy> {
    return this.llmService.getInvestmentStrategy(req.user.organizationId);
  }

  /**
   * Generate market commentary
   */
  @Get('market/:zipCode/commentary')
  async generateMarketCommentary(
    @Param('zipCode') zipCode: string
  ): Promise<MarketCommentary> {
    return this.llmService.generateMarketCommentary(zipCode);
  }

  /**
   * Generate natural language property description
   */
  @Get('property/:propertyId/description')
  async generatePropertyDescription(
    @Param('propertyId') propertyId: string,
    @Request() req: any
  ): Promise<PropertyDescription> {
    return this.llmService.generatePropertyDescription(
      propertyId,
      req.user.organizationId
    );
  }

  /**
   * Get portfolio insights
   */
  @Get('portfolio/insights')
  async getPortfolioInsights(
    @Request() req: any
  ): Promise<PortfolioInsight[]> {
    return this.llmService.getPortfolioInsights(req.user.organizationId);
  }

  /**
   * Check LLM provider availability
   */
  @Get('health')
  async checkHealth(): Promise<{ available: boolean; provider: string; models: string[] }> {
    const available = await this.llmService.isAvailable();
    const models = await this.llmService.getAvailableModels();
    return {
      available,
      provider: 'ollama', // This should come from the service
      models,
    };
  }
}

