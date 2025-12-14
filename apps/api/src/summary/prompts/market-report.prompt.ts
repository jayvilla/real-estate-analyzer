export function buildMarketReportPrompt(
  marketData: any,
  trendData: any,
  period: { start: Date; end: Date },
  language: string = 'en'
): string {
  const systemPrompt = language === 'en'
    ? 'You are a real estate market analyst. Generate comprehensive market reports.'
    : 'Eres un analista de mercado inmobiliario. Genera informes completos de mercado.';

  const prompt = language === 'en'
    ? `Generate a comprehensive market report for the period ${period.start.toLocaleDateString()} to ${period.end.toLocaleDateString()}.

MARKET DATA:
${JSON.stringify(marketData, null, 2)}

TREND DATA:
${JSON.stringify(trendData, null, 2)}

Provide a detailed report in JSON format:
{
  "overview": "2-3 paragraph market overview",
  "trends": [
    {
      "metric": "Median Price",
      "current": "$X,XXX,XXX",
      "previous": "$X,XXX,XXX",
      "change": "+X%",
      "trend": "up|down|stable"
    }
  ],
  "marketConditions": [
    {
      "condition": "Inventory Levels",
      "description": "Description of condition"
    }
  ],
  "predictions": [
    {
      "timeframe": "6 months",
      "prediction": "Market prediction",
      "confidence": 75
    }
  ],
  "recommendations": ["recommendation 1", "recommendation 2"]
}

Be specific, data-driven, and provide actionable market intelligence.`
    : `Genera un informe completo de mercado para el período ${period.start.toLocaleDateString()} a ${period.end.toLocaleDateString()}.

DATOS DE MERCADO:
${JSON.stringify(marketData, null, 2)}

DATOS DE TENDENCIAS:
${JSON.stringify(trendData, null, 2)}

Proporciona un informe detallado en formato JSON.`;

  return `${systemPrompt}\n\n${prompt}`;
}

