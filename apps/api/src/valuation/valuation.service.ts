import { Injectable } from '@nestjs/common';
import { DealEntity } from '../deal/entities/deal.entity';
import {
  DealValuation,
  NetOperatingIncome,
  CashFlow,
  CapRate,
  ReturnMetrics,
  PropertyValuation,
} from '@real-estate-analyzer/types';
import { StructuredLoggerService } from '../common/logging/structured-logger.service';

@Injectable()
export class ValuationService {
  constructor(private readonly logger: StructuredLoggerService) {}

  /**
   * Calculate Net Operating Income (NOI)
   */
  calculateNOI(deal: DealEntity): NetOperatingIncome {
    const grossRentalIncome =
      deal.annualRentalIncome || (deal.monthlyRentalIncome || 0) * 12;

    const vacancyRate = deal.vacancyRate || 0;
    const vacancyLoss = (grossRentalIncome * vacancyRate) / 100;
    const effectiveGrossIncome = grossRentalIncome - vacancyLoss;

    let operatingExpenses =
      deal.annualExpenses ||
      (deal.monthlyExpenses || 0) * 12 +
        (deal.insurance || 0) * 12 +
        (deal.propertyTax || 0) * 12 +
        (deal.hoaFees || 0) * 12 +
        (deal.capExReserve || 0) * 12;

    // Add property management fee if applicable
    if (deal.propertyManagementRate) {
      const managementFee =
        (effectiveGrossIncome * deal.propertyManagementRate) / 100;
      operatingExpenses = operatingExpenses + managementFee;
    }

    const noi = effectiveGrossIncome - operatingExpenses;

    return {
      grossRentalIncome,
      vacancyLoss,
      effectiveGrossIncome,
      operatingExpenses,
      noi: Math.max(0, noi), // NOI should not be negative for calculations
    };
  }

  /**
   * Calculate monthly debt service (mortgage payment)
   */
  calculateDebtService(deal: DealEntity): { monthly: number; annual: number } {
    if (!deal.loanAmount || !deal.interestRate || !deal.loanTerm) {
      return { monthly: 0, annual: 0 };
    }

    const principal = deal.loanAmount;
    const monthlyRate = (deal.interestRate || 0) / 100 / 12;
    const numberOfPayments = deal.loanTerm || 360;

    if (monthlyRate === 0) {
      // Interest-free loan
      const monthly = principal / numberOfPayments;
      return { monthly, annual: monthly * 12 };
    }

    // Standard mortgage calculation: M = P * [r(1+r)^n] / [(1+r)^n - 1]
    const monthly =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    return {
      monthly: Math.round(monthly * 100) / 100,
      annual: Math.round(monthly * 12 * 100) / 100,
    };
  }

  /**
   * Calculate Cash Flow
   */
  calculateCashFlow(deal: DealEntity, noi: NetOperatingIncome): CashFlow {
    const debtService = this.calculateDebtService(deal);
    const annualCashFlow = noi.noi - debtService.annual;
    const monthlyCashFlow = annualCashFlow / 12;

    return {
      noi: noi.noi,
      debtService: debtService.annual,
      annualCashFlow: Math.round(annualCashFlow * 100) / 100,
      monthlyCashFlow: Math.round(monthlyCashFlow * 100) / 100,
    };
  }

  /**
   * Calculate Cap Rate
   */
  calculateCapRate(deal: DealEntity, noi: NetOperatingIncome): CapRate {
    const propertyValue =
      deal.property?.currentValue || deal.purchasePrice || 0;
    const capRate = propertyValue > 0 ? (noi.noi / propertyValue) * 100 : 0;

    return {
      noi: noi.noi,
      propertyValue,
      capRate: Math.round(capRate * 100) / 100,
    };
  }

  /**
   * Calculate Return Metrics (ROI, Cash-on-Cash, etc.)
   */
  calculateReturnMetrics(
    deal: DealEntity,
    noi: NetOperatingIncome,
    cashFlow: CashFlow
  ): ReturnMetrics {
    const totalCashInvested =
      (deal.downPayment || 0) +
      (deal.closingCosts || 0) +
      (deal.rehabCosts || 0);

    // Cash-on-Cash Return
    const cashOnCashReturn =
      totalCashInvested > 0
        ? (cashFlow.annualCashFlow / totalCashInvested) * 100
        : 0;

    // Gross Rent Multiplier (GRM)
    const annualGrossRent =
      deal.annualRentalIncome || (deal.monthlyRentalIncome || 0) * 12;
    const grm =
      annualGrossRent > 0 ? deal.purchasePrice / annualGrossRent : 0;

    // Debt Service Coverage Ratio (DSCR)
    const dscr =
      cashFlow.debtService > 0 ? noi.noi / cashFlow.debtService : 0;

    return {
      annualCashFlow: cashFlow.annualCashFlow,
      totalCashInvested,
      cashOnCashReturn: Math.round(cashOnCashReturn * 100) / 100,
      totalReturn: cashFlow.annualCashFlow, // Simplified - could be enhanced with appreciation
      roi: cashOnCashReturn, // Simplified ROI
      purchasePrice: deal.purchasePrice,
      annualGrossRent,
      grm: Math.round(grm * 100) / 100,
      noi: noi.noi,
      debtService: cashFlow.debtService,
      dscr: Math.round(dscr * 100) / 100,
    };
  }

