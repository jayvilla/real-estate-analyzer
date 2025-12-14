/**
 * AI-Driven Summary Types
 */

export enum SummaryType {
  PORTFOLIO = 'portfolio',
  PROPERTY = 'property',
  DEAL = 'deal',
  MARKET = 'market',
  EXECUTIVE = 'executive',
}

export enum SummaryFormat {
  TEXT = 'text',
  HTML = 'html',
  MARKDOWN = 'markdown',
  PDF = 'pdf',
  EMAIL = 'email',
}

export enum SummaryLanguage {
  EN = 'en',
  ES = 'es',
  FR = 'fr',
  DE = 'de',
  ZH = 'zh',
}

export interface SummaryTemplate {
  id: string;
  name: string;
  type: SummaryType;
  format: SummaryFormat;
  template: string; // Template string with placeholders
  variables: string[]; // Available variables in template
  language: SummaryLanguage;
  isDefault: boolean;
}

export interface PortfolioSummaryReport {
  id: string;
  organizationId: string;
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  overview: string;
  keyMetrics: {
    label: string;
    value: string;
    change?: string;
    trend?: 'up' | 'down' | 'stable';
  }[];
  topPerformers: {
    propertyId?: string;
    dealId?: string;
    name: string;
    metric: string;
    value: string;
  }[];
  recommendations: string[];
  risks: string[];
  opportunities: string[];
  format: SummaryFormat;
  language: SummaryLanguage;
}

export interface PropertyPerformanceSummary {
  id: string;
  propertyId: string;
  organizationId: string;
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  overview: string;
  performance: {
    metric: string;
    value: string;
    previousValue?: string;
    change?: string;
    trend?: 'up' | 'down' | 'stable';
  }[];
  financials: {
    income: string;
    expenses: string;
    netCashFlow: string;
    roi: string;
  };
  marketComparison: {
    average: string;
    property: string;
    position: 'above' | 'below' | 'average';
  };
  recommendations: string[];
  format: SummaryFormat;
  language: SummaryLanguage;
}

export interface DealAnalysisSummary {
  id: string;
  dealId: string;
  organizationId: string;
  generatedAt: Date;
  overview: string;
  dealDetails: {
    propertyAddress: string;
    purchasePrice: string;
    downPayment: string;
    loanAmount: string;
  };
  financialMetrics: {
    capRate: string;
    cashOnCash: string;
    dscr: string;
    monthlyCashFlow: string;
    annualCashFlow: string;
  };
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
  recommendation: {
    verdict: 'strong_buy' | 'buy' | 'hold' | 'avoid';
    reasoning: string;
    confidence: number;
  };
  nextSteps: string[];
  format: SummaryFormat;
  language: SummaryLanguage;
}

export interface MarketReport {
  id: string;
  organizationId: string;
  generatedAt: Date;
  market: {
    zipCode?: string;
    city?: string;
    state?: string;
  };
  period: {
    start: Date;
    end: Date;
  };
  overview: string;
  trends: {
    metric: string;
    current: string;
    previous: string;
    change: string;
    trend: 'up' | 'down' | 'stable';
  }[];
  marketConditions: {
    condition: string;
    description: string;
  }[];
  predictions: {
    timeframe: string;
    prediction: string;
    confidence: number;
  }[];
  recommendations: string[];
  format: SummaryFormat;
  language: SummaryLanguage;
}

export interface ExecutiveDashboardSummary {
  id: string;
  organizationId: string;
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  executiveSummary: string;
  portfolioOverview: {
    totalProperties: number;
    totalValue: string;
    totalCashFlow: string;
    averageCapRate: string;
  };
  performance: {
    metric: string;
    value: string;
    target?: string;
    status: 'on_track' | 'above_target' | 'below_target';
  }[];
  highlights: string[];
  concerns: string[];
  strategicRecommendations: string[];
  format: SummaryFormat;
  language: SummaryLanguage;
}

export interface SummaryGenerationOptions {
  type: SummaryType;
  format: SummaryFormat;
  language?: SummaryLanguage;
  templateId?: string;
  period?: {
    start: Date;
    end: Date;
  };
  propertyIds?: string[];
  dealIds?: string[];
  marketZipCode?: string;
  includeCharts?: boolean;
  includeRecommendations?: boolean;
}

export interface ScheduledSummary {
  id: string;
  organizationId: string;
  userId: string;
  type: SummaryType;
  format: SummaryFormat;
  language: SummaryLanguage;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    time: string; // HH:MM format
    timezone: string;
  };
  recipients: string[]; // Email addresses
  templateId?: string;
  isActive: boolean;
  lastRun?: Date;
  nextRun: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailReport {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: {
    filename: string;
    content: Buffer;
    contentType: string;
  }[];
}
