import { Property, Deal } from '@real-estate-analyzer/types';

export function buildInvestmentStrategyPrompt(
  properties: Property[],
  deals: Deal[],
  portfolioMetrics?: any
): string {
  return `You are a real estate investment strategist. Analyze this portfolio and provide strategic recommendations.

PORTFOLIO OVERVIEW:
- Total Properties: ${properties.length}
- Total Deals: ${deals.length}
${portfolioMetrics ? `
- Total Portfolio Value: $${portfolioMetrics.totalPortfolioValue?.toLocaleString() || 'N/A'}
- Average Cap Rate: ${portfolioMetrics.averageCapRate?.toFixed(2) || 'N/A'}%
- Average Cash-on-Cash: ${portfolioMetrics.averageCashOnCashReturn?.toFixed(2) || 'N/A'}%
` : ''}

PROPERTY TYPES:
${[...new Set(properties.map((p) => p.propertyType))].map((type) => `- ${type}`).join('\n')}

LOCATIONS:
${[...new Set(properties.map((p) => `${p.city}, ${p.state}`))].slice(0, 5).map((loc) => `- ${loc}`).join('\n')}

Provide an investment strategy in the following JSON format:
{
  "strategy": "Brief strategy description (2-3 sentences)",
  "rationale": "Why this strategy fits the portfolio",
  "targetMarkets": ["market1", "market2"],
  "propertyTypes": ["type1", "type2"],
  "riskTolerance": "conservative|moderate|aggressive",
  "timeHorizon": "short-term (1-2 years)|medium-term (3-5 years)|long-term (5+ years)",
  "expectedReturns": "Expected return range and rationale",
  "actionItems": ["action1", "action2", "action3"]
}

Focus on portfolio optimization, diversification, and growth opportunities.`;
}

