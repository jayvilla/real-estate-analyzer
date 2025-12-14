import { MarketTrend, NeighborhoodAnalysis } from '@real-estate-analyzer/types';

export function buildMarketSummaryPrompt(
  trend: MarketTrend,
  neighborhood?: NeighborhoodAnalysis,
  language: string = 'en'
): string {
  const systemPrompt = language === 'en'
    ? 'You are a real estate market analyst. Generate a comprehensive market report summary.'
    : 'Eres un analista de mercado inmobiliario. Genera un resumen completo del informe de mercado.';

  return `${systemPrompt}

MARKET DATA:
- Location: ${trend.city}, ${trend.state} ${trend.zipCode}
- Current Median Price: $${trend.currentMedianPrice?.toLocaleString() || 'N/A'}
- Price Trend: ${trend.trend}
- 30-Day Change: ${trend.priceChange30Days?.toFixed(2) || 'N/A'}%
- 90-Day Change: ${trend.priceChange90Days?.toFixed(2) || 'N/A'}%
- 1-Year Change: ${trend.priceChange1Year?.toFixed(2) || 'N/A'}%
- Average Appreciation Rate: ${trend.averageAppreciationRate.toFixed(2)}%

${neighborhood ? `NEIGHBORHOOD ANALYSIS:
- Population: ${neighborhood.population?.toLocaleString() || 'N/A'}
- Median Income: $${neighborhood.medianIncome?.toLocaleString() || 'N/A'}
- School Rating: ${neighborhood.schoolRating || 'N/A'}/10
- Crime Rate: ${neighborhood.crimeRate || 'N/A'}
` : ''}

Generate a comprehensive market report summary in JSON format:
{
  "summary": "2-3 paragraph market analysis and commentary",
  "marketTrends": {
    "trend": "${trend.trend}",
    "priceChange": ${trend.priceChange1Year || 0},
    "inventory": ${trend.dataPoints?.[trend.dataPoints.length - 1]?.inventoryCount || 0},
    "daysOnMarket": ${trend.dataPoints?.[trend.dataPoints.length - 1]?.daysOnMarket || 0}
  },
  "insights": ["insight1", "insight2", "insight3"],
  "predictions": ["prediction1", "prediction2"],
  "recommendations": ["recommendation1", "recommendation2"]
}

Be insightful, data-driven, and provide actionable market intelligence.`;
}

