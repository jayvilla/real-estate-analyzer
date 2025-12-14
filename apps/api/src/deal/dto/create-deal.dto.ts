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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LoanType, DealStatus } from '@real-estate-analyzer/types';

export class CreateDealDto {
  @ApiProperty({
    description: 'UUID of the associated property',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  propertyId!: string;

  // Purchase Details
  @ApiProperty({
    description: 'Total purchase price',
    example: 500000,
    type: Number,
    minimum: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  purchasePrice!: number;

  @ApiProperty({
    description: 'Purchase date in ISO 8601 format',
    example: '2024-01-15T00:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  @IsNotEmpty()
  purchaseDate!: string;

  @ApiPropertyOptional({
    description: 'Estimated closing costs',
    example: 10000,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  closingCosts?: number;

  @ApiPropertyOptional({
    description: 'Renovation/repair costs',
    example: 25000,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rehabCosts?: number;

  // Financing Details
  @ApiProperty({
    description: 'Type of loan',
    enum: LoanType,
    example: LoanType.CONVENTIONAL,
    enumName: 'LoanType',
  })
  @IsEnum(LoanType)
  @IsNotEmpty()
  loanType!: LoanType;

  @ApiPropertyOptional({
    description: 'Loan amount',
    example: 400000,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  loanAmount?: number;

  @ApiPropertyOptional({
    description: 'Down payment amount',
    example: 100000,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  downPayment?: number;

  @ApiPropertyOptional({
    description: 'Down payment percentage (0-100)',
    example: 20,
    type: Number,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  downPaymentPercent?: number;

  @ApiPropertyOptional({
    description: 'Annual interest rate as percentage (0-100)',
    example: 4.5,
    type: Number,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  interestRate?: number;

  @ApiPropertyOptional({
    description: 'Loan term in months',
    example: 360,
    type: Number,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  loanTerm?: number; // in months

  @ApiPropertyOptional({
    description: 'Loan points',
    example: 1,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  points?: number;

  @ApiPropertyOptional({
    description: 'Loan origination fee',
    example: 2000,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  originationFee?: number;

  // Assumptions
  @ApiPropertyOptional({
    description: 'Monthly rental income',
    example: 3000,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyRentalIncome?: number;

  @ApiPropertyOptional({
    description: 'Annual rental income',
    example: 36000,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  annualRentalIncome?: number;

  @ApiPropertyOptional({
    description: 'Monthly operating expenses',
    example: 1000,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyExpenses?: number;

  @ApiPropertyOptional({
    description: 'Annual operating expenses',
    example: 12000,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  annualExpenses?: number;

  @ApiPropertyOptional({
    description: 'Vacancy rate as percentage (0-100)',
    example: 5,
    type: Number,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  vacancyRate?: number; // percentage (0-100)

  @ApiPropertyOptional({
    description: 'Property management fee as percentage (0-100)',
    example: 10,
    type: Number,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  propertyManagementRate?: number; // percentage (0-100)

  @ApiPropertyOptional({
    description: 'Expected annual appreciation rate as percentage (0-100)',
    example: 3,
    type: Number,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  annualAppreciationRate?: number; // percentage (0-100)

  @ApiPropertyOptional({
    description: 'Expected annual inflation rate as percentage (0-100)',
    example: 2.5,
    type: Number,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  annualInflationRate?: number; // percentage (0-100)

  @ApiPropertyOptional({
    description: 'Monthly capital expenditures reserve',
    example: 200,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  capExReserve?: number; // monthly reserve for capital expenditures

  @ApiPropertyOptional({
    description: 'Monthly insurance cost',
    example: 150,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  insurance?: number; // monthly insurance cost

  @ApiPropertyOptional({
    description: 'Monthly property tax',
    example: 500,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  propertyTax?: number; // monthly property tax

  @ApiPropertyOptional({
    description: 'Monthly HOA fees',
    example: 100,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hoaFees?: number; // monthly HOA fees

  // Status
  @ApiPropertyOptional({
    description: 'Deal status',
    enum: DealStatus,
    example: DealStatus.ACTIVE,
    enumName: 'DealStatus',
  })
  @IsOptional()
  @IsEnum(DealStatus)
  status?: DealStatus;

  @ApiPropertyOptional({
    description: 'Additional notes about the deal',
    example: 'Great location, needs some updates',
    type: String,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
