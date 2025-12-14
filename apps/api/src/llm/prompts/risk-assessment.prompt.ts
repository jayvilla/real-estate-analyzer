import { Deal, DealValuation, Property } from '@real-estate-analyzer/types';

export function buildRiskAssessmentPrompt(
  property?: Property,
  deal?: Deal,
  valuation?: DealValuation,
  marketTrend?: any
): string {
  const context = deal
    ? `DEAL-BASED RISK ASSESSMENT:
- Purchase Price: $${deal.purchasePrice.toLocaleString()}
- Down Payment: ${deal.downPayment ? '$' + deal.downPayment.toLocaleString() : 'N/A'}
- DSCR: ${valuation?.returnMetrics?.dscr ? valuation.returnMetrics.dscr.toFixed(2) : 'N/A'}
- Cash-on-Cash: ${valuation?.returnMetrics?.cashOnCashReturn ? valuation.returnMetrics.cashOnCashReturn.toFixed(2) + '%' : 'N/A'}
- Vacancy Rate: ${deal.vacancyRate ? deal.vacancyRate + '%' : 'N/A'}
`
    : `PROPERTY-BASED RISK ASSESSMENT:
- Address: ${property?.address || 'N/A'}
- Type: ${property?.propertyType || 'N/A'}
- Purchase Price: ${property?.purchasePrice ? '$' + property.purchasePrice.toLocaleString() : 'N/A'}
`;

  return `You are a real estate risk analyst. Assess the risks associated with this investment.

${context}

${marketTrend ? `MARKET CONDITIONS:
- Market Trend: ${marketTrend.trend}
- Price Change (1Y): ${marketTrend.priceChange1Year?.toFixed(2) || 'N/A'}%
- Inventory Level: ${marketTrend.dataPoints?.[marketTrend.dataPoints.length - 1]?.inventoryCount || 'N/A'}
` : ''}

Provide a comprehensive risk assessment in the following JSON format:
{
  "overallRisk": "low|medium|high|very_high",
  "riskScore": 45,
  "riskFactors": [
    {
      "factor": "Market volatility",
      "severity": "medium",
      "description": "Market shows signs of volatility",
      "mitigation": "Diversify across multiple properties"
    }
  ],
  "recommendations": [
    "Conduct thorough due diligence",
    "Consider market timing"
  ]
}

Be specific about financial, market, and operational risks.`;
}

