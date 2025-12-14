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

export default apiClient;

