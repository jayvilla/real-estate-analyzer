/**
 * Deal Scoring Types
 */

export interface ScoringCriteria {
  capRate: number; // 0-100 score based on cap rate
  cashOnCash: number; // 0-100 score based on cash-on-cash return
  dscr: number; // 0-100 score based on debt service coverage ratio
  location: number; // 0-100 score (placeholder for future location analysis)
  marketTrends: number; // 0-100 score (placeholder for future market analysis)
}

export interface ScoringWeights {
  capRate: number; // Weight for cap rate (0-1, sum should be ~1.0)
  cashOnCash: number;
  dscr: number;
  location: number;
  marketTrends: number;
}

export interface DealScore {
  id: string;
  dealId: string;
  overallScore: number; // 0-100 weighted average
  criteria: ScoringCriteria;
  weights: ScoringWeights;
  calculatedAt: Date;
  version: number; // For tracking algorithm changes
}

export interface DealScoreHistory {
  dealId: string;
  scores: DealScore[];
  currentScore: DealScore | null;
  scoreChange: number; // Change from previous score
  trend: 'up' | 'down' | 'stable';
}

export interface ScoringConfiguration {
  id: string;
  organizationId: string;
  weights: ScoringWeights;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScoreComparison {
  dealId: string;
  score: number;
  rank: number;
  percentile: number; // 0-100, where this deal ranks
  aboveAverage: boolean;
}

// Default scoring weights
export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  capRate: 0.30, // 30%
  cashOnCash: 0.30, // 30%
  dscr: 0.20, // 20%
  location: 0.10, // 10%
  marketTrends: 0.10, // 10%
};

// Scoring thresholds for different criteria
export const SCORING_THRESHOLDS = {
  capRate: {
    excellent: 8.0, // 8%+
    good: 6.0, // 6-8%
    average: 4.0, // 4-6%
    poor: 0, // <4%
  },
  cashOnCash: {
    excellent: 12.0, // 12%+
    good: 8.0, // 8-12%
    average: 5.0, // 5-8%
    poor: 0, // <5%
  },
  dscr: {
    excellent: 1.5, // 1.5+
    good: 1.25, // 1.25-1.5
    average: 1.1, // 1.1-1.25
    poor: 1.0, // <1.1
  },
};

