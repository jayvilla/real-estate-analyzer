import { Injectable } from '@nestjs/common';
import { PropertyService } from '../property/property.service';
import { DealService } from '../deal/deal.service';
import { ValuationService } from '../valuation/valuation.service';
import { StructuredLoggerService } from '../common/logging/structured-logger.service';
import {
  PortfolioSummary,
  TimeSeriesMetrics,
  TimeSeriesDataPoint,
  MarketComparison,
  PropertyPerformance,
  DealPerformanceRanking,
  AnalyticsDashboard,
  AggregationOptions,
} from '@real-estate-analyzer/types';
import { DealEntity } from '../deal/entities/deal.entity';
import { PropertyEntity } from '../property/entities/property.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly dealService: DealService,
    private readonly valuationService: ValuationService,
    private readonly logger: StructuredLoggerService
  ) {}

  /**
   * Get portfolio summary with aggregated metrics
   */
  async getPortfolioSummary(options?: AggregationOptions): Promise<PortfolioSummary> {
    try {
      const properties = await this.propertyService.findAll(true);
      const allDeals = await this.dealService.findAll();

      // Filter by options if provided
      let deals = allDeals;
      if (options?.propertyIds) {
        deals = deals.filter((d) => options.propertyIds!.includes(d.propertyId));
      }
      if (options?.dealIds) {
        deals = deals.filter((d) => options.dealIds!.includes(d.id));
      }
      if (options?.status) {
        deals = deals.filter((d) => options.status!.includes(d.status));
      }

      const activeDeals = deals.filter(
        (d) => d.status === 'CLOSED' || d.status === 'UNDER_CONTRACT'
      );

      // Calculate valuations for all deals
      const valuations = deals.map((deal) =>
        this.valuationService.calculateDealValuation(deal)
      );

      // Aggregate metrics
      const totalPortfolioValue = properties.reduce(
        (sum, p) => sum + (p.currentValue || 0),
        0
      );

      const totalCashInvested = valuations.reduce(
        (sum, v) => sum + v.totalAcquisitionCost,
        0
      );

      const totalAnnualCashFlow = valuations.reduce(
        (sum, v) => sum + v.cashFlow.annualCashFlow,
        0
      );

      const totalMonthlyCashFlow = totalAnnualCashFlow / 12;

      const totalAnnualNOI = valuations.reduce(
        (sum, v) => sum + v.noi.noi,
        0
      );

      // Calculate averages
      const capRates = valuations
        .map((v) => v.capRate.capRate)
        .filter((r) => r > 0);
      const averageCapRate =
        capRates.length > 0
          ? capRates.reduce((sum, r) => sum + r, 0) / capRates.length
          : undefined;

      const cashOnCashReturns = valuations
        .map((v) => v.returns.cashOnCashReturn)
        .filter((r) => r > 0);
      const averageCashOnCashReturn =
        cashOnCashReturns.length > 0
          ? cashOnCashReturns.reduce((sum, r) => sum + r, 0) /
            cashOnCashReturns.length
          : undefined;

      return {
        totalProperties: properties.length,
        totalDeals: deals.length,
        activeDeals: activeDeals.length,
        totalPortfolioValue: Math.round(totalPortfolioValue * 100) / 100,
        totalCashInvested: Math.round(totalCashInvested * 100) / 100,
        totalAnnualCashFlow: Math.round(totalAnnualCashFlow * 100) / 100,
        averageCapRate: averageCapRate
          ? Math.round(averageCapRate * 100) / 100
          : undefined,
        averageCashOnCashReturn: averageCashOnCashReturn
          ? Math.round(averageCashOnCashReturn * 100) / 100
          : undefined,
        totalMonthlyCashFlow: Math.round(totalMonthlyCashFlow * 100) / 100,
        totalAnnualNOI: Math.round(totalAnnualNOI * 100) / 100,
      };
    } catch (error) {
      this.logger.error(
        `Error calculating portfolio summary: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'AnalyticsService'
      );
      throw error;
    }
  }

  /**
   * Get time-series metrics for cash flow
   */
  async getCashFlowTrend(
    options?: AggregationOptions
  ): Promise<TimeSeriesMetrics> {
    try {
      const deals = await this.dealService.findAll();
      const filteredDeals = this.filterDeals(deals, options);

      // Group by month
      const monthlyData = new Map<string, number>();

      for (const deal of filteredDeals) {
        const valuation = this.valuationService.calculateDealValuation(deal);
        const month = new Date(deal.purchaseDate).toISOString().substring(0, 7); // YYYY-MM

        const current = monthlyData.get(month) || 0;
        monthlyData.set(month, current + valuation.cashFlow.monthlyCashFlow);
      }

      const dataPoints: TimeSeriesDataPoint[] = Array.from(monthlyData.entries())
        .map(([date, value]) => ({
          date: `${date}-01`,
          value: Math.round(value * 100) / 100,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        metric: 'monthly_cash_flow',
        unit: 'USD',
        dataPoints,
        period: 'monthly',
        startDate: dataPoints[0]?.date || new Date().toISOString(),
        endDate: dataPoints[dataPoints.length - 1]?.date || new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Error calculating cash flow trend: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'AnalyticsService'
      );
      throw error;
    }
  }

  /**
   * Get portfolio growth over time
   */
  async getPortfolioGrowth(
    options?: AggregationOptions
  ): Promise<TimeSeriesMetrics> {
    try {
      const deals = await this.dealService.findAll();
      const filteredDeals = this.filterDeals(deals, options);

      // Group by month and calculate cumulative cash invested
      const monthlyData = new Map<string, number>();
      let cumulative = 0;

      const sortedDeals = [...filteredDeals].sort(
        (a, b) =>
          new Date(a.purchaseDate).getTime() -
          new Date(b.purchaseDate).getTime()
      );

      for (const deal of sortedDeals) {
        const valuation = this.valuationService.calculateDealValuation(deal);
        const month = new Date(deal.purchaseDate).toISOString().substring(0, 7);

        cumulative += valuation.totalAcquisitionCost;
        monthlyData.set(month, cumulative);
      }

      const dataPoints: TimeSeriesDataPoint[] = Array.from(monthlyData.entries())
        .map(([date, value]) => ({
          date: `${date}-01`,
          value: Math.round(value * 100) / 100,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        metric: 'portfolio_growth',
        unit: 'USD',
        dataPoints,
        period: 'monthly',
        startDate: dataPoints[0]?.date || new Date().toISOString(),
        endDate: dataPoints[dataPoints.length - 1]?.date || new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Error calculating portfolio growth: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'AnalyticsService'
      );
      throw error;
    }
  }

  /**
   * Get market comparisons for deals
   */
  async getMarketComparisons(
    options?: AggregationOptions
  ): Promise<MarketComparison[]> {
    try {
      const deals = await this.dealService.findAll();
      const filteredDeals = this.filterDeals(deals, options);

      if (filteredDeals.length === 0) {
        return [];
      }

      const valuations = filteredDeals.map((deal) =>
        this.valuationService.calculateDealValuation(deal)
      );

      // Calculate market averages
      const capRates = valuations
        .map((v) => v.capRate.capRate)
        .filter((r) => r > 0);
      const avgCapRate =
        capRates.length > 0
          ? capRates.reduce((sum, r) => sum + r, 0) / capRates.length
          : 0;

      const cashOnCashReturns = valuations
        .map((v) => v.returns.cashOnCashReturn)
        .filter((r) => r > 0);
      const avgCashOnCash =
        cashOnCashReturns.length > 0
          ? cashOnCashReturns.reduce((sum, r) => sum + r, 0) /
            cashOnCashReturns.length
          : 0;

      // Create comparisons
      const comparisons: MarketComparison[] = [];

      for (const valuation of valuations) {
        // Cap rate comparison
        comparisons.push({
          dealId: valuation.dealId,
          metric: 'cap_rate',
          value: valuation.capRate.capRate,
          marketAverage: avgCapRate,
          difference: valuation.capRate.capRate - avgCapRate,
          differencePercent:
            avgCapRate > 0
              ? ((valuation.capRate.capRate - avgCapRate) / avgCapRate) * 100
              : 0,
          comparison:
            valuation.capRate.capRate > avgCapRate
              ? 'above'
              : valuation.capRate.capRate < avgCapRate
              ? 'below'
              : 'at',
        });

        // Cash-on-cash comparison
        comparisons.push({
          dealId: valuation.dealId,
          metric: 'cash_on_cash_return',
          value: valuation.returns.cashOnCashReturn,
          marketAverage: avgCashOnCash,
          difference: valuation.returns.cashOnCashReturn - avgCashOnCash,
          differencePercent:
            avgCashOnCash > 0
              ? ((valuation.returns.cashOnCashReturn - avgCashOnCash) /
                  avgCashOnCash) *
                100
              : 0,
          comparison:
            valuation.returns.cashOnCashReturn > avgCashOnCash
              ? 'above'
              : valuation.returns.cashOnCashReturn < avgCashOnCash
              ? 'below'
              : 'at',
        });
      }

      return comparisons;
    } catch (error) {
      this.logger.error(
        `Error calculating market comparisons: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'AnalyticsService'
      );
      throw error;
    }
  }

  /**
   * Get property performance metrics
   */
  async getPropertyPerformance(
    options?: AggregationOptions
  ): Promise<PropertyPerformance[]> {
    try {
      const properties = await this.propertyService.findAll(true);
      const allDeals = await this.dealService.findAll();

      const performance: PropertyPerformance[] = [];

      for (const property of properties) {
        const propertyDeals = allDeals.filter(
          (d) => d.propertyId === property.id
        );

        if (propertyDeals.length === 0) continue;

        const valuations = propertyDeals.map((deal) =>
          this.valuationService.calculateDealValuation(deal)
        );

        const totalCashInvested = valuations.reduce(
          (sum, v) => sum + v.totalAcquisitionCost,
          0
        );

        const totalAnnualCashFlow = valuations.reduce(
          (sum, v) => sum + v.cashFlow.annualCashFlow,
          0
        );

        const capRates = valuations
          .map((v) => v.capRate.capRate)
          .filter((r) => r > 0);
        const avgCapRate =
          capRates.length > 0
            ? capRates.reduce((sum, r) => sum + r, 0) / capRates.length
            : undefined;

        const cashOnCashReturns = valuations
          .map((v) => v.returns.cashOnCashReturn)
          .filter((r) => r > 0);
        const avgCashOnCash =
          cashOnCashReturns.length > 0
            ? cashOnCashReturns.reduce((sum, r) => sum + r, 0) /
              cashOnCashReturns.length
            : undefined;

        // Find best and worst deals
        const sortedByReturn = [...valuations].sort(
          (a, b) => b.returns.cashOnCashReturn - a.returns.cashOnCashReturn
        );

        performance.push({
          propertyId: property.id,
          address: property.address,
          totalDeals: propertyDeals.length,
          totalCashInvested: Math.round(totalCashInvested * 100) / 100,
          totalAnnualCashFlow: Math.round(totalAnnualCashFlow * 100) / 100,
          averageCapRate: avgCapRate
            ? Math.round(avgCapRate * 100) / 100
            : undefined,
          averageCashOnCashReturn: avgCashOnCash
            ? Math.round(avgCashOnCash * 100) / 100
            : undefined,
          bestDeal:
            sortedByReturn.length > 0
              ? {
                  dealId: sortedByReturn[0].dealId,
                  cashOnCashReturn: sortedByReturn[0].returns.cashOnCashReturn,
                }
              : undefined,
          worstDeal:
            sortedByReturn.length > 1
              ? {
                  dealId:
                    sortedByReturn[sortedByReturn.length - 1].dealId,
                  cashOnCashReturn:
                    sortedByReturn[sortedByReturn.length - 1].returns
                      .cashOnCashReturn,
                }
              : undefined,
        });
      }

      return performance;
    } catch (error) {
      this.logger.error(
        `Error calculating property performance: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'AnalyticsService'
      );
      throw error;
    }
  }

  /**
   * Get deal performance rankings
   */
  async getDealPerformanceRankings(
    options?: AggregationOptions,
    limit: number = 10
  ): Promise<DealPerformanceRanking[]> {
    try {
      const deals = await this.dealService.findAll();
      const filteredDeals = this.filterDeals(deals, options);
      const properties = await this.propertyService.findAll();

      const rankings: DealPerformanceRanking[] = [];

      for (const deal of filteredDeals) {
        const property = properties.find((p) => p.id === deal.propertyId);
        const valuation = this.valuationService.calculateDealValuation(deal);

        rankings.push({
          dealId: deal.id,
          propertyId: deal.propertyId,
          propertyAddress: property?.address || 'Unknown',
          purchasePrice: deal.purchasePrice,
          cashOnCashReturn: valuation.returns.cashOnCashReturn,
          capRate: valuation.capRate.capRate,
          monthlyCashFlow: valuation.cashFlow.monthlyCashFlow,
          annualCashFlow: valuation.cashFlow.annualCashFlow,
          rank: 0, // Will be set after sorting
        });
      }

      // Sort by cash-on-cash return (descending)
      rankings.sort(
        (a, b) => b.cashOnCashReturn - a.cashOnCashReturn
      );

      // Assign ranks
      rankings.forEach((ranking, index) => {
        ranking.rank = index + 1;
      });

      return rankings.slice(0, limit);
    } catch (error) {
      this.logger.error(
        `Error calculating deal rankings: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'AnalyticsService'
      );
      throw error;
    }
  }

  /**
   * Get complete analytics dashboard data
   */
  async getDashboard(
    options?: AggregationOptions
  ): Promise<AnalyticsDashboard> {
    try {
      const [
        portfolioSummary,
        topPerformers,
        bottomPerformers,
        cashFlowTrend,
        portfolioGrowth,
        marketComparisons,
        propertyPerformance,
      ] = await Promise.all([
        this.getPortfolioSummary(options),
        this.getDealPerformanceRankings(options, 10),
        this.getDealPerformanceRankings(options, 10).then((rankings) =>
          rankings.reverse().slice(0, 10)
        ),
        this.getCashFlowTrend(options),
        this.getPortfolioGrowth(options),
        this.getMarketComparisons(options),
        this.getPropertyPerformance(options),
      ]);

      // Get recent activity (simplified - in production, would query event store)
      const recentDeals = await this.dealService.findAll();
      const recentProperties = await this.propertyService.findAll();

      const recentActivity = [
        ...recentProperties.slice(0, 5).map((p) => ({
          type: 'property_created' as const,
          id: p.id,
          timestamp: p.createdAt.toISOString(),
          description: `Property created: ${p.address}`,
        })),
        ...recentDeals.slice(0, 5).map((d) => ({
          type: 'deal_created' as const,
          id: d.id,
          timestamp: d.createdAt.toISOString(),
          description: `Deal created: $${d.purchasePrice.toLocaleString()}`,
        })),
      ]
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 10);

      return {
        portfolioSummary,
        topPerformers,
        bottomPerformers,
        cashFlowTrend,
        portfolioGrowth,
        marketComparisons,
        propertyPerformance,
        recentActivity,
      };
    } catch (error) {
      this.logger.error(
        `Error generating dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'AnalyticsService'
      );
      throw error;
    }
  }

  /**
   * Helper to filter deals based on options
   */
  private filterDeals(
    deals: DealEntity[],
    options?: AggregationOptions
  ): DealEntity[] {
    let filtered = [...deals];

    if (options?.propertyIds) {
      filtered = filtered.filter((d) =>
        options.propertyIds!.includes(d.propertyId)
      );
    }

    if (options?.dealIds) {
      filtered = filtered.filter((d) => options.dealIds!.includes(d.id));
    }

    if (options?.status) {
      filtered = filtered.filter((d) => options.status!.includes(d.status));
    }

    if (options?.startDate) {
      const start = new Date(options.startDate);
      filtered = filtered.filter(
        (d) => new Date(d.purchaseDate) >= start
      );
    }

    if (options?.endDate) {
      const end = new Date(options.endDate);
      filtered = filtered.filter((d) => new Date(d.purchaseDate) <= end);
    }

    return filtered;
  }
}

