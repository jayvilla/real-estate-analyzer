/**
 * Analytics and reporting types
 */

/**
 * Portfolio summary metrics
 */
export interface PortfolioSummary {
  totalProperties: number;
  totalDeals: number;
  activeDeals: number;
  totalPortfolioValue: number;
  totalCashInvested: number;
  totalAnnualCashFlow: number;
  averageCapRate?: number;
  averageCashOnCashReturn?: number;
  totalMonthlyCashFlow: number;
  totalAnnualNOI: number;
}

/**
 * Time-series data point
 */
export interface TimeSeriesDataPoint {
  date: string; // ISO date string
  value: number;
  label?: string;
}

/**
 * Time-series metrics
 */
export interface TimeSeriesMetrics {
  metric: string;
  unit: string;
  dataPoints: TimeSeriesDataPoint[];
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
}

/**
 * Market comparison metrics
 */
export interface MarketComparison {
  propertyId?: string;
  dealId?: string;
  metric: string;
  value: number;
  marketAverage?: number;
  marketMedian?: number;
  percentile?: number; // 0-100, where 50 is median
  comparison: 'above' | 'below' | 'at';
  difference?: number; // Absolute difference from market average
  differencePercent?: number; // Percentage difference
}

/**
 * Property performance metrics
 */
export interface PropertyPerformance {
  propertyId: string;
  address: string;
  totalDeals: number;
  totalCashInvested: number;
  totalAnnualCashFlow: number;
  averageCapRate?: number;
  averageCashOnCashReturn?: number;
  bestDeal?: {
    dealId: string;
    cashOnCashReturn: number;
  };
  worstDeal?: {
    dealId: string;
    cashOnCashReturn: number;
  };
}

/**
 * Deal performance ranking
 */
export interface DealPerformanceRanking {
  dealId: string;
  propertyId: string;
  propertyAddress: string;
  purchasePrice: number;
  cashOnCashReturn: number;
  capRate: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  rank: number;
}

/**
 * Analytics dashboard data
 */
export interface AnalyticsDashboard {
  portfolioSummary: PortfolioSummary;
  topPerformers: DealPerformanceRanking[];
  bottomPerformers: DealPerformanceRanking[];
  cashFlowTrend: TimeSeriesMetrics;
  portfolioGrowth: TimeSeriesMetrics;
  marketComparisons: MarketComparison[];
  propertyPerformance: PropertyPerformance[];
  recentActivity: {
    type: 'property_created' | 'deal_created' | 'deal_updated';
    id: string;
    timestamp: string;
    description: string;
  }[];
}

/**
 * Aggregation query options
 */
export interface AggregationOptions {
  startDate?: string;
  endDate?: string;
  propertyIds?: string[];
  dealIds?: string[];
  status?: string[];
  groupBy?: 'property' | 'deal' | 'month' | 'year';
}

