import axios from 'axios';
import {
  Property,
  CreatePropertyDto,
  UpdatePropertyDto,
  AnalyticsDashboard,
  PortfolioSummary,
  TimeSeriesMetrics,
  MarketComparison,
  PropertyPerformance,
  DealPerformanceRanking,
  AggregationOptions,
} from '@real-estate-analyzer/types';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const propertyApi = {
  getAll: async (): Promise<Property[]> => {
    const response = await apiClient.get<Property[]>('/properties');
    return response.data;
  },

  getById: async (id: string): Promise<Property> => {
    const response = await apiClient.get<Property>(`/properties/${id}`);
    return response.data;
  },

  create: async (data: CreatePropertyDto): Promise<Property> => {
    const response = await apiClient.post<Property>('/properties', data);
    return response.data;
  },

  update: async (id: string, data: UpdatePropertyDto): Promise<Property> => {
    const response = await apiClient.patch<Property>(`/properties/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/properties/${id}`);
  },
};

export const analyticsApi = {
  getDashboard: async (options?: AggregationOptions): Promise<AnalyticsDashboard> => {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.propertyIds) params.append('propertyIds', options.propertyIds.join(','));
    if (options?.dealIds) params.append('dealIds', options.dealIds.join(','));
    if (options?.status) params.append('status', options.status.join(','));
    
    const response = await apiClient.get<AnalyticsDashboard>(`/analytics/dashboard?${params.toString()}`);
    return response.data;
  },

  getPortfolioSummary: async (options?: AggregationOptions): Promise<PortfolioSummary> => {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.propertyIds) params.append('propertyIds', options.propertyIds.join(','));
    if (options?.dealIds) params.append('dealIds', options.dealIds.join(','));
    if (options?.status) params.append('status', options.status.join(','));
    
    const response = await apiClient.get<PortfolioSummary>(`/analytics/portfolio/summary?${params.toString()}`);
    return response.data;
  },

  getCashFlowTrend: async (options?: AggregationOptions): Promise<TimeSeriesMetrics> => {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.propertyIds) params.append('propertyIds', options.propertyIds.join(','));
    
    const response = await apiClient.get<TimeSeriesMetrics>(`/analytics/metrics/cash-flow-trend?${params.toString()}`);
    return response.data;
  },

  getPortfolioGrowth: async (options?: AggregationOptions): Promise<TimeSeriesMetrics> => {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.propertyIds) params.append('propertyIds', options.propertyIds.join(','));
    
    const response = await apiClient.get<TimeSeriesMetrics>(`/analytics/metrics/portfolio-growth?${params.toString()}`);
    return response.data;
  },

  getMarketComparisons: async (options?: AggregationOptions): Promise<MarketComparison[]> => {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.propertyIds) params.append('propertyIds', options.propertyIds.join(','));
    if (options?.dealIds) params.append('dealIds', options.dealIds.join(','));
    
    const response = await apiClient.get<MarketComparison[]>(`/analytics/market/comparisons?${params.toString()}`);
    return response.data;
  },

  getPropertyPerformance: async (options?: AggregationOptions): Promise<PropertyPerformance[]> => {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.propertyIds) params.append('propertyIds', options.propertyIds.join(','));
    
    const response = await apiClient.get<PropertyPerformance[]>(`/analytics/properties/performance?${params.toString()}`);
    return response.data;
  },

  getDealRankings: async (limit: number = 10, options?: AggregationOptions): Promise<DealPerformanceRanking[]> => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.propertyIds) params.append('propertyIds', options.propertyIds.join(','));
    if (options?.status) params.append('status', options.status.join(','));
    
    const response = await apiClient.get<DealPerformanceRanking[]>(`/analytics/deals/rankings?${params.toString()}`);
    return response.data;
  },
};

export default apiClient;

