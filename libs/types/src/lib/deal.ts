/**
 * Deal types for real estate analysis
 */

export enum LoanType {
  CONVENTIONAL = 'CONVENTIONAL',
  FHA = 'FHA',
  VA = 'VA',
  USDA = 'USDA',
  HARD_MONEY = 'HARD_MONEY',
  PRIVATE = 'PRIVATE',
  CASH = 'CASH',
}

export enum DealStatus {
  DRAFT = 'DRAFT',
  UNDER_CONTRACT = 'UNDER_CONTRACT',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

export interface Deal {
  id: string;
  propertyId: string;

  // Purchase Details
  purchasePrice: number;
  purchaseDate: Date;
  closingCosts?: number;
  rehabCosts?: number;
  totalAcquisitionCost?: number;

  // Financing Details
  loanType: LoanType;
  loanAmount?: number;
  downPayment?: number;
  downPaymentPercent?: number;
  interestRate?: number;
  loanTerm?: number; // in months
  points?: number;
  originationFee?: number;

  // Assumptions
  monthlyRentalIncome?: number;
  annualRentalIncome?: number;
  monthlyExpenses?: number;
  annualExpenses?: number;
  vacancyRate?: number; // percentage (0-100)
  propertyManagementRate?: number; // percentage (0-100)
  annualAppreciationRate?: number; // percentage (0-100)
  annualInflationRate?: number; // percentage (0-100)
  capExReserve?: number; // monthly reserve for capital expenditures
  insurance?: number; // monthly insurance cost
  propertyTax?: number; // monthly property tax
  hoaFees?: number; // monthly HOA fees

  // Status
  status: DealStatus;
  notes?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDealDto {
  propertyId: string;

  // Purchase Details
  purchasePrice: number;
  purchaseDate: Date;
  closingCosts?: number;
  rehabCosts?: number;

  // Financing Details
  loanType: LoanType;
  loanAmount?: number;
  downPayment?: number;
  downPaymentPercent?: number;
  interestRate?: number;
  loanTerm?: number;
  points?: number;
  originationFee?: number;

  // Assumptions
  monthlyRentalIncome?: number;
  annualRentalIncome?: number;
  monthlyExpenses?: number;
  annualExpenses?: number;
  vacancyRate?: number;
  propertyManagementRate?: number;
  annualAppreciationRate?: number;
  annualInflationRate?: number;
  capExReserve?: number;
  insurance?: number;
  propertyTax?: number;
  hoaFees?: number;

  // Status
  status?: DealStatus;
  notes?: string;
}

export interface UpdateDealDto {
  // Purchase Details
  purchasePrice?: number;
  purchaseDate?: Date;
  closingCosts?: number;
  rehabCosts?: number;

  // Financing Details
  loanType?: LoanType;
  loanAmount?: number;
  downPayment?: number;
  downPaymentPercent?: number;
  interestRate?: number;
  loanTerm?: number;
  points?: number;
  originationFee?: number;

  // Assumptions
  monthlyRentalIncome?: number;
  annualRentalIncome?: number;
  monthlyExpenses?: number;
  annualExpenses?: number;
  vacancyRate?: number;
  propertyManagementRate?: number;
  annualAppreciationRate?: number;
  annualInflationRate?: number;
  capExReserve?: number;
  insurance?: number;
  propertyTax?: number;
  hoaFees?: number;

  // Status
  status?: DealStatus;
  notes?: string;
}
