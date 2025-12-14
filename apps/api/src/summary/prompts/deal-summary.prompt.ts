export function buildDealSummaryPrompt(
  dealData: any,
  valuationData: any,
  riskData: any,
  language: string = 'en'
): string {
  const systemPrompt = language === 'en'
    ? 'You are a real estate deal analyst. Generate comprehensive deal analysis summaries.'
    : 'Eres un analista de transacciones inmobiliarias. Genera resúmenes completos de análisis de transacciones.';

  const prompt = language === 'en'
    ? `Generate a comprehensive deal analysis summary.

DEAL DATA:
${JSON.stringify(dealData, null, 2)}

VALUATION DATA:
${JSON.stringify(valuationData, null, 2)}

RISK DATA:
${JSON.stringify(riskData, null, 2)}

Provide a detailed summary in JSON format:
{
  "overview": "2-3 paragraph summary of the deal",
  "dealDetails": {
    "propertyAddress": "Address",
    "purchasePrice": "$X,XXX,XXX",
    "downPayment": "$X,XXX",
    "loanAmount": "$X,XXX,XXX"
  },
  "financialMetrics": {
    "capRate": "X%",
    "cashOnCash": "X%",
    "dscr": "X.XX",
    "monthlyCashFlow": "$X,XXX",
    "annualCashFlow": "$X,XXX"
  },
  "riskAssessment": {
    "level": "low|medium|high",
    "factors": ["factor 1", "factor 2"]
  },
  "recommendation": {
    "verdict": "strong_buy|buy|hold|avoid",
    "reasoning": "2-3 sentence explanation",
    "confidence": 85
  },
  "nextSteps": ["step 1", "step 2"]
}

Be specific, data-driven, and provide actionable recommendations.`
    : `Genera un resumen completo del análisis de la transacción.

DATOS DE LA TRANSACCIÓN:
${JSON.stringify(dealData, null, 2)}

DATOS DE VALORACIÓN:
${JSON.stringify(valuationData, null, 2)}

DATOS DE RIESGO:
${JSON.stringify(riskData, null, 2)}

Proporciona un resumen detallado en formato JSON.`;

  return `${systemPrompt}\n\n${prompt}`;
}
