import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LLMService } from './llm.service';
import { LLMCacheService } from './cache/llm-cache.service';
import { PropertyService } from '../property/property.service';
import { DealService } from '../deal/deal.service';
import { ValuationService } from '../valuation/valuation.service';
import { MarketService } from '../market/market.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { StructuredLoggerService } from '../common/logging/structured-logger.service';
import { OllamaProvider } from './providers/ollama.provider';
import { MockLLMProvider } from './providers/mock-llm.provider';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('LLMService Integration', () => {
  let service: LLMService;
  let module: TestingModule;
  let llmProvider: any;

  const mockPropertyService = {
    findOne: jest.fn(),
    findAll: jest.fn(),
  };

  const mockDealService = {
    findOne: jest.fn(),
    findAll: jest.fn(),
  };

  const mockValuationService = {
    calculateDealValuation: jest.fn(),
  };

  const mockMarketService = {
    getMarketTrends: jest.fn(),
  };

  const mockAnalyticsService = {
    getPortfolioMetrics: jest.fn(),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    invalidate: jest.fn(),
  };

  const mockLogger = {
    logWithMetadata: jest.fn(),
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        LLMService,
        {
          provide: LLMCacheService,
          useValue: mockCacheService,
        },
        {
          provide: PropertyService,
          useValue: mockPropertyService,
        },
        {
          provide: DealService,
          useValue: mockDealService,
        },
        {
          provide: ValuationService,
          useValue: mockValuationService,
        },
        {
          provide: MarketService,
          useValue: mockMarketService,
        },
        {
          provide: AnalyticsService,
          useValue: mockAnalyticsService,
        },
        {
          provide: StructuredLoggerService,
          useValue: mockLogger,
        },
        MockLLMProvider,
        {
          provide: 'ILLMProvider',
          useFactory: (mock: MockLLMProvider) => mock,
          inject: [MockLLMProvider],
        },
      ],
    }).compile();

    service = module.get<LLMService>(LLMService);
    llmProvider = module.get('ILLMProvider');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Property Analysis', () => {
    it('should analyze property with mock LLM', async () => {
      const propertyId = 'prop-123';
      const organizationId = 'org-123';

      mockPropertyService.findOne.mockResolvedValue({
        id: propertyId,
        address: '123 Main St',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        propertyType: 'residential',
        bedrooms: 3,
        bathrooms: 2,
        squareFeet: 1500,
      });

      mockCacheService.get.mockResolvedValue(null);
      mockCacheService.set.mockResolvedValue(undefined);

      llmProvider.generate = jest.fn().mockResolvedValue({
        content: JSON.stringify({
          strengths: ['Good location', 'Recent renovations'],
          weaknesses: ['Small lot size'],
          investmentPotential: 'medium',
          recommendations: ['Consider adding ADU'],
        }),
        usage: { totalTokens: 100 },
      });

      const result = await service.analyzeProperty(propertyId, organizationId);

      expect(result).toBeDefined();
      expect(result.strengths).toBeDefined();
      expect(mockPropertyService.findOne).toHaveBeenCalledWith(propertyId, organizationId);
      expect(llmProvider.generate).toHaveBeenCalled();
    });

    it('should use cache when available', async () => {
      const propertyId = 'prop-123';
      const organizationId = 'org-123';

      const cachedResult = {
        strengths: ['Cached result'],
        weaknesses: [],
        investmentPotential: 'high',
      };

      mockCacheService.get.mockResolvedValue(cachedResult);

      const result = await service.analyzeProperty(propertyId, organizationId);

      expect(result).toEqual(cachedResult);
      expect(llmProvider.generate).not.toHaveBeenCalled();
    });
  });

  describe('Deal Recommendation', () => {
    it('should generate deal recommendation', async () => {
      const dealId = 'deal-123';
      const organizationId = 'org-123';

      mockDealService.findOne.mockResolvedValue({
        id: dealId,
        purchasePrice: 500000,
        financing: {
          loanAmount: 400000,
          interestRate: 4.5,
        },
      });

      mockValuationService.calculateDealValuation.mockReturnValue({
        capRate: { rate: 7.5 },
        returnMetrics: {
          cashOnCashReturn: 10.0,
          dscr: 1.3,
        },
      });

      llmProvider.generate = jest.fn().mockResolvedValue({
        content: JSON.stringify({
          recommendation: 'buy',
          confidence: 0.8,
          keyFactors: ['Strong cap rate', 'Good location'],
        }),
        usage: { totalTokens: 150 },
      });

      const result = await service.getDealRecommendation(dealId, organizationId);

      expect(result).toBeDefined();
      expect(result.recommendation).toBeDefined();
      expect(mockDealService.findOne).toHaveBeenCalled();
    });
  });

  describe('Risk Assessment', () => {
    it('should assess risk for property', async () => {
      const propertyId = 'prop-123';
      const organizationId = 'org-123';

      mockPropertyService.findOne.mockResolvedValue({
        id: propertyId,
        address: '123 Main St',
      });

      llmProvider.generate = jest.fn().mockResolvedValue({
        content: JSON.stringify({
          overallRisk: 'medium',
          riskFactors: ['Market volatility', 'High vacancy rates'],
          mitigationStrategies: ['Diversify portfolio'],
        }),
        usage: { totalTokens: 120 },
      });

      const result = await service.assessRisk(propertyId, undefined, organizationId);

      expect(result).toBeDefined();
      expect(result.overallRisk).toBeDefined();
    });
  });

  describe('Portfolio Insights', () => {
    it('should generate portfolio insights', async () => {
      const organizationId = 'org-123';

      mockAnalyticsService.getPortfolioMetrics.mockResolvedValue({
        totalProperties: 10,
        totalValue: 5000000,
        averageCapRate: 7.5,
      });

      mockPropertyService.findAll.mockResolvedValue([
        { id: 'prop-1', city: 'Los Angeles' },
        { id: 'prop-2', city: 'San Francisco' },
      ]);

      llmProvider.generate = jest.fn().mockResolvedValue({
        content: JSON.stringify({
          insights: ['Well-diversified portfolio', 'Strong cash flow'],
          recommendations: ['Consider expanding to new markets'],
        }),
        usage: { totalTokens: 200 },
      });

      const result = await service.getPortfolioInsights(organizationId);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle LLM provider errors gracefully', async () => {
      const propertyId = 'prop-123';
      const organizationId = 'org-123';

      mockPropertyService.findOne.mockResolvedValue({
        id: propertyId,
        address: '123 Main St',
      });

      mockCacheService.get.mockResolvedValue(null);

      llmProvider.generate = jest.fn().mockRejectedValue(new Error('LLM service unavailable'));

      await expect(
        service.analyzeProperty(propertyId, organizationId)
      ).rejects.toThrow();
    });

    it('should handle missing property gracefully', async () => {
      const propertyId = 'nonexistent';
      const organizationId = 'org-123';

      mockPropertyService.findOne.mockResolvedValue(null);

      await expect(
        service.analyzeProperty(propertyId, organizationId)
      ).rejects.toThrow();
    });
  });
});