  /**
   * Calculate complete valuation for a deal
   */
  calculateDealValuation(deal: DealEntity): DealValuation {
    const noi = this.calculateNOI(deal);
    const cashFlow = this.calculateCashFlow(deal, noi);
    const capRate = this.calculateCapRate(deal, noi);
    const returns = this.calculateReturnMetrics(deal, noi, cashFlow);

    const debtService = this.calculateDebtService(deal);
    const totalCashInvested =
      (deal.downPayment || 0) +
      (deal.closingCosts || 0) +
      (deal.rehabCosts || 0);

    // Break-even occupancy (when NOI = Debt Service)
    const grossRentalIncome =
      deal.annualRentalIncome || (deal.monthlyRentalIncome || 0) * 12;
    const breakEvenOccupancy =
      grossRentalIncome > 0
        ? (debtService.annual / grossRentalIncome) * 100
        : 0;

    // Monthly expense ratio
    const monthlyExpenseRatio =
      grossRentalIncome > 0
        ? (noi.operatingExpenses / grossRentalIncome) * 100
        : 0;

    // Debt-to-income ratio
    const debtToIncomeRatio =
      grossRentalIncome > 0
        ? (debtService.annual / grossRentalIncome) * 100
        : 0;

    return {
      dealId: deal.id,
      propertyId: deal.propertyId,
      purchasePrice: deal.purchasePrice,
      totalAcquisitionCost: deal.totalAcquisitionCost || deal.purchasePrice,
      totalCashInvested,
      grossRentalIncome,
      effectiveGrossIncome: noi.effectiveGrossIncome,
      operatingExpenses: noi.operatingExpenses,
      noi,
      loanAmount: deal.loanAmount || 0,
      downPayment: deal.downPayment || 0,
      monthlyDebtService: debtService.monthly,
      annualDebtService: debtService.annual,
      cashFlow,
      capRate,
      returns,
      breakEvenOccupancy: Math.round(breakEvenOccupancy * 100) / 100,
      monthlyExpenseRatio: Math.round(monthlyExpenseRatio * 100) / 100,
      debtToIncomeRatio: Math.round(debtToIncomeRatio * 100) / 100,
      vacancyRate: deal.vacancyRate || 0,
      propertyManagementRate: deal.propertyManagementRate || 0,
      annualAppreciationRate: deal.annualAppreciationRate || 0,
      annualInflationRate: deal.annualInflationRate || 0,
    };
  }

  /**
   * Calculate property valuation summary from all deals
   */
  calculatePropertyValuation(
    propertyId: string,
    propertyAddress: string,
    deals: DealEntity[]
  ): PropertyValuation {
    const valuations = deals.map((deal) => this.calculateDealValuation(deal));

    const activeDeals = deals.filter(
      (deal) => deal.status === 'CLOSED' || deal.status === 'UNDER_CONTRACT'
    ).length;

    const totalCashInvested = valuations.reduce(
      (sum, val) => sum + val.totalCashInvested,
      0
    );

    const totalAnnualCashFlow = valuations.reduce(
      (sum, val) => sum + val.cashFlow.annualCashFlow,
      0
    );

    const capRates = valuations
      .map((val) => val.capRate.capRate)
      .filter((rate) => rate > 0);
    const averageCapRate =
      capRates.length > 0
        ? capRates.reduce((sum, rate) => sum + rate, 0) / capRates.length
        : undefined;

    const cashOnCashReturns = valuations
      .map((val) => val.returns.cashOnCashReturn)
      .filter((rate) => rate > 0);
    const averageCashOnCashReturn =
      cashOnCashReturns.length > 0
        ? cashOnCashReturns.reduce((sum, rate) => sum + rate, 0) /
          cashOnCashReturns.length
        : undefined;

    return {
      propertyId,
      propertyAddress,
      totalDeals: deals.length,
      activeDeals,
      averageCapRate: averageCapRate
        ? Math.round(averageCapRate * 100) / 100
        : undefined,
      averageCashOnCashReturn: averageCashOnCashReturn
        ? Math.round(averageCashOnCashReturn * 100) / 100
        : undefined,
      totalCashInvested,
      totalAnnualCashFlow: Math.round(totalAnnualCashFlow * 100) / 100,
      deals: valuations,
    };
  }
}

