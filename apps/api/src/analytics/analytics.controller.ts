import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AnalyticsCacheService } from './cache/analytics-cache.service';
import { AggregationOptions } from '@real-estate-analyzer/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly cacheService: AnalyticsCacheService
  ) {}

  /**
   * Get complete analytics dashboard
   * GET /api/analytics/dashboard
   */
  @Get('dashboard')
  @ApiOperation({
    summary: 'Get analytics dashboard',
    description: 'Returns comprehensive analytics dashboard with portfolio summary, metrics, and performance data.',
  })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'propertyIds', required: false, type: String })
  @ApiQuery({ name: 'dealIds', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  async getDashboard(@Query() query: any, @Request() req: any) {
    const options: AggregationOptions = {
      startDate: query.startDate,
      endDate: query.endDate,
      propertyIds: query.propertyIds
        ? query.propertyIds.split(',')
        : undefined,
      dealIds: query.dealIds ? query.dealIds.split(',') : undefined,
      status: query.status ? query.status.split(',') : undefined,
    };

    const cacheKey = this.cacheService.generateKey('dashboard', options);
    const cached = this.cacheService.get(cacheKey);

    if (cached) {
      return cached;
    }

    const dashboard = await this.analyticsService.getDashboard(options, req.user.organizationId);
    this.cacheService.set(cacheKey, dashboard);

    return dashboard;
  }

  /**
   * Get portfolio summary
   * GET /api/analytics/portfolio/summary
   */
  @Get('portfolio/summary')
  @ApiOperation({
    summary: 'Get portfolio summary',
    description: 'Returns aggregated portfolio metrics and summary statistics.',
  })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'propertyIds', required: false, type: String })
  @ApiQuery({ name: 'dealIds', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Portfolio summary retrieved successfully' })
  async getPortfolioSummary(@Query() query: any, @Request() req: any) {
    const options: AggregationOptions = {
      startDate: query.startDate,
      endDate: query.endDate,
      propertyIds: query.propertyIds
        ? query.propertyIds.split(',')
        : undefined,
      dealIds: query.dealIds ? query.dealIds.split(',') : undefined,
      status: query.status ? query.status.split(',') : undefined,
    };

    const cacheKey = this.cacheService.generateKey('portfolio_summary', options);
    const cached = this.cacheService.get(cacheKey);

    if (cached) {
      return cached;
    }

    const summary = await this.analyticsService.getPortfolioSummary(options, req.user.organizationId);
    this.cacheService.set(cacheKey, summary);

    return summary;
  }

  /**
   * Get cash flow trend
   * GET /api/analytics/metrics/cash-flow-trend
   */
  @Get('metrics/cash-flow-trend')
  async getCashFlowTrend(@Query() query: any) {
    const options: AggregationOptions = {
      startDate: query.startDate,
      endDate: query.endDate,
      propertyIds: query.propertyIds
        ? query.propertyIds.split(',')
        : undefined,
    };

    const cacheKey = this.cacheService.generateKey('cash_flow_trend', options);
    const cached = this.cacheService.get(cacheKey);

    if (cached) {
      return cached;
    }

    const trend = await this.analyticsService.getCashFlowTrend(options);
    this.cacheService.set(cacheKey, trend);

    return trend;
  }

  /**
   * Get portfolio growth
   * GET /api/analytics/metrics/portfolio-growth
   */
  @Get('metrics/portfolio-growth')
  @ApiOperation({
    summary: 'Get portfolio growth',
    description: 'Returns time-series data for portfolio growth over time.',
  })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'propertyIds', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Portfolio growth retrieved successfully' })
  async getPortfolioGrowth(@Query() query: any, @Request() req: any) {
    const options: AggregationOptions = {
      startDate: query.startDate,
      endDate: query.endDate,
      propertyIds: query.propertyIds
        ? query.propertyIds.split(',')
        : undefined,
    };

    const cacheKey = this.cacheService.generateKey('portfolio_growth', options);
    const cached = this.cacheService.get(cacheKey);

    if (cached) {
      return cached;
    }

    const growth = await this.analyticsService.getPortfolioGrowth(options, req.user.organizationId);
    this.cacheService.set(cacheKey, growth);

    return growth;
  }

  /**
   * Get market comparisons
   * GET /api/analytics/market/comparisons
   */
  @Get('market/comparisons')
  @ApiOperation({
    summary: 'Get market comparisons',
    description: 'Returns market comparison data for properties and deals.',
  })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'propertyIds', required: false, type: String })
  @ApiQuery({ name: 'dealIds', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Market comparisons retrieved successfully' })
  async getMarketComparisons(@Query() query: any, @Request() req: any) {
    const options: AggregationOptions = {
      startDate: query.startDate,
      endDate: query.endDate,
      propertyIds: query.propertyIds
        ? query.propertyIds.split(',')
        : undefined,
      dealIds: query.dealIds ? query.dealIds.split(',') : undefined,
    };

    const cacheKey = this.cacheService.generateKey('market_comparisons', options);
    const cached = this.cacheService.get(cacheKey);

    if (cached) {
      return cached;
    }

    const comparisons = await this.analyticsService.getMarketComparisons(options, req.user.organizationId);
    this.cacheService.set(cacheKey, comparisons);

    return comparisons;
  }

  /**
   * Get property performance
   * GET /api/analytics/properties/performance
   */
  @Get('properties/performance')
  @ApiOperation({
    summary: 'Get property performance',
    description: 'Returns performance metrics for properties.',
  })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'propertyIds', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Property performance retrieved successfully' })
  async getPropertyPerformance(@Query() query: any, @Request() req: any) {
    const options: AggregationOptions = {
      startDate: query.startDate,
      endDate: query.endDate,
      propertyIds: query.propertyIds
        ? query.propertyIds.split(',')
        : undefined,
    };

    const cacheKey = this.cacheService.generateKey('property_performance', options);
    const cached = this.cacheService.get(cacheKey);

    if (cached) {
      return cached;
    }

    const performance = await this.analyticsService.getPropertyPerformance(options, req.user.organizationId);
    this.cacheService.set(cacheKey, performance);

    return performance;
  }

  /**
   * Get deal performance rankings
   * GET /api/analytics/deals/rankings?limit=10
   */
  @Get('deals/rankings')
  @ApiOperation({
    summary: 'Get deal performance rankings',
    description: 'Returns ranked list of deals by performance metrics.',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of rankings to return' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'propertyIds', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Deal rankings retrieved successfully' })
  async getDealRankings(
    @Query('limit') limit?: string,
    @Query() query?: any,
    @Request() req?: any
  ) {
    const options: AggregationOptions = {
      startDate: query.startDate,
      endDate: query.endDate,
      propertyIds: query.propertyIds
        ? query.propertyIds.split(',')
        : undefined,
      status: query.status ? query.status.split(',') : undefined,
    };

    const limitNum = limit ? parseInt(limit, 10) : 10;
    const cacheKey = this.cacheService.generateKey('deal_rankings', {
      ...options,
      limit: limitNum,
    });
    const cached = this.cacheService.get(cacheKey);

    if (cached) {
      return cached;
    }

    const rankings = await this.analyticsService.getDealPerformanceRankings(
      options,
      limitNum,
      req?.user?.organizationId
    );
    this.cacheService.set(cacheKey, rankings);

    return rankings;
  }

  /**
   * Invalidate analytics cache
   * GET /api/analytics/cache/invalidate?pattern=analytics:.*
   */
  @Get('cache/invalidate')
  async invalidateCache(@Query('pattern') pattern?: string) {
    if (pattern) {
      this.cacheService.invalidatePattern(pattern);
      return { message: `Cache invalidated for pattern: ${pattern}` };
    } else {
      this.cacheService.clear();
      return { message: 'All analytics cache cleared' };
    }
  }

  /**
   * Get cache statistics
   * GET /api/analytics/cache/stats
   */
  @Get('cache/stats')
  getCacheStats() {
    return this.cacheService.getStats();
  }
}

