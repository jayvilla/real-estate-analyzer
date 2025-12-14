import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  IsDateString,
  IsUUID,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { LoanType, DealStatus } from '@real-estate-analyzer/types';

export class CreateDealDto {
  @IsUUID()
  @IsNotEmpty()
  propertyId!: string;

  // Purchase Details
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  purchasePrice!: number;

  @IsDateString()
  @IsNotEmpty()
  purchaseDate!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  closingCosts?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rehabCosts?: number;

  // Financing Details
  @IsEnum(LoanType)
  @IsNotEmpty()
  loanType!: LoanType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  loanAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  downPayment?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  downPaymentPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  interestRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  loanTerm?: number; // in months

  @IsOptional()
  @IsNumber()
  @Min(0)
  points?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  originationFee?: number;

  // Assumptions
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyRentalIncome?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  annualRentalIncome?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyExpenses?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  annualExpenses?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  vacancyRate?: number; // percentage (0-100)

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  propertyManagementRate?: number; // percentage (0-100)

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  annualAppreciationRate?: number; // percentage (0-100)

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  annualInflationRate?: number; // percentage (0-100)

  @IsOptional()
  @IsNumber()
  @Min(0)
  capExReserve?: number; // monthly reserve for capital expenditures

  @IsOptional()
  @IsNumber()
  @Min(0)
  insurance?: number; // monthly insurance cost

  @IsOptional()
  @IsNumber()
  @Min(0)
  propertyTax?: number; // monthly property tax

  @IsOptional()
  @IsNumber()
  @Min(0)
  hoaFees?: number; // monthly HOA fees

  // Status
  @IsOptional()
  @IsEnum(DealStatus)
  status?: DealStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

