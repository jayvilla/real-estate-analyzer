import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScoringService } from './scoring.service';
import { DealScoreEntity } from './entities/deal-score.entity';
import { ScoringConfigurationEntity } from './entities/scoring-configuration.entity';
import { ValuationService } from '../valuation/valuation.service';
import { StructuredLoggerService } from '../common/logging/structured-logger.service';
import { DealEntity } from '../deal/entities/deal.entity';
import {
  DEFAULT_SCORING_WEIGHTS,
  SCORING_THRESHOLDS,
  ScoringWeights,
} from '@real-estate-analyzer/types';

describe('ScoringService', () => {
  let service: ScoringService;
  let dealScoreRepository: Repository<DealScoreEntity>;
  let configRepository: Repository<ScoringConfigurationEntity>;
  let valuationService: ValuationService;
  let logger: StructuredLoggerService;

  const mockDealScoreRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockConfigRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockValuationService = {
    calculateDealValuation: jest.fn(),
  };

  const mockLogger = {
    logWithMetadata: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScoringService,
        {
          provide: getRepositoryToken(DealScoreEntity),
          useValue: mockDealScoreRepository,
        },
        {
          provide: getRepositoryToken(ScoringConfigurationEntity),
          useValue: mockConfigRepository,
        },
        {
          provide: ValuationService,
          useValue: mockValuationService,
        },
        {
          provide: StructuredLoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<ScoringService>(ScoringService);
    dealScoreRepository = module.get<Repository<DealScoreEntity>>(
      getRepositoryToken(DealScoreEntity)
    );
    configRepository = module.get<Repository<ScoringConfigurationEntity>>(
      getRepositoryToken(ScoringConfigurationEntity)
    );
    valuationService = module.get<ValuationService>(ValuationService);
    logger = module.get<StructuredLoggerService>(StructuredLoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('scoreCapRate', () => {
    it('should return 100 for excellent cap rate (>= 8%)', () => {
      const deal = createMockDeal();
      mockValuationService.calculateDealValuation.mockReturnValue({
        capRate: { rate: 8.5 },
        returnMetrics: { cashOnCashReturn: 0, dscr: 0 },
      });

      // Test through calculateDealScore
      const result = service['scoreCapRate'](8.5);
      expect(result).toBe(100);
    });

    it('should return 75-100 for good cap rate (6-8%)', () => {
      const result1 = service['scoreCapRate'](6.0);
      const result2 = service['scoreCapRate'](7.0);
      const result3 = service['scoreCapRate'](8.0);

      expect(result1).toBeGreaterThanOrEqual(75);
      expect(result1).toBeLessThan(100);
      expect(result2).toBeGreaterThan(75);
      expect(result3).toBe(100);
    });

    it('should return 50-75 for average cap rate (4-6%)', () => {
      const result1 = service['scoreCapRate'](4.0);
      const result2 = service['scoreCapRate'](5.0);
      const result3 = service['scoreCapRate'](6.0);

      expect(result1).toBeGreaterThanOrEqual(50);
      expect(result1).toBeLessThan(75);
      expect(result2).toBeGreaterThan(50);
      expect(result3).toBeGreaterThanOrEqual(75);
    });

    it('should return 0-50 for poor cap rate (< 4%)', () => {
      const result1 = service['scoreCapRate'](0);
      const result2 = service['scoreCapRate'](2.0);
      const result3 = service['scoreCapRate'](4.0);

      expect(result1).toBe(0);
      expect(result2).toBeGreaterThan(0);
      expect(result2).toBeLessThan(50);
      expect(result3).toBeGreaterThanOrEqual(50);
    });

    it('should handle edge cases', () => {
      expect(service['scoreCapRate'](-1)).toBe(0);
      expect(service['scoreCapRate'](100)).toBe(100);
    });
  });

  describe('scoreCashOnCash', () => {
    it('should return 100 for excellent cash-on-cash (>= 12%)', () => {
      const result = service['scoreCashOnCash'](12.5);
      expect(result).toBe(100);
    });

    it('should return 75-100 for good cash-on-cash (8-12%)', () => {
      const result1 = service['scoreCashOnCash'](8.0);
      const result2 = service['scoreCashOnCash'](10.0);
      const result3 = service['scoreCashOnCash'](12.0);

      expect(result1).toBeGreaterThanOrEqual(75);
      expect(result1).toBeLessThan(100);
      expect(result2).toBeGreaterThan(75);
      expect(result3).toBe(100);
    });

    it('should return 50-75 for average cash-on-cash (5-8%)', () => {
      const result1 = service['scoreCashOnCash'](5.0);
      const result2 = service['scoreCashOnCash'](6.5);
      const result3 = service['scoreCashOnCash'](8.0);

      expect(result1).toBeGreaterThanOrEqual(50);
      expect(result1).toBeLessThan(75);
      expect(result2).toBeGreaterThan(50);
      expect(result3).toBeGreaterThanOrEqual(75);
    });

    it('should return 0-50 for poor cash-on-cash (< 5%)', () => {
      const result1 = service['scoreCashOnCash'](0);
      const result2 = service['scoreCashOnCash'](2.5);
      const result3 = service['scoreCashOnCash'](5.0);

      expect(result1).toBe(0);
      expect(result2).toBeGreaterThan(0);
      expect(result2).toBeLessThan(50);
      expect(result3).toBeGreaterThanOrEqual(50);
    });
  });

  describe('scoreDSCR', () => {
    it('should return 100 for excellent DSCR (>= 1.5)', () => {
      const result = service['scoreDSCR'](1.6);
      expect(result).toBe(100);
    });

    it('should return 75-100 for good DSCR (1.25-1.5)', () => {
      const result1 = service['scoreDSCR'](1.25);
      const result2 = service['scoreDSCR'](1.375);
      const result3 = service['scoreDSCR'](1.5);

      expect(result1).toBeGreaterThanOrEqual(75);
      expect(result1).toBeLessThan(100);
      expect(result2).toBeGreaterThan(75);
      expect(result3).toBe(100);
    });

    it('should return 50-75 for average DSCR (1.1-1.25)', () => {
      const result1 = service['scoreDSCR'](1.1);
      const result2 = service['scoreDSCR'](1.175);
      const result3 = service['scoreDSCR'](1.25);

      expect(result1).toBeGreaterThanOrEqual(50);
      expect(result1).toBeLessThan(75);
      expect(result2).toBeGreaterThan(50);
      expect(result3).toBeGreaterThanOrEqual(75);
    });

    it('should return 0-50 for poor DSCR (< 1.1)', () => {
      const result1 = service['scoreDSCR'](0.5);
      const result2 = service['scoreDSCR'](1.0);
      const result3 = service['scoreDSCR'](1.1);

      expect(result1).toBeGreaterThanOrEqual(0);
      expect(result1).toBeLessThan(50);
      expect(result2).toBeLessThan(50);
      expect(result3).toBeGreaterThanOrEqual(50);
    });

    it('should handle DSCR below 1.0 as risky', () => {
      const result = service['scoreDSCR'](0.9);
      expect(result).toBeLessThan(50);
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateWeightedScore', () => {
    it('should calculate weighted score correctly', () => {
      const criteria = {
        capRate: 80,
        cashOnCash: 70,
        dscr: 60,
        location: 50,
        marketTrends: 50,
      };

      const weights: ScoringWeights = {
        capRate: 0.3,
        cashOnCash: 0.3,
        dscr: 0.2,
        location: 0.1,
        marketTrends: 0.1,
      };

      const result = service['calculateWeightedScore'](criteria, weights);
      const expected = 80 * 0.3 + 70 * 0.3 + 60 * 0.2 + 50 * 0.1 + 50 * 0.1;
      expect(result).toBeCloseTo(expected, 2);
    });

    it('should round to 2 decimal places', () => {
      const criteria = {
        capRate: 85.123,
        cashOnCash: 75.456,
        dscr: 65.789,
        location: 55.012,
        marketTrends: 45.345,
      };

      const result = service['calculateWeightedScore'](criteria, DEFAULT_SCORING_WEIGHTS);
      expect(result.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
    });

    it('should handle all criteria at 100', () => {
      const criteria = {
        capRate: 100,
        cashOnCash: 100,
        dscr: 100,
        location: 100,
        marketTrends: 100,
      };

      const result = service['calculateWeightedScore'](criteria, DEFAULT_SCORING_WEIGHTS);
      expect(result).toBe(100);
    });

    it('should handle all criteria at 0', () => {
      const criteria = {
        capRate: 0,
        cashOnCash: 0,
        dscr: 0,
        location: 0,
        marketTrends: 0,
      };

      const result = service['calculateWeightedScore'](criteria, DEFAULT_SCORING_WEIGHTS);
      expect(result).toBe(0);
    });
  });

  describe('calculateDealScore', () => {
    it('should calculate and save deal score', async () => {
      const deal = createMockDeal();
      const organizationId = 'org-123';

      mockValuationService.calculateDealValuation.mockReturnValue({
        capRate: { rate: 7.5 },
        returnMetrics: {
          cashOnCashReturn: 10.0,
          dscr: 1.3,
        },
      });

      mockConfigRepository.findOne.mockResolvedValue(null);

      const savedScore = {
        id: 'score-123',
        dealId: deal.id,
        overallScore: 75.5,
        criteria: {
          capRate: 87.5,
          cashOnCash: 83.33,
          dscr: 80,
          location: 50,
          marketTrends: 50,
        },
        weights: DEFAULT_SCORING_WEIGHTS,
        calculatedAt: new Date(),
        version: 1,
      };

      mockDealScoreRepository.create.mockReturnValue(savedScore);
      mockDealScoreRepository.save.mockResolvedValue(savedScore);

      const result = await service.calculateDealScore(deal, organizationId);

      expect(result).toBeDefined();
      expect(result.dealId).toBe(deal.id);
      expect(result.overallScore).toBeGreaterThan(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect(mockDealScoreRepository.save).toHaveBeenCalled();
    });

    it('should use custom weights when provided', async () => {
      const deal = createMockDeal();
      const customWeights: ScoringWeights = {
        capRate: 0.5,
        cashOnCash: 0.3,
        dscr: 0.1,
        location: 0.05,
        marketTrends: 0.05,
      };

      mockValuationService.calculateDealValuation.mockReturnValue({
        capRate: { rate: 7.5 },
        returnMetrics: {
          cashOnCashReturn: 10.0,
          dscr: 1.3,
        },
      });

      const savedScore = {
        id: 'score-123',
        dealId: deal.id,
        overallScore: 75.5,
        criteria: {
          capRate: 87.5,
          cashOnCash: 83.33,
          dscr: 80,
          location: 50,
          marketTrends: 50,
        },
        weights: customWeights,
        calculatedAt: new Date(),
        version: 1,
      };

      mockDealScoreRepository.create.mockReturnValue(savedScore);
      mockDealScoreRepository.save.mockResolvedValue(savedScore);

      const result = await service.calculateDealScore(deal, 'org-123', customWeights);

      expect(result.weights).toEqual(customWeights);
    });
  });

  describe('updateScoringConfiguration', () => {
    it('should validate weights sum to 1.0', async () => {
      const invalidWeights: ScoringWeights = {
        capRate: 0.5,
        cashOnCash: 0.3,
        dscr: 0.1,
        location: 0.05,
        marketTrends: 0.05, // Sum = 1.0, but let's test invalid
      };

      // Test with sum != 1.0
      const invalidWeights2: ScoringWeights = {
        capRate: 0.6,
        cashOnCash: 0.3,
        dscr: 0.1,
        location: 0.05,
        marketTrends: 0.05, // Sum = 1.1
      };

      await expect(
        service.updateScoringConfiguration('org-123', invalidWeights2)
      ).rejects.toThrow('Scoring weights must sum to 1.0');
    });

    it('should create new configuration if none exists', async () => {
      const weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS;
      mockConfigRepository.findOne.mockResolvedValue(null);

      const newConfig = {
        id: 'config-123',
        organizationId: 'org-123',
        weights,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockConfigRepository.create.mockReturnValue(newConfig);
      mockConfigRepository.save.mockResolvedValue(newConfig);

      const result = await service.updateScoringConfiguration('org-123', weights);

      expect(result).toBeDefined();
      expect(mockConfigRepository.create).toHaveBeenCalled();
      expect(mockConfigRepository.save).toHaveBeenCalled();
    });

    it('should update existing configuration', async () => {
      const existingConfig = {
        id: 'config-123',
        organizationId: 'org-123',
        weights: DEFAULT_SCORING_WEIGHTS,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newWeights: ScoringWeights = {
        capRate: 0.4,
        cashOnCash: 0.3,
        dscr: 0.2,
        location: 0.05,
        marketTrends: 0.05,
      };

      mockConfigRepository.findOne.mockResolvedValue(existingConfig);
      mockConfigRepository.save.mockResolvedValue({
        ...existingConfig,
        weights: newWeights,
      });

      const result = await service.updateScoringConfiguration('org-123', newWeights);

      expect(result.weights).toEqual(newWeights);
      expect(mockConfigRepository.create).not.toHaveBeenCalled();
    });
  });

  // Helper function
  function createMockDeal(): DealEntity {
    return {
      id: 'deal-123',
      propertyId: 'prop-123',
      organizationId: 'org-123',
      purchasePrice: 500000,
      financing: {
        loanAmount: 400000,
        interestRate: 4.5,
        loanTerm: 30,
        loanType: 'conventional',
      },
      assumptions: {
        rentalIncome: 3000,
        operatingExpenses: 1000,
        vacancyRate: 5,
        managementFee: 10,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    } as DealEntity;
  }
});

