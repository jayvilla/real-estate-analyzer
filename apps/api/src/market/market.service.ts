import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketDataEntity } from './entities/market-data.entity';
import { MarketAlertEntity, MarketAlertType } from './entities/market-alert.entity';
import { PropertyService } from '../property/property.service';
import { DealService } from '../deal/deal.service';
import { StructuredLoggerService } from '../common/logging/structured-logger.service';
import {
  MarketTrend,
  MarketDataPoint,
  NeighborhoodAnalysis,
  RentalMarketTrend,
  AppreciationPrediction,
  ComparativeMarketAnalysis,
  MarketHeatMapData,
  MarketAlert,
  MarketAnalysisOptions,
} from '@real-estate-analyzer/types';
import { IMarketDataProvider } from './providers/market-data.provider';

@Injectable()
export class MarketService {
  constructor(
    @InjectRepository(MarketDataEntity)
    private readonly marketDataRepository: Repository<MarketDataEntity>,
    @InjectRepository(MarketAlertEntity)
    private readonly alertRepository: Repository<MarketAlertEntity>,
    private readonly propertyService: PropertyService,
    private readonly dealService: DealService,
    private readonly logger: StructuredLoggerService,
    @Inject('IMarketDataProvider')
    private readonly marketDataProvider: IMarketDataProvider
  ) {}

  /**
   * Get market trend for a specific zip code
   */
  async getMarketTrend(
    zipCode: string,
    options?: MarketAnalysisOptions
  ): Promise<MarketTrend> {
    const startDate = options?.startDate
      ? new Date(options.startDate)
      : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 1 year ago
    const endDate = options?.endDate ? new Date(options.endDate) : new Date();

    // Try to get from database first
    let dataPoints = await this.marketDataRepository.find({
      where: { zipCode },
      order: { date: 'ASC' },
    });

    // If not enough data, fetch from provider and store
    if (dataPoints.length < 6) {
      const providerData = await this.marketDataProvider.getMarketData(
        zipCode,
        startDate,
        endDate
      );

      // Store in database
      for (const point of providerData) {
        const existing = await this.marketDataRepository.findOne({
          where: { zipCode, date: new Date(point.date) },
        });

        if (!existing) {
          const entity = this.marketDataRepository.create({
            zipCode: point.zipCode,
            city: point.city,
            state: point.state,
            date: new Date(point.date),
            medianPrice: point.medianPrice,
            averagePrice: point.averagePrice,
            pricePerSquareFoot: point.pricePerSquareFoot,
            medianRent: point.medianRent,
            averageRent: point.averageRent,
            daysOnMarket: point.daysOnMarket,
            inventoryCount: point.inventoryCount,
            salesCount: point.salesCount,
            appreciationRate: point.appreciationRate,
            source: 'provider',
          });
          await this.marketDataRepository.save(entity);
        }
      }

      dataPoints = await this.marketDataRepository.find({
        where: { zipCode },
        order: { date: 'ASC' },
      });
    }

    // Convert to MarketDataPoint format
    const marketDataPoints: MarketDataPoint[] = dataPoints.map((d) => ({
      date: d.date.toISOString().split('T')[0],
      zipCode: d.zipCode,
      city: d.city,
      state: d.state,
      medianPrice: d.medianPrice ? Number(d.medianPrice) : undefined,
      averagePrice: d.averagePrice ? Number(d.averagePrice) : undefined,
      pricePerSquareFoot: d.pricePerSquareFoot ? Number(d.pricePerSquareFoot) : undefined,
      medianRent: d.medianRent ? Number(d.medianRent) : undefined,
      averageRent: d.averageRent ? Number(d.averageRent) : undefined,
      daysOnMarket: d.daysOnMarket || undefined,
      inventoryCount: d.inventoryCount || undefined,
      salesCount: d.salesCount || undefined,
      appreciationRate: d.appreciationRate ? Number(d.appreciationRate) : undefined,
    }));

    // Calculate trend
    const trend = this.calculateTrend(marketDataPoints);
    const averageAppreciation = this.calculateAverageAppreciation(marketDataPoints);
    const currentData = marketDataPoints[marketDataPoints.length - 1];
    const previous30Days = marketDataPoints[Math.max(0, marketDataPoints.length - 2)];
    const previous90Days = marketDataPoints[Math.max(0, marketDataPoints.length - 4)];
    const previous1Year = marketDataPoints[0];

    return {
      zipCode,
      city: currentData?.city || '',
      state: currentData?.state || '',
      dataPoints: marketDataPoints,
      trend,
      averageAppreciationRate: averageAppreciation,
      currentMedianPrice: currentData?.medianPrice,
      currentMedianRent: currentData?.medianRent,
      priceChange30Days: this.calculatePriceChange(currentData, previous30Days),
      priceChange90Days: this.calculatePriceChange(currentData, previous90Days),
      priceChange1Year: this.calculatePriceChange(currentData, previous1Year),
    };
  }

