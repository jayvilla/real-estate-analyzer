import { MarketTrend } from '@real-estate-analyzer/types';

export function buildMarketCommentaryPrompt(trend: MarketTrend): string {
  return `You are a real estate market analyst. Provide market commentary for the following area.

MARKET DATA:
- Location: ${trend.city}, ${trend.state} ${trend.zipCode}
- Current Median Price: $${trend.currentMedianPrice?.toLocaleString() || 'N/A'}
- Price Trend: ${trend.trend}
- 30-Day Change: ${trend.priceChange30Days?.toFixed(2) || 'N/A'}%
- 90-Day Change: ${trend.priceChange90Days?.toFixed(2) || 'N/A'}%
- 1-Year Change: ${trend.priceChange1Year?.toFixed(2) || 'N/A'}%
- Average Appreciation Rate: ${trend.averageAppreciationRate.toFixed(2)}%

RECENT DATA POINTS:
${trend.dataPoints.slice(-6).map((p) => 
  `- ${new Date(p.date).toLocaleDateString()}: $${p.medianPrice?.toLocaleString() || 'N/A'}`
).join('\n')}

Provide market commentary in the following JSON format:
{
  "commentary": "2-3 paragraph market analysis and commentary",
  "keyTrends": ["trend1", "trend2", "trend3"],
  "outlook": "bullish|bearish|neutral",
  "timeHorizon": "short_term|medium_term|long_term",
  "confidence": 75
}

Be insightful, data-driven, and provide actionable market intelligence.`;
}

