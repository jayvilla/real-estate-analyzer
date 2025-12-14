import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
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

@ApiTags('LLM')
@Controller('llm')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class LLMController {
  constructor(private readonly llmService: LLMService) {}

  /**
   * Analyze a property with LLM insights
   */
  @Get('property/:propertyId/analysis')
  @ApiOperation({
    summary: 'Analyze property with AI insights',
    description: `
      Generates comprehensive AI-powered analysis for a property including:
      - Property strengths and weaknesses
      - Investment potential assessment
      - Market positioning
      - Recommendations for improvement
      - Risk factors
      
      The analysis is context-aware and considers the user's portfolio, market conditions, and property characteristics.
      Results are cached to optimize performance and reduce costs.
    `,
  })
  @ApiParam({
    name: 'propertyId',
    description: 'Unique identifier of the property to analyze',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Property analysis generated successfully',
    schema: {
      type: 'object',
      properties: {
        strengths: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of property strengths identified by AI',
        },
        weaknesses: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of property weaknesses identified by AI',
        },
        investmentPotential: {
          type: 'string',
          enum: ['high', 'medium', 'low'],
          description: 'Overall investment potential rating',
        },
        recommendations: {
          type: 'array',
          items: { type: 'string' },
          description: 'AI-generated recommendations for the property',
        },
        riskFactors: {
          type: 'array',
          items: { type: 'string' },
          description: 'Identified risk factors',
        },
        marketPositioning: {
          type: 'string',
          description: 'Analysis of property position in the market',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Property not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - AI service unavailable or error occurred',
  })
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
  @ApiOperation({
    summary: 'Get AI-powered deal recommendation',
    description: `
      Provides AI-generated recommendation for a real estate deal including:
      - Overall recommendation (buy, pass, negotiate)
      - Key factors influencing the decision
      - Suggested negotiation points
      - Expected returns analysis
      - Risk assessment
      
      The recommendation considers deal metrics, market conditions, and portfolio fit.
    `,
  })
  @ApiParam({
    name: 'dealId',
    description: 'Unique identifier of the deal',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Deal recommendation generated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Deal not found',
  })
  async getDealRecommendation(
    @Param('dealId') dealId: string,
    @Request() req: any
  ): Promise<DealRecommendation> {
    return this.llmService.getDealRecommendation(dealId, req.user.organizationId);
  }

  /**
   * Assess risk for property or deal
   */
  @Get('risk-assessment')
  @ApiOperation({
    summary: 'Assess investment risk',
    description: `
      Performs comprehensive risk assessment for a property or deal:
      - Financial risk analysis
      - Market risk factors
      - Location-based risks
      - Operational risks
      - Risk mitigation strategies
      
      Can be used for both properties and deals. Provide either propertyId or dealId.
    `,
  })
  @ApiQuery({
    name: 'propertyId',
    required: false,
    description: 'Property ID for risk assessment',
    type: String,
  })
  @ApiQuery({
    name: 'dealId',
    required: false,
    description: 'Deal ID for risk assessment',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Risk assessment completed',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Must provide either propertyId or dealId',
  })
  async assessRisk(
    @Query('propertyId') propertyId: string | undefined,
    @Query('dealId') dealId: string | undefined,
    @Request() req: any
  ): Promise<RiskAssessment> {
    return this.llmService.assessRisk(
      propertyId,
      dealId,
      req.user.organizationId
    );
  }

  /**
   * Assess risk for property or deal (shorter alias)
   */
  @Get('risk')
  @ApiOperation({
    summary: 'Assess investment risk (alias)',
    description: `
      Alias for /api/llm/risk-assessment. Performs comprehensive risk assessment for a property or deal.
      Provide either propertyId or dealId as query parameters.
    `,
  })
  @ApiQuery({
    name: 'propertyId',
    required: false,
    description: 'Property ID for risk assessment',
    type: String,
  })
  @ApiQuery({
    name: 'dealId',
    required: false,
    description: 'Deal ID for risk assessment',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Risk assessment completed',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Must provide either propertyId or dealId',
  })
  async assessRiskShort(
    @Query('propertyId') propertyId: string | undefined,
    @Query('dealId') dealId: string | undefined,
    @Request() req: any
  ): Promise<RiskAssessment> {
    return this.llmService.assessRisk(
      propertyId,
      dealId,
      req.user.organizationId
    );
  }

  /**
   * Get investment strategy suggestions
   */
  @Get('investment-strategy')
  @ApiOperation({
    summary: 'Get AI-powered investment strategy suggestions',
    description: `
      Generates personalized investment strategy recommendations based on:
      - Current portfolio composition
      - Investment goals
      - Market conditions
      - Risk tolerance
      - Available capital
      
      Provides actionable strategies for portfolio optimization and growth.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Investment strategy generated successfully',
  })
  async getInvestmentStrategy(
    @Request() req: any
  ): Promise<InvestmentStrategy> {
    return this.llmService.getInvestmentStrategy(req.user.organizationId);
  }

  /**
   * Get market commentary
   */
  @Get('market-commentary')
  @ApiOperation({
    summary: 'Get AI-generated market commentary',
    description: `
      Provides AI-generated commentary on current market conditions:
      - Market trends and patterns
      - Price movements
      - Inventory levels
      - Buyer/seller dynamics
      - Regional insights
      
      Commentary is based on current market data and historical trends.
    `,
  })
  @ApiQuery({
    name: 'zipCode',
    required: false,
    description: 'Zip code for location-specific commentary',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Market commentary generated successfully',
  })
  async getMarketCommentary(
    @Query('zipCode') zipCode: string | undefined,
    @Request() req: any
  ): Promise<MarketCommentary> {
    return this.llmService.getMarketCommentary(zipCode, req.user.organizationId);
  }

  /**
   * Generate natural language property description
   */
  @Get('property/:propertyId/description')
  @ApiOperation({
    summary: 'Generate natural language property description',
    description: `
      Creates a compelling, natural language description of a property:
      - Highlights key features and amenities
      - Describes location advantages
      - Emphasizes investment potential
      - Optimized for listings and marketing materials
      
      Descriptions are tailored based on property type and target audience.
    `,
  })
  @ApiParam({
    name: 'propertyId',
    description: 'Property ID to generate description for',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Property description generated successfully',
  })
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
  @ApiOperation({
    summary: 'Get AI-powered portfolio insights',
    description: `
      Provides comprehensive insights about the user's portfolio:
      - Portfolio performance analysis
      - Diversification assessment
      - Growth opportunities
      - Risk concentration
      - Optimization recommendations
      
      Insights are context-aware and consider all properties in the portfolio.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Portfolio insights generated successfully',
  })
  async getPortfolioInsights(@Request() req: any): Promise<PortfolioInsight> {
    return this.llmService.getPortfolioInsights(req.user.organizationId);
  }
}