  /**
   * Get neighborhood analysis
   */
  async getNeighborhoodAnalysis(zipCode: string): Promise<NeighborhoodAnalysis> {
    const trend = await this.getMarketTrend(zipCode);
    const rentalTrend = await this.getRentalMarketTrend(zipCode);

    const currentPrice = trend.currentMedianPrice || 0;
    const currentRent = rentalTrend.currentMedianRent || 0;
    const rentalYield = currentPrice > 0 ? (currentRent * 12 / currentPrice) * 100 : 0;

    const metrics = {
      priceTrend: trend.trend,
      rentalYield,
      appreciationRate: trend.averageAppreciationRate,
      inventoryLevel: this.getInventoryLevel(trend.dataPoints[trend.dataPoints.length - 1]?.inventoryCount || 0),
      daysOnMarket: trend.dataPoints[trend.dataPoints.length - 1]?.daysOnMarket || 0,
      salesVelocity: this.calculateSalesVelocity(trend.dataPoints),
    };

    const overallScore = this.calculateNeighborhoodScore(metrics);
    const recommendations = this.generateRecommendations(metrics);
    const riskFactors = this.identifyRiskFactors(metrics);

    return {
      zipCode,
      city: trend.city,
      state: trend.state,
      overallScore,
      metrics,
      recommendations,
      riskFactors,
    };
  }

  /**
   * Get rental market trend
   */
  async getRentalMarketTrend(zipCode: string): Promise<RentalMarketTrend> {
    const trend = await this.getMarketTrend(zipCode);
    const currentPrice = trend.currentMedianPrice || 0;

    const dataPoints = trend.dataPoints.map((point) => ({
      date: point.date,
      medianRent: point.medianRent || 0,
      averageRent: point.averageRent || 0,
      rentPerSquareFoot: point.pricePerSquareFoot
        ? (point.medianRent || 0) / (point.pricePerSquareFoot * 2000)
        : 0,
      vacancyRate: this.calculateVacancyRate(point),
      rentalYield: point.medianPrice && point.medianRent
        ? ((point.medianRent * 12) / point.medianPrice) * 100
        : 0,
    }));

    const currentData = dataPoints[dataPoints.length - 1];
    const previous30Days = dataPoints[Math.max(0, dataPoints.length - 2)];
    const previous1Year = dataPoints[0];

    return {
      zipCode,
      city: trend.city,
      state: trend.state,
      dataPoints,
      trend: this.calculateRentalTrend(dataPoints),
      averageRentalYield: dataPoints.reduce((sum, p) => sum + p.rentalYield, 0) / dataPoints.length,
      currentMedianRent: currentData?.medianRent,
      rentChange30Days: this.calculateRentChange(currentData, previous30Days),
      rentChange1Year: this.calculateRentChange(currentData, previous1Year),
    };
  }

  /**
   * Get appreciation rate predictions
   */
  async getAppreciationPrediction(
    zipCode: string,
    currentValue: number
  ): Promise<AppreciationPrediction> {
    const trend = await this.getMarketTrend(zipCode);
    const historicalAvg = trend.averageAppreciationRate;

    // Simple linear prediction based on historical trend
    const predictions = [
      {
        timeframe: '6months' as const,
        predictedValue: currentValue * (1 + historicalAvg / 200),
        appreciationRate: historicalAvg / 2,
        confidence: 70,
      },
      {
        timeframe: '1year' as const,
        predictedValue: currentValue * (1 + historicalAvg / 100),
        appreciationRate: historicalAvg,
        confidence: 65,
      },
      {
        timeframe: '3years' as const,
        predictedValue: currentValue * Math.pow(1 + historicalAvg / 100, 3),
        appreciationRate: historicalAvg,
        confidence: 50,
      },
      {
        timeframe: '5years' as const,
        predictedValue: currentValue * Math.pow(1 + historicalAvg / 100, 5),
        appreciationRate: historicalAvg,
        confidence: 40,
      },
    ];

    const factors = this.analyzeMarketFactors(trend);

    return {
      zipCode,
      city: trend.city,
      state: trend.state,
      currentValue,
      predictions,
      historicalAverage: historicalAvg,
      factors,
    };
  }

