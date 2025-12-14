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
  LoginDto,
  RegisterDto,
  AuthResponse,
  DealScore,
  ScoringWeights,
  MarketTrend,
  NeighborhoodAnalysis,
  RentalMarketTrend,
  AppreciationPrediction,
  ComparativeMarketAnalysis,
  MarketHeatMapData,
  MarketAlert,
  MarketAnalysisOptions,
  PropertyAnalysis,
  DealRecommendation,
  RiskAssessment,
  InvestmentStrategy,
  MarketCommentary,
  PropertyDescription,
  PortfolioInsight,
} from '@real-estate-analyzer/types';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

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

export const authApi = {
  login: async (credentials: LoginDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', response.data.accessToken);
      localStorage.setItem('auth_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', response.data.accessToken);
      localStorage.setItem('auth_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  },

  getCurrentUser: (): AuthResponse['user'] | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('auth_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  },

  isAuthenticated: (): boolean => {
    return !!authApi.getToken();
  },
};

export const scoringApi = {
  calculateDealScore: async (dealId: string): Promise<DealScore> => {
    const response = await apiClient.post<DealScore>(`/scoring/deals/${dealId}/calculate`);
    return response.data;
  },

  getDealScore: async (dealId: string): Promise<DealScore | null> => {
    const response = await apiClient.get<DealScore | null>(`/scoring/deals/${dealId}`);
    return response.data;
  },

  getDealScoreHistory: async (dealId: string): Promise<DealScore[]> => {
    const response = await apiClient.get<DealScore[]>(`/scoring/deals/${dealId}/history`);
    return response.data;
  },

  compareDealScores: async (dealIds: string[]): Promise<Record<string, DealScore>> => {
    const params = new URLSearchParams();
    params.append('dealIds', dealIds.join(','));
    const response = await apiClient.get<Record<string, DealScore>>(`/scoring/deals/compare?${params.toString()}`);
    return response.data;
  },

  getScoringConfiguration: async (): Promise<ScoringWeights> => {
    const response = await apiClient.get<ScoringWeights>('/scoring/configuration');
    return response.data;
  },

  updateScoringConfiguration: async (weights: ScoringWeights): Promise<void> => {
    await apiClient.post('/scoring/configuration', weights);
  },
};

export const marketApi = {
  getMarketTrend: async (zipCode: string, options?: MarketAnalysisOptions): Promise<MarketTrend> => {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.propertyType) params.append('propertyType', options.propertyType);
    if (options?.includePredictions) params.append('includePredictions', 'true');
    
    const response = await apiClient.get<MarketTrend>(`/market/trends/${zipCode}?${params.toString()}`);
    return response.data;
  },

  getNeighborhoodAnalysis: async (zipCode: string): Promise<NeighborhoodAnalysis> => {
    const response = await apiClient.get<NeighborhoodAnalysis>(`/market/neighborhood/${zipCode}`);
    return response.data;
  },

  getRentalMarketTrend: async (zipCode: string): Promise<RentalMarketTrend> => {
    const response = await apiClient.get<RentalMarketTrend>(`/market/rental/${zipCode}`);
    return response.data;
  },

  getAppreciationPrediction: async (zipCode: string, currentValue: number): Promise<AppreciationPrediction> => {
    const params = new URLSearchParams();
    params.append('currentValue', currentValue.toString());
    const response = await apiClient.get<AppreciationPrediction>(`/market/appreciation/${zipCode}?${params.toString()}`);
    return response.data;
  },

  generateCMA: async (propertyId: string): Promise<ComparativeMarketAnalysis> => {
    const response = await apiClient.get<ComparativeMarketAnalysis>(`/market/cma/${propertyId}`);
    return response.data;
  },

  getMarketHeatMap: async (state?: string, city?: string): Promise<MarketHeatMapData[]> => {
    const params = new URLSearchParams();
    if (state) params.append('state', state);
    if (city) params.append('city', city);
    const response = await apiClient.get<MarketHeatMapData[]>(`/market/heatmap?${params.toString()}`);
    return response.data;
  },

  getMarketAlerts: async (isRead?: boolean): Promise<MarketAlert[]> => {
    const params = new URLSearchParams();
    if (isRead !== undefined) params.append('isRead', isRead.toString());
    const response = await apiClient.get<MarketAlert[]>(`/market/alerts?${params.toString()}`);
    return response.data;
  },

  checkAndCreateAlerts: async (zipCode: string): Promise<MarketAlert[]> => {
    const response = await apiClient.post<MarketAlert[]>(`/market/alerts/check/${zipCode}`);
    return response.data;
  },
};

export const llmApi = {
  analyzeProperty: async (propertyId: string): Promise<PropertyAnalysis> => {
    const response = await apiClient.get<PropertyAnalysis>(`/llm/property/${propertyId}/analysis`);
    return response.data;
  },

  getDealRecommendation: async (dealId: string): Promise<DealRecommendation> => {
    const response = await apiClient.get<DealRecommendation>(`/llm/deal/${dealId}/recommendation`);
    return response.data;
  },

  assessRisk: async (propertyId?: string, dealId?: string): Promise<RiskAssessment> => {
    const params = new URLSearchParams();
    if (propertyId) params.append('propertyId', propertyId);
    if (dealId) params.append('dealId', dealId);
    const response = await apiClient.get<RiskAssessment>(`/llm/risk?${params.toString()}`);
    return response.data;
  },

  getInvestmentStrategy: async (): Promise<InvestmentStrategy> => {
    const response = await apiClient.get<InvestmentStrategy>('/llm/strategy');
    return response.data;
  },

  generateMarketCommentary: async (zipCode: string): Promise<MarketCommentary> => {
    const response = await apiClient.get<MarketCommentary>(`/llm/market/${zipCode}/commentary`);
    return response.data;
  },

  generatePropertyDescription: async (propertyId: string): Promise<PropertyDescription> => {
    const response = await apiClient.get<PropertyDescription>(`/llm/property/${propertyId}/description`);
    return response.data;
  },

  getPortfolioInsights: async (): Promise<PortfolioInsight[]> => {
    const response = await apiClient.get<PortfolioInsight[]>('/llm/portfolio/insights');
    return response.data;
  },

  checkHealth: async (): Promise<{ available: boolean; provider: string; models: string[] }> => {
    const response = await apiClient.get('/llm/health');
    return response.data;
  },
};

export default apiClient;

