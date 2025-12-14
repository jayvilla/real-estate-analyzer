import { Property, Deal } from '@real-estate-analyzer/types';

export function buildPortfolioInsightPrompt(
  properties: Property[],
  deals: Deal[],
  portfolioMetrics: any,
  marketData?: any
): string {
  return `You are a real estate portfolio analyst. Analyze this portfolio and provide actionable insights.

PORTFOLIO METRICS:
- Total Properties: ${properties.length}
- Active Deals: ${deals.length}
- Total Portfolio Value: $${portfolioMetrics.totalPortfolioValue?.toLocaleString() || 'N/A'}
- Total Cash Invested: $${portfolioMetrics.totalCashInvested?.toLocaleString() || 'N/A'}
- Monthly Cash Flow: $${portfolioMetrics.totalMonthlyCashFlow?.toLocaleString() || 'N/A'}
- Average Cap Rate: ${portfolioMetrics.averageCapRate?.toFixed(2) || 'N/A'}%
- Average Cash-on-Cash: ${portfolioMetrics.averageCashOnCashReturn?.toFixed(2) || 'N/A'}%

PORTFOLIO COMPOSITION:
- Property Types: ${[...new Set(properties.map((p) => p.propertyType))].join(', ')}
- Geographic Distribution: ${[...new Set(properties.map((p) => `${p.city}, ${p.state}`))].slice(0, 3).join(', ')}

${marketData ? `MARKET CONTEXT:
- Market conditions vary across portfolio locations
` : ''}

Provide portfolio insights in the following JSON format:
{
  "insight": "Key insight about the portfolio (2-3 sentences)",
  "category": "performance|risk|opportunity|optimization",
  "priority": "high|medium|low",
  "actionable": true,
  "actionItems": ["action1", "action2"],
  "relatedProperties": ["property-id-1"],
  "relatedDeals": ["deal-id-1"]
}

Focus on actionable insights that can improve portfolio performance, reduce risk, or identify opportunities.`;
}