  /**
   * Generate Comparative Market Analysis (CMA)
   */
  async generateCMA(
    propertyId: string,
    organizationId: string
  ): Promise<ComparativeMarketAnalysis> {
    const property = await this.propertyService.findOne(propertyId, organizationId);
    const zipCode = property.zipCode;

    const trend = await this.getMarketTrend(zipCode);
    const properties = await this.propertyService.findAll(organizationId, false);

    // Find comparable properties (same zip code, similar size)
    const comparables = properties
      .filter(
        (p) =>
          p.zipCode === zipCode &&
          p.id !== propertyId &&
          Math.abs((p.squareFeet || 0) - (property.squareFeet || 0)) < 500
      )
      .slice(0, 10)
      .map((p) => ({
        address: p.address,
        distance: 0, // Would calculate actual distance in real implementation
        price: p.purchasePrice || p.currentValue || 0,
        squareFeet: p.squareFeet,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        soldDate: p.createdAt.toISOString().split('T')[0],
        pricePerSquareFoot: p.squareFeet && p.purchasePrice
          ? p.purchasePrice / p.squareFeet
          : undefined,
      }));

    const prices = comparables.map((c) => c.price).filter((p) => p > 0);
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const medianPrice = prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)] || avgPrice;

    const recommendedPrice = medianPrice;
    const propertyPrice = property.purchasePrice || property.currentValue || 0;
    const priceRecommendation =
      propertyPrice > recommendedPrice * 1.1
        ? 'above'
        : propertyPrice < recommendedPrice * 0.9
        ? 'below'
        : 'at';

    return {
      propertyId: property.id,
      propertyAddress: property.address,
      zipCode,
      comparableProperties: comparables,
      marketSummary: {
        averagePrice: avgPrice,
        medianPrice,
        priceRange: {
          min: Math.min(...prices),
          max: Math.max(...prices),
        },
        averagePricePerSquareFoot:
          comparables
            .filter((c) => c.pricePerSquareFoot)
            .reduce((sum, c) => sum + (c.pricePerSquareFoot || 0), 0) /
          comparables.filter((c) => c.pricePerSquareFoot).length,
        averageDaysOnMarket: trend.dataPoints[trend.dataPoints.length - 1]?.daysOnMarket || 0,
        recommendedListingPrice: recommendedPrice,
        priceRecommendation,
      },
      analysisDate: new Date().toISOString(),
    };
  }

  /**
   * Get market heat map data
   */
  async getMarketHeatMap(
    organizationId: string,
    state?: string,
    city?: string
  ): Promise<MarketHeatMapData[]> {
    // Get all unique zip codes from properties
    const properties = await this.propertyService.findAll(organizationId, false);
    const zipCodes = [...new Set(properties.map((p) => p.zipCode))];

    const heatMapData: MarketHeatMapData[] = [];

    for (const zipCode of zipCodes.slice(0, 50)) {
      // Limit to 50 for performance
      const trend = await this.getMarketTrend(zipCode);
      const rentalTrend = await this.getRentalMarketTrend(zipCode);
      const analysis = await this.getNeighborhoodAnalysis(zipCode);

      const heatValue = analysis.overallScore;
      const color =
        heatValue >= 75
          ? 'green'
          : heatValue >= 50
          ? 'yellow'
          : heatValue >= 25
          ? 'orange'
          : 'red';

      heatMapData.push({
        zipCode,
        city: trend.city,
        state: trend.state,
        heatValue,
        metrics: {
          priceTrend: trend.trend === 'up' ? 50 : trend.trend === 'down' ? -50 : 0,
          rentalYield: analysis.metrics.rentalYield,
          appreciationRate: analysis.metrics.appreciationRate,
          inventoryLevel: this.getInventoryLevelValue(analysis.metrics.inventoryLevel),
          salesVelocity: analysis.metrics.salesVelocity,
        },
        color,
      });
    }

    return heatMapData;
  }

  // Helper methods

  private calculateTrend(dataPoints: MarketDataPoint[]): 'up' | 'down' | 'stable' {
    if (dataPoints.length < 2) return 'stable';

    const first = dataPoints[0].medianPrice || 0;
    const last = dataPoints[dataPoints.length - 1].medianPrice || 0;
    const change = ((last - first) / first) * 100;

    if (change > 2) return 'up';
    if (change < -2) return 'down';
    return 'stable';
  }

  private calculateAverageAppreciation(dataPoints: MarketDataPoint[]): number {
    const rates = dataPoints
      .map((p) => p.appreciationRate || 0)
      .filter((r) => r !== 0);
    return rates.length > 0
      ? rates.reduce((sum, r) => sum + r, 0) / rates.length
      : 0;
  }

  private calculatePriceChange(
    current: MarketDataPoint | undefined,
    previous: MarketDataPoint | undefined
  ): number | undefined {
    if (!current?.medianPrice || !previous?.medianPrice) return undefined;
    return ((current.medianPrice - previous.medianPrice) / previous.medianPrice) * 100;
  }

  private calculateRentChange(
    current: { medianRent: number } | undefined,
    previous: { medianRent: number } | undefined
  ): number | undefined {
    if (!current?.medianRent || !previous?.medianRent) return undefined;
    return ((current.medianRent - previous.medianRent) / previous.medianRent) * 100;
  }

  private calculateRentalTrend(
    dataPoints: { medianRent: number }[]
  ): 'up' | 'down' | 'stable' {
    if (dataPoints.length < 2) return 'stable';
    const first = dataPoints[0].medianRent;
    const last = dataPoints[dataPoints.length - 1].medianRent;
    const change = ((last - first) / first) * 100;
    if (change > 2) return 'up';
    if (change < -2) return 'down';
    return 'stable';
  }

  private calculateVacancyRate(point: MarketDataPoint): number {
    // Mock calculation - in real app, would use actual vacancy data
    return 5 + Math.random() * 5; // 5-10% range
  }

  private calculateSalesVelocity(dataPoints: MarketDataPoint[]): number {
    if (dataPoints.length < 2) return 0;
    const totalSales = dataPoints.reduce((sum, p) => sum + (p.salesCount || 0), 0);
    const months = dataPoints.length;
    return totalSales / months;
  }

  private getInventoryLevel(count: number): 'low' | 'medium' | 'high' {
    if (count < 30) return 'low';
    if (count < 100) return 'medium';
    return 'high';
  }

  private getInventoryLevelValue(level: 'low' | 'medium' | 'high'): number {
    return level === 'low' ? 80 : level === 'medium' ? 50 : 20;
  }

  private calculateNeighborhoodScore(metrics: NeighborhoodAnalysis['metrics']): number {
    let score = 50; // Base score

    // Price trend
    if (metrics.priceTrend === 'up') score += 15;
    else if (metrics.priceTrend === 'down') score -= 15;

    // Rental yield (good yield is 6-10%)
    if (metrics.rentalYield >= 6 && metrics.rentalYield <= 10) score += 20;
    else if (metrics.rentalYield >= 4 && metrics.rentalYield < 6) score += 10;
    else if (metrics.rentalYield < 4) score -= 10;

    // Appreciation rate
    if (metrics.appreciationRate > 5) score += 15;
    else if (metrics.appreciationRate > 3) score += 5;
    else if (metrics.appreciationRate < 0) score -= 15;

    // Inventory level
    if (metrics.inventoryLevel === 'low') score += 10;
    else if (metrics.inventoryLevel === 'high') score -= 10;

    // Sales velocity
    if (metrics.salesVelocity > 15) score += 10;
    else if (metrics.salesVelocity < 5) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  private generateRecommendations(
    metrics: NeighborhoodAnalysis['metrics']
  ): string[] {
    const recommendations: string[] = [];

    if (metrics.priceTrend === 'up' && metrics.rentalYield > 6) {
      recommendations.push('Strong market with good rental yield - consider investing');
    }

    if (metrics.appreciationRate > 5) {
      recommendations.push('High appreciation rate - good for long-term holds');
    }

    if (metrics.inventoryLevel === 'low') {
      recommendations.push('Low inventory - competitive market, act quickly');
    }

    if (metrics.rentalYield < 4) {
      recommendations.push('Low rental yield - consider other markets');
    }

    if (metrics.daysOnMarket > 60) {
      recommendations.push('High days on market - may indicate overpricing');
    }

    return recommendations.length > 0
      ? recommendations
      : ['Market conditions are average - proceed with caution'];
  }

  private identifyRiskFactors(
    metrics: NeighborhoodAnalysis['metrics']
  ): string[] {
    const risks: string[] = [];

    if (metrics.priceTrend === 'down') {
      risks.push('Declining prices may indicate market downturn');
    }

    if (metrics.appreciationRate < 0) {
      risks.push('Negative appreciation - property values decreasing');
    }

    if (metrics.inventoryLevel === 'high') {
      risks.push('High inventory may indicate oversupply');
    }

    if (metrics.rentalYield < 3) {
      risks.push('Very low rental yield - cash flow concerns');
    }

    return risks;
  }

  private analyzeMarketFactors(trend: MarketTrend): AppreciationPrediction['factors'] {
    const factors: AppreciationPrediction['factors'] = [];

    if (trend.priceChange1Year && trend.priceChange1Year > 10) {
      factors.push({
        factor: 'Strong Price Growth',
        impact: 'positive',
        description: `Prices increased ${trend.priceChange1Year.toFixed(1)}% in the past year`,
      });
    }

    if (trend.averageAppreciationRate > 5) {
      factors.push({
        factor: 'High Historical Appreciation',
        impact: 'positive',
        description: `Average appreciation rate of ${trend.averageAppreciationRate.toFixed(1)}%`,
      });
    }

    if (trend.priceChange1Year && trend.priceChange1Year < -5) {
      factors.push({
        factor: 'Price Decline',
        impact: 'negative',
        description: `Prices decreased ${Math.abs(trend.priceChange1Year).toFixed(1)}% in the past year`,
      });
    }

    return factors.length > 0
      ? factors
      : [
          {
            factor: 'Stable Market',
            impact: 'neutral' as const,
            description: 'Market conditions are relatively stable',
          },
        ];
  }

  /**
   * Check and create market alerts
   */
  async checkAndCreateAlerts(
    organizationId: string,
    userId: string,
    zipCode: string
  ): Promise<MarketAlert[]> {
    const trend = await this.getMarketTrend(zipCode);
    const alerts: MarketAlert[] = [];

    // Check price changes
    if (trend.priceChange30Days && Math.abs(trend.priceChange30Days) > 5) {
      const existingAlert = await this.alertRepository.findOne({
        where: {
          organizationId,
          userId,
          zipCode,
          type: MarketAlertType.PRICE_CHANGE,
          isRead: false,
        },
        order: { triggeredAt: 'DESC' },
      });

      if (!existingAlert || this.isNewAlert(existingAlert.triggeredAt)) {
        const alert = this.alertRepository.create({
          organizationId,
          userId,
          type: MarketAlertType.PRICE_CHANGE,
          zipCode,
          threshold: 5,
          currentValue: trend.currentMedianPrice || 0,
          previousValue: (trend.currentMedianPrice || 0) / (1 + trend.priceChange30Days! / 100),
          change: trend.priceChange30Days!,
          message: `Price ${trend.priceChange30Days > 0 ? 'increased' : 'decreased'} ${Math.abs(trend.priceChange30Days).toFixed(1)}% in ${zipCode}`,
          isRead: false,
        });

        const saved = await this.alertRepository.save(alert);
        alerts.push(this.mapAlertEntity(saved));
      }
    }

    return alerts;
  }

  /**
   * Get market alerts for user
   */
  async getMarketAlerts(
    organizationId: string,
    userId: string,
    isRead?: boolean
  ): Promise<MarketAlert[]> {
    const where: any = { organizationId, userId };
    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    const alerts = await this.alertRepository.find({
      where,
      order: { triggeredAt: 'DESC' },
      take: 50,
    });

    return alerts.map((a) => this.mapAlertEntity(a));
  }

  private mapAlertEntity(entity: MarketAlertEntity): MarketAlert {
    return {
      id: entity.id,
      organizationId: entity.organizationId,
      userId: entity.userId,
      type: entity.type as MarketAlert['type'],
      zipCode: entity.zipCode,
      threshold: Number(entity.threshold),
      currentValue: Number(entity.currentValue),
      previousValue: Number(entity.previousValue),
      change: Number(entity.change),
      triggeredAt: entity.triggeredAt,
      isRead: entity.isRead,
      message: entity.message,
    };
  }

  private isNewAlert(lastTriggered: Date): boolean {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return lastTriggered < oneDayAgo;
  }
}

