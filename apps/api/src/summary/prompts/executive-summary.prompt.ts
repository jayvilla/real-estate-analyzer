export function buildExecutiveSummaryPrompt(
  dashboardData: any,
  portfolioData: any,
  period: { start: Date; end: Date },
  language: string = 'en'
): string {
  const systemPrompt = language === 'en'
    ? 'You are an executive real estate analyst. Generate high-level executive dashboard summaries for C-level executives.'
    : 'Eres un analista ejecutivo inmobiliario. Genera resúmenes ejecutivos de alto nivel para ejecutivos C-level.';

  const prompt = language === 'en'
    ? `Generate an executive dashboard summary for the period ${period.start.toLocaleDateString()} to ${period.end.toLocaleDateString()}.

DASHBOARD DATA:
${JSON.stringify(dashboardData, null, 2)}

PORTFOLIO DATA:
${JSON.stringify(portfolioData, null, 2)}

Provide an executive summary in JSON format:
{
  "executiveSummary": "1-2 paragraph high-level overview for executives",
  "portfolioOverview": {
    "totalProperties": 10,
    "totalValue": "$X,XXX,XXX",
    "totalCashFlow": "$X,XXX",
    "averageCapRate": "X%"
  },
  "performance": [
    {
      "metric": "ROI",
      "value": "X%",
      "target": "Y%",
      "status": "on_track|above_target|below_target"
    }
  ],
  "highlights": ["highlight 1", "highlight 2"],
  "concerns": ["concern 1", "concern 2"],
  "strategicRecommendations": ["recommendation 1", "recommendation 2"]
}

Keep it concise, strategic, and focused on business impact.`
    : `Genera un resumen ejecutivo del dashboard para el período ${period.start.toLocaleDateString()} a ${period.end.toLocaleDateString()}.

DATOS DEL DASHBOARD:
${JSON.stringify(dashboardData, null, 2)}

DATOS DE CARTERA:
${JSON.stringify(portfolioData, null, 2)}

Proporciona un resumen ejecutivo en formato JSON.`;

  return `${systemPrompt}\n\n${prompt}`;
}
