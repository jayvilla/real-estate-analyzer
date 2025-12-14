/**
 * Financial types for real estate valuation and analysis
 */

/**
 * Net Operating Income (NOI) calculation
 */
export interface NetOperatingIncome {
  grossRentalIncome: number; // Annual
  vacancyLoss: number; // Annual
  effectiveGrossIncome: number; // Annual (gross - vacancy)
  operatingExpenses: number; // Annual
  noi: number; // Annual (effective gross income - operating expenses)
}

/**
 * Cash Flow calculation
 */
export interface CashFlow {
  noi: number; // Annual NOI
  debtService: number; // Annual mortgage payment
  annualCashFlow: number; // Annual (NOI - debt service)
  monthlyCashFlow: number; // Monthly
}

/**
 * Capitalization Rate (Cap Rate)
 */
export interface CapRate {
  noi: number; // Annual NOI
  propertyValue: number; // Current property value or purchase price
  capRate: number; // Percentage (NOI / Property Value * 100)
}

/**
 * Return on Investment (ROI) metrics
 */
export interface ReturnMetrics {
  // Cash-on-Cash Return
  annualCashFlow: number;
  totalCashInvested: number; // Down payment + closing costs + rehab
  cashOnCashReturn: number; // Percentage (Annual Cash Flow / Total Cash Invested * 100)

  // ROI
  totalReturn: number; // Total profit over time
  roi: number; // Percentage

  // Gross Rent Multiplier (GRM)
  purchasePrice: number;
  annualGrossRent: number;
  grm: number; // Purchase Price / Annual Gross Rent

  // Debt Service Coverage Ratio (DSCR)
  noi: number;
  debtService: number;
  dscr: number; // NOI / Debt Service (should be > 1.0)
}

/**
 * Complete valuation analysis for a deal
 */
export interface DealValuation {
  dealId: string;
  propertyId: string;

  // Basic metrics
  purchasePrice: number;
  totalAcquisitionCost: number;
  totalCashInvested: number;

  // Income metrics
  grossRentalIncome: number; // Annual
  effectiveGrossIncome: number; // Annual (after vacancy)
  operatingExpenses: number; // Annual
  noi: NetOperatingIncome;

  // Financing metrics
  loanAmount: number;
  downPayment: number;
  monthlyDebtService: number;
  annualDebtService: number;

  // Cash flow
  cashFlow: CashFlow;

  // Cap rate
  capRate: CapRate;

  // Return metrics
  returns: ReturnMetrics;

  // Additional metrics
  breakEvenOccupancy: number; // Percentage needed to break even
  monthlyExpenseRatio: number; // Operating expenses / Gross income
  debtToIncomeRatio: number; // Debt service / Gross income

  // Assumptions used
  vacancyRate: number;
  propertyManagementRate: number;
  annualAppreciationRate: number;
  annualInflationRate: number;
}

/**
 * Property valuation summary (aggregated from all deals)
 */
export interface PropertyValuation {
  propertyId: string;
  propertyAddress: string;
  totalDeals: number;
  activeDeals: number;
  averageCapRate?: number;
  averageCashOnCashReturn?: number;
  totalCashInvested: number;
  totalAnnualCashFlow: number;
  deals: DealValuation[];
}

