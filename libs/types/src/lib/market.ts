/**
 * Market Trend Analysis Types
 */

export interface MarketDataPoint {
  date: string; // ISO date string
  zipCode: string;
  city: string;
  state: string;
  medianPrice?: number;
  averagePrice?: number;
  pricePerSquareFoot?: number;
  medianRent?: number;
  averageRent?: number;
  daysOnMarket?: number;
  inventoryCount?: number;
  salesCount?: number;
  appreciationRate?: number; // Annual percentage
}

export interface MarketTrend {
  zipCode: string;
  city: string;
  state: string;
  dataPoints: MarketDataPoint[];
  trend: 'up' | 'down' | 'stable';
  averageAppreciationRate: number;
  currentMedianPrice?: number;
  currentMedianRent?: number;
  priceChange30Days?: number; // Percentage change
  priceChange90Days?: number;
  priceChange1Year?: number;
}

export interface NeighborhoodAnalysis {
  zipCode: string;
  city: string;
  state: string;
  overallScore: number; // 0-100
  metrics: {
    priceTrend: 'up' | 'down' | 'stable';
    rentalYield: number; // Percentage
    appreciationRate: number; // Annual percentage
    inventoryLevel: 'low' | 'medium' | 'high';
    daysOnMarket: number;
    salesVelocity: number; // Sales per month
  };
  recommendations: string[];
  riskFactors: string[];
}

export interface RentalMarketTrend {
  zipCode: string;
  city: string;
  state: string;
  dataPoints: {
    date: string;
    medianRent: number;
    averageRent: number;
    rentPerSquareFoot: number;
    vacancyRate: number;
    rentalYield: number;
  }[];
  trend: 'up' | 'down' | 'stable';
  averageRentalYield: number;
  currentMedianRent?: number;
  rentChange30Days?: number;
  rentChange1Year?: number;
}

export interface AppreciationPrediction {
  zipCode: string;
  city: string;
  state: string;
  currentValue: number;
  predictions: {
    timeframe: '6months' | '1year' | '3years' | '5years';
    predictedValue: number;
    appreciationRate: number; // Annual percentage
    confidence: number; // 0-100
  }[];
  historicalAverage: number; // Historical average appreciation rate
  factors: {
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }[];
}

export interface ComparativeMarketAnalysis {
  propertyId: string;
  propertyAddress: string;
  zipCode: string;
  comparableProperties: {
    address: string;
    distance: number; // miles
    price: number;
    squareFeet?: number;
    bedrooms?: number;
    bathrooms?: number;
    soldDate: string;
    pricePerSquareFoot?: number;
  }[];
  marketSummary: {
    averagePrice: number;
    medianPrice: number;
    priceRange: { min: number; max: number };
    averagePricePerSquareFoot: number;
    averageDaysOnMarket: number;
    recommendedListingPrice?: number;
    priceRecommendation: 'above' | 'at' | 'below';
  };
  analysisDate: string;
}

export interface MarketHeatMapData {
  zipCode: string;
  city: string;
  state: string;
  coordinates?: { lat: number; lng: number };
  heatValue: number; // 0-100, based on multiple factors
  metrics: {
    priceTrend: number; // -100 to 100
    rentalYield: number;
    appreciationRate: number;
    inventoryLevel: number; // 0-100
    salesVelocity: number;
  };
  color: 'red' | 'orange' | 'yellow' | 'green'; // Heat map color
}

export interface MarketAlert {
  id: string;
  organizationId: string;
  userId: string;
  type: 'price_change' | 'rent_change' | 'inventory_change' | 'appreciation_change';
  zipCode: string;
  threshold: number; // Percentage or absolute value
  currentValue: number;
  previousValue: number;
  change: number; // Percentage or absolute
  triggeredAt: Date;
  isRead: boolean;
  message: string;
}

export interface MarketAlertConfiguration {
  id: string;
  organizationId: string;
  userId: string;
  zipCodes: string[];
  alertTypes: MarketAlert['type'][];
  thresholds: {
    priceChange?: number; // Percentage
    rentChange?: number; // Percentage
    inventoryChange?: number; // Absolute count
    appreciationChange?: number; // Percentage
  };
  notificationChannels: ('email' | 'in_app')[];
  isActive: boolean;
}

export interface MarketAnalysisOptions {
  zipCode?: string;
  city?: string;
  state?: string;
  startDate?: string;
  endDate?: string;
  propertyType?: string;
  includePredictions?: boolean;
}

