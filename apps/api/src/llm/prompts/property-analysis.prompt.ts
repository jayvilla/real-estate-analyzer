import { Property, Deal } from '@real-estate-analyzer/types';

export function buildPropertyAnalysisPrompt(
  property: Property,
  deals?: Deal[],
  marketTrend?: any
): string {
  const dealsInfo = deals && deals.length > 0
    ? deals.map((d) => `
      - Purchase Price: $${d.purchasePrice.toLocaleString()}
      - Cap Rate: ${(marketTrend?.currentMedianPrice ? ((d.annualRentalIncome || 0) / d.purchasePrice * 100).toFixed(2) : 'N/A')}%
      - Cash-on-Cash: ${(d.downPayment ? ((d.annualRentalIncome || 0) / d.downPayment * 100).toFixed(2) : 'N/A')}%
    `).join('\n')
    : 'No deals associated with this property yet.';

  return `You are a real estate investment analyst. Analyze the following property and provide insights.

PROPERTY INFORMATION:
- Address: ${property.address}, ${property.city}, ${property.state} ${property.zipCode}
- Type: ${property.propertyType}
- Bedrooms: ${property.bedrooms || 'N/A'}
- Bathrooms: ${property.bathrooms || 'N/A'}
- Square Feet: ${property.squareFeet ? property.squareFeet.toLocaleString() : 'N/A'}
- Year Built: ${property.yearBuilt || 'N/A'}
- Purchase Price: ${property.purchasePrice ? '$' + property.purchasePrice.toLocaleString() : 'N/A'}
- Current Value: ${property.currentValue ? '$' + property.currentValue.toLocaleString() : 'N/A'}

DEAL INFORMATION:
${dealsInfo}

${marketTrend ? `MARKET TREND:
- Current Median Price: $${marketTrend.currentMedianPrice?.toLocaleString() || 'N/A'}
- Price Trend: ${marketTrend.trend}
- 1-Year Appreciation: ${marketTrend.priceChange1Year?.toFixed(2) || 'N/A'}%
` : ''}

Please provide a comprehensive analysis in the following JSON format:
{
  "summary": "Brief 2-3 sentence summary of the property",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "opportunities": ["opportunity1", "opportunity2"],
  "risks": ["risk1", "risk2"],
  "investmentRecommendation": "strong_buy|buy|hold|avoid",
  "confidence": 85,
  "keyMetrics": [
    {
      "metric": "Cap Rate",
      "value": "6.5%",
      "insight": "Above market average"
    }
  ]
}

Be specific, data-driven, and focus on investment potential.`;
}

