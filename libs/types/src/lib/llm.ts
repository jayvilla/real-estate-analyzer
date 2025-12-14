/**
 * LLM Provider Types
 */

export enum LLMProvider {
  OLLAMA = 'ollama',
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  MOCK = 'mock',
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  messages: LLMMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface LLMResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

export interface PropertyAnalysis {
  propertyId: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  risks: string[];
  investmentRecommendation: 'strong_buy' | 'buy' | 'hold' | 'avoid';
  confidence: number; // 0-100
  keyMetrics: {
    metric: string;
    value: string;
    insight: string;
  }[];
}

export interface DealRecommendation {
  dealId: string;
  recommendation: 'highly_recommended' | 'recommended' | 'neutral' | 'not_recommended';
  reasoning: string;
  keyFactors: string[];
  suggestedActions: string[];
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface RiskAssessment {
  propertyId?: string;
  dealId?: string;
  overallRisk: 'low' | 'medium' | 'high' | 'very_high';
  riskScore: number; // 0-100
  riskFactors: {
    factor: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    mitigation?: string;
  }[];
  recommendations: string[];
}

export interface InvestmentStrategy {
  portfolioId?: string;
  strategy: string;
  rationale: string;
  targetMarkets: string[];
  propertyTypes: string[];
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  timeHorizon: string;
  expectedReturns: string;
  actionItems: string[];
}

export interface MarketCommentary {
  zipCode: string;
  commentary: string;
  keyTrends: string[];
  outlook: 'bullish' | 'bearish' | 'neutral';
  timeHorizon: 'short_term' | 'medium_term' | 'long_term';
  confidence: number;
}

export interface PropertyDescription {
  propertyId: string;
  description: string; // Natural language description
  highlights: string[];
  sellingPoints: string[];
  targetAudience: string;
}

export interface PortfolioInsight {
  portfolioId?: string;
  organizationId: string;
  insight: string;
  category: 'performance' | 'risk' | 'opportunity' | 'optimization';
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  actionItems?: string[];
  relatedProperties?: string[];
  relatedDeals?: string[];
}

