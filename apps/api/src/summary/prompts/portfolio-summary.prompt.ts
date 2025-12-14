// Note: PortfolioSummary from analytics is used for data, PortfolioSummaryReport is the AI-generated summary

export function buildPortfolioSummaryPrompt(
  portfolioData: any,
  period: { start: Date; end: Date },
  language: string = 'en'
): string {
  const systemPrompt = language === 'en' 
    ? 'You are a real estate portfolio analyst. Generate comprehensive, executive-level portfolio summaries.'
    : 'Eres un analista de cartera inmobiliaria. Genera resúmenes ejecutivos completos de cartera.';

  const prompt = language === 'en'
    ? `Generate a comprehensive portfolio summary for the period ${period.start.toLocaleDateString()} to ${period.end.toLocaleDateString()}.

PORTFOLIO DATA:
${JSON.stringify(portfolioData, null, 2)}

Provide a detailed summary in JSON format:
{
  "overview": "2-3 paragraph executive summary of portfolio performance",
  "keyMetrics": [
    {
      "label": "Total Portfolio Value",
      "value": "$X,XXX,XXX",
      "change": "+X%",
      "trend": "up|down|stable"
    }
  ],
  "topPerformers": [
    {
      "name": "Property/Deal name",
      "metric": "Cap Rate",
      "value": "X%"
    }
  ],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "risks": ["risk 1", "risk 2"],
  "opportunities": ["opportunity 1", "opportunity 2"]
}

Be specific, data-driven, and focus on actionable insights.`
    : `Genera un resumen completo de cartera para el período ${period.start.toLocaleDateString()} a ${period.end.toLocaleDateString()}.

DATOS DE CARTERA:
${JSON.stringify(portfolioData, null, 2)}

Proporciona un resumen detallado en formato JSON:
{
  "overview": "Resumen ejecutivo de 2-3 párrafos del rendimiento de la cartera",
  "keyMetrics": [...],
  "topPerformers": [...],
  "recommendations": [...],
  "risks": [...],
  "opportunities": [...]
}

Sé específico, basado en datos y enfócate en insights accionables.`;

  return `${systemPrompt}\n\n${prompt}`;
}
