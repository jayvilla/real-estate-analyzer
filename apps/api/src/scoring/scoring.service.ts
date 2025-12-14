import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DealScoreEntity } from './entities/deal-score.entity';
import { ScoringConfigurationEntity } from './entities/scoring-configuration.entity';
import { DealEntity } from '../deal/entities/deal.entity';
import { ValuationService } from '../valuation/valuation.service';
import { StructuredLoggerService } from '../common/logging/structured-logger.service';
import {
  DealScore,
  ScoringCriteria,
  ScoringWeights,
  DEFAULT_SCORING_WEIGHTS,
  SCORING_THRESHOLDS,
} from '@real-estate-analyzer/types';

@Injectable()
export class ScoringService {
  private readonly ALGORITHM_VERSION = 1;

  constructor(
    @InjectRepository(DealScoreEntity)
    private readonly dealScoreRepository: Repository<DealScoreEntity>,
    @InjectRepository(ScoringConfigurationEntity)
    private readonly configRepository: Repository<ScoringConfigurationEntity>,
    private readonly valuationService: ValuationService,
    private readonly logger: StructuredLoggerService
  ) {}

  /**
   * Calculate score for a single deal
   */
  async calculateDealScore(
    deal: DealEntity,
    organizationId: string,
    weights?: ScoringWeights
  ): Promise<DealScore> {
    const startTime = Date.now();

    // Get scoring weights (use provided, organization config, or default)
    const scoringWeights = weights || (await this.getScoringWeights(organizationId));

    // Calculate individual criteria scores
    const criteria = await this.calculateCriteria(deal);

    // Calculate weighted overall score
    const overallScore = this.calculateWeightedScore(criteria, scoringWeights);

    // Save score to history
    const scoreEntity = this.dealScoreRepository.create({
      dealId: deal.id,
      overallScore,
      criteria,
      weights: scoringWeights,
      version: this.ALGORITHM_VERSION,
    });

    const saved = await this.dealScoreRepository.save(scoreEntity);

    const duration = Date.now() - startTime;
    this.logger.logWithMetadata(
      'info',
      `Calculated deal score: ${overallScore.toFixed(2)} for deal ${deal.id}`,
      {
        dealId: deal.id,
        overallScore,
        duration,
        criteria,
      },
      'ScoringService'
    );

    return {
      id: saved.id,
      dealId: saved.dealId,
      overallScore: Number(saved.overallScore),
      criteria: saved.criteria,
      weights: saved.weights,
      calculatedAt: saved.calculatedAt,
      version: saved.version,
    };
  }

  /**
   * Calculate individual criteria scores
   */
  private async calculateCriteria(deal: DealEntity): Promise<ScoringCriteria> {
    // Get valuation metrics
    const valuation = this.valuationService.calculateDealValuation(deal);
    const capRate = valuation.capRate?.rate || 0;
    const cashOnCash = valuation.returnMetrics?.cashOnCashReturn || 0;
    const dscr = valuation.returnMetrics?.dscr || 0;

    return {
      capRate: this.scoreCapRate(capRate),
      cashOnCash: this.scoreCashOnCash(cashOnCash),
      dscr: this.scoreDSCR(dscr),
      location: this.scoreLocation(deal), // Placeholder - returns 50 for now
      marketTrends: this.scoreMarketTrends(deal), // Placeholder - returns 50 for now
    };
  }

  /**
   * Score cap rate (0-100)
   */
  private scoreCapRate(capRate: number): number {
    const { excellent, good, average } = SCORING_THRESHOLDS.capRate;

    if (capRate >= excellent) {
      return 100;
    } else if (capRate >= good) {
      // Linear interpolation between good and excellent
      return 75 + ((capRate - good) / (excellent - good)) * 25;
    } else if (capRate >= average) {
      // Linear interpolation between average and good
      return 50 + ((capRate - average) / (good - average)) * 25;
    } else {
      // Linear interpolation between 0 and average
      return Math.max(0, (capRate / average) * 50);
    }
  }

  /**
   * Score cash-on-cash return (0-100)
   */
  private scoreCashOnCash(cashOnCash: number): number {
    const { excellent, good, average } = SCORING_THRESHOLDS.cashOnCash;

    if (cashOnCash >= excellent) {
      return 100;
    } else if (cashOnCash >= good) {
      return 75 + ((cashOnCash - good) / (excellent - good)) * 25;
    } else if (cashOnCash >= average) {
      return 50 + ((cashOnCash - average) / (good - average)) * 25;
    } else {
      return Math.max(0, (cashOnCash / average) * 50);
    }
  }

