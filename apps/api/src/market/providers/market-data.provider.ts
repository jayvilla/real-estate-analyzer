import { Injectable } from '@nestjs/common';
import { MarketDataPoint } from '@real-estate-analyzer/types';

/**
 * Market Data Provider Interface
 * This can be implemented with real APIs (Zillow, Redfin, etc.) or mock data
 */
export interface IMarketDataProvider {
  getMarketData(
    zipCode: string,
    startDate: Date,
    endDate: Date
  ): Promise<MarketDataPoint[]>;

  getCurrentMarketData(zipCode: string): Promise<MarketDataPoint | null>;
}

/**
 * Mock Market Data Provider
 * Generates realistic mock market data for development/testing
 * In production, replace with real API integration
 */
@Injectable()
export class MockMarketDataProvider implements IMarketDataProvider {
  async getMarketData(
    zipCode: string,
    startDate: Date,
    endDate: Date
  ): Promise<MarketDataPoint[]> {
    // Generate mock data points for the date range
    const dataPoints: MarketDataPoint[] = [];
    const currentDate = new Date(startDate);
    const basePrice = this.getBasePriceForZipCode(zipCode);
    const baseRent = basePrice * 0.008; // ~1% of home value per month

    while (currentDate <= endDate) {
      // Simulate gradual price appreciation with some volatility
      const monthsSinceStart =
        (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      const appreciation = monthsSinceStart * 0.003; // ~0.3% per month
      const volatility = (Math.random() - 0.5) * 0.02; // ±1% random variation

      const price = basePrice * (1 + appreciation + volatility);
      const rent = baseRent * (1 + appreciation * 0.5 + volatility * 0.3);

      dataPoints.push({
        date: currentDate.toISOString().split('T')[0],
        zipCode,
        city: this.getCityForZipCode(zipCode),
        state: this.getStateForZipCode(zipCode),
        medianPrice: Math.round(price),
        averagePrice: Math.round(price * 1.05),
        pricePerSquareFoot: Math.round(price / 2000), // Assuming ~2000 sqft average
        medianRent: Math.round(rent),
        averageRent: Math.round(rent * 1.05),
        daysOnMarket: Math.floor(30 + Math.random() * 30),
        inventoryCount: Math.floor(50 + Math.random() * 100),
        salesCount: Math.floor(10 + Math.random() * 20),
        appreciationRate: (appreciation + volatility) * 12 * 100, // Annualized
      });

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return dataPoints;
  }

  async getCurrentMarketData(zipCode: string): Promise<MarketDataPoint | null> {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const dataPoints = await this.getMarketData(zipCode, sixMonthsAgo, today);
    return dataPoints[dataPoints.length - 1] || null;
  }

  private getBasePriceForZipCode(zipCode: string): number {
    // Mock base prices by zip code (simplified)
    const hash = zipCode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 200000 + (hash % 500000); // $200k - $700k range
  }

  private getCityForZipCode(zipCode: string): string {
    // Mock city names
    const cities = ['Springfield', 'Franklin', 'Georgetown', 'Madison', 'Washington'];
    const hash = zipCode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return cities[hash % cities.length];
  }

  private getStateForZipCode(zipCode: string): string {
    // Mock state (simplified - in real app, use zip code lookup)
    return 'CA';
  }
}

