import { Deal, DealValuation } from '@real-estate-analyzer/types';

export function buildDealRecommendationPrompt(
  deal: Deal,
  valuation: DealValuation,
  marketTrend?: any
): string {
  return `You are a real estate investment advisor. Analyze the following deal and provide a recommendation.

DEAL INFORMATION:
- Property Address: [Property address would be here]
- Purchase Price: $${deal.purchasePrice.toLocaleString()}
- Down Payment: ${deal.downPayment ? '$' + deal.downPayment.toLocaleString() : 'N/A'}
- Loan Type: ${deal.loanType}
- Interest Rate: ${deal.interestRate ? deal.interestRate + '%' : 'N/A'}
- Loan Term: ${deal.loanTerm ? deal.loanTerm + ' months' : 'N/A'}

FINANCIAL METRICS:
- Cap Rate: ${valuation.capRate?.rate ? valuation.capRate.rate.toFixed(2) + '%' : 'N/A'}
- Cash-on-Cash Return: ${valuation.returnMetrics?.cashOnCashReturn ? valuation.returnMetrics.cashOnCashReturn.toFixed(2) + '%' : 'N/A'}
- DSCR: ${valuation.returnMetrics?.dscr ? valuation.returnMetrics.dscr.toFixed(2) : 'N/A'}
- Monthly Cash Flow: ${valuation.cashFlow?.monthlyCashFlow ? '$' + valuation.cashFlow.monthlyCashFlow.toLocaleString() : 'N/A'}
- Annual NOI: ${valuation.noi?.noi ? '$' + valuation.noi.noi.toLocaleString() : 'N/A'}

RENTAL ASSUMPTIONS:
- Monthly Rental Income: ${deal.monthlyRentalIncome ? '$' + deal.monthlyRentalIncome.toLocaleString() : 'N/A'}
- Vacancy Rate: ${deal.vacancyRate ? deal.vacancyRate + '%' : 'N/A'}
- Annual Expenses: ${deal.annualExpenses ? '$' + deal.annualExpenses.toLocaleString() : 'N/A'}

${marketTrend ? `MARKET CONTEXT:
- Market Trend: ${marketTrend.trend}
- 1-Year Appreciation: ${marketTrend.priceChange1Year?.toFixed(2) || 'N/A'}%
` : ''}

Provide a detailed recommendation in the following JSON format:
{
  "recommendation": "highly_recommended|recommended|neutral|not_recommended",
  "reasoning": "2-3 sentence explanation of your recommendation",
  "keyFactors": ["factor1", "factor2", "factor3"],
  "suggestedActions": ["action1", "action2"],
  "riskLevel": "low|medium|high",
  "confidence": 80
}

Focus on financial viability, market conditions, and risk assessment.`;
}