  /**
   * Score DSCR (0-100)
   */
  private scoreDSCR(dscr: number): number {
    const { excellent, good, average } = SCORING_THRESHOLDS.dscr;

    if (dscr >= excellent) {
      return 100;
    } else if (dscr >= good) {
      return 75 + ((dscr - good) / (excellent - good)) * 25;
    } else if (dscr >= average) {
      return 50 + ((dscr - average) / (good - average)) * 25;
    } else {
      // DSCR below 1.0 is risky
      return Math.max(0, (dscr / average) * 50);
    }
  }

  /**
   * Score location (placeholder - returns 50 for now)
   * TODO: Implement location-based scoring using property address, zip code, etc.
   */
  private scoreLocation(deal: DealEntity): number {
    // Placeholder: return neutral score
    // Future: analyze zip code, neighborhood, school ratings, crime stats, etc.
    return 50;
  }

  /**
   * Score market trends (placeholder - returns 50 for now)
   * TODO: Implement market trend analysis
   */
  private scoreMarketTrends(deal: DealEntity): number {
    // Placeholder: return neutral score
    // Future: analyze market appreciation, rental trends, inventory levels, etc.
    return 50;
  }

  /**
   * Calculate weighted overall score
   */
  private calculateWeightedScore(
    criteria: ScoringCriteria,
    weights: ScoringWeights
  ): number {
    const weightedSum =
      criteria.capRate * weights.capRate +
      criteria.cashOnCash * weights.cashOnCash +
      criteria.dscr * weights.dscr +
      criteria.location * weights.location +
      criteria.marketTrends * weights.marketTrends;

    return Math.round(weightedSum * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Get scoring weights for organization (or default)
   */
  async getScoringWeights(organizationId: string): Promise<ScoringWeights> {
    const config = await this.configRepository.findOne({
      where: { organizationId, isDefault: true },
    });

    if (config) {
      return config.weights;
    }

    return DEFAULT_SCORING_WEIGHTS;
  }

  /**
   * Get current score for a deal
   */
  async getDealScore(dealId: string): Promise<DealScore | null> {
    const score = await this.dealScoreRepository.findOne({
      where: { dealId },
      order: { calculatedAt: 'DESC' },
    });

    if (!score) {
      return null;
    }

    return {
      id: score.id,
      dealId: score.dealId,
      overallScore: Number(score.overallScore),
      criteria: score.criteria,
      weights: score.weights,
      calculatedAt: score.calculatedAt,
      version: score.version,
    };
  }

  /**
   * Get score history for a deal
   */
  async getDealScoreHistory(dealId: string): Promise<DealScore[]> {
    const scores = await this.dealScoreRepository.find({
      where: { dealId },
      order: { calculatedAt: 'DESC' },
      take: 50, // Limit to last 50 scores
    });

    return scores.map((score) => ({
      id: score.id,
      dealId: score.dealId,
      overallScore: Number(score.overallScore),
      criteria: score.criteria,
      weights: score.weights,
      calculatedAt: score.calculatedAt,
      version: score.version,
    }));
  }

  /**
   * Compare scores across multiple deals
   */
  async compareDealScores(dealIds: string[]): Promise<Map<string, DealScore>> {
    const scores = await this.dealScoreRepository
      .createQueryBuilder('score')
      .where('score.dealId IN (:...dealIds)', { dealIds })
      .andWhere(
        `score.calculatedAt = (
          SELECT MAX(s2.calculatedAt)
          FROM deal_scores s2
          WHERE s2.dealId = score.dealId
        )`
      )
      .getMany();

    const scoreMap = new Map<string, DealScore>();
    scores.forEach((score) => {
      scoreMap.set(score.dealId, {
        id: score.id,
        dealId: score.dealId,
        overallScore: Number(score.overallScore),
        criteria: score.criteria,
        weights: score.weights,
        calculatedAt: score.calculatedAt,
        version: score.version,
      });
    });

    return scoreMap;
  }

  /**
   * Update scoring configuration for organization
   */
  async updateScoringConfiguration(
    organizationId: string,
    weights: ScoringWeights
  ): Promise<ScoringConfigurationEntity> {
    // Validate weights sum to ~1.0
    const sum = Object.values(weights).reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1.0) > 0.01) {
      throw new Error('Scoring weights must sum to 1.0');
    }

    // Find or create configuration
    let config = await this.configRepository.findOne({
      where: { organizationId, isDefault: true },
    });

    if (config) {
      config.weights = weights;
    } else {
      config = this.configRepository.create({
        organizationId,
        weights,
        isDefault: true,
      });
    }

    return this.configRepository.save(config);
  }
}

