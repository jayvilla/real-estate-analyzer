import { PropertyPerformanceSummary } from '@real-estate-analyzer/types';

export function buildPropertySummaryPrompt(
  propertyData: any,
  performanceData: any,
  marketData: any,
  period: { start: Date; end: Date },
  language: string = 'en'
): string {
  const systemPrompt = language === 'en'
    ? 'You are a real estate property analyst. Generate detailed property performance summaries.'
    : 'Eres un analista de propiedades inmobiliarias. Genera resúmenes detallados de rendimiento de propiedades.';

  const prompt = language === 'en'
    ? `Generate a comprehensive property performance summary for the period ${period.start.toLocaleDateString()} to ${period.end.toLocaleDateString()}.

PROPERTY DATA:
${JSON.stringify(propertyData, null, 2)}

PERFORMANCE DATA:
${JSON.stringify(performanceData, null, 2)}

MARKET DATA:
${JSON.stringify(marketData, null, 2)}

Provide a detailed summary in JSON format:
{
  "overview": "2-3 paragraph summary of property performance",
  "performance": [
    {
      "metric": "Cap Rate",
      "value": "X%",
      "previousValue": "Y%",
      "change": "+X%",
      "trend": "up|down|stable"
    }
  ],
  "financials": {
    "income": "$X,XXX",
    "expenses": "$X,XXX",
    "netCashFlow": "$X,XXX",
    "roi": "X%"
  },
  "marketComparison": {
    "average": "X%",
    "property": "Y%",
    "position": "above|below|average"
  },
  "recommendations": ["recommendation 1", "recommendation 2"]
}

Be specific and data-driven.`
    : `Genera un resumen completo del rendimiento de la propiedad para el período ${period.start.toLocaleDateString()} a ${period.end.toLocaleDateString()}.

DATOS DE LA PROPIEDAD:
${JSON.stringify(propertyData, null, 2)}

DATOS DE RENDIMIENTO:
${JSON.stringify(performanceData, null, 2)}

DATOS DE MERCADO:
${JSON.stringify(marketData, null, 2)}

Proporciona un resumen detallado en formato JSON.`;

  return `${systemPrompt}\n\n${prompt}`;
}
