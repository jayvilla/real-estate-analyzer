-- Create enum types for Deal
DO $$ BEGIN
  CREATE TYPE loan_type_enum AS ENUM ('CONVENTIONAL', 'FHA', 'VA', 'USDA', 'HARD_MONEY', 'PRIVATE', 'CASH');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE deal_status_enum AS ENUM ('DRAFT', 'UNDER_CONTRACT', 'CLOSED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create deals table
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "propertyId" UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  
  -- Purchase Details
  "purchasePrice" DECIMAL(12, 2) NOT NULL,
  "purchaseDate" DATE NOT NULL,
  "closingCosts" DECIMAL(12, 2),
  "rehabCosts" DECIMAL(12, 2),
  "totalAcquisitionCost" DECIMAL(12, 2),
  
  -- Financing Details
  "loanType" loan_type_enum NOT NULL,
  "loanAmount" DECIMAL(12, 2),
  "downPayment" DECIMAL(12, 2),
  "downPaymentPercent" DECIMAL(5, 2),
  "interestRate" DECIMAL(5, 2),
  "loanTerm" INT,
  points DECIMAL(5, 2),
  "originationFee" DECIMAL(12, 2),
  
  -- Assumptions
  "monthlyRentalIncome" DECIMAL(12, 2),
  "annualRentalIncome" DECIMAL(12, 2),
  "monthlyExpenses" DECIMAL(12, 2),
  "annualExpenses" DECIMAL(12, 2),
  "vacancyRate" DECIMAL(5, 2),
  "propertyManagementRate" DECIMAL(5, 2),
  "annualAppreciationRate" DECIMAL(5, 2),
  "annualInflationRate" DECIMAL(5, 2),
  "capExReserve" DECIMAL(12, 2),
  insurance DECIMAL(12, 2),
  "propertyTax" DECIMAL(12, 2),
  "hoaFees" DECIMAL(12, 2),
  
  -- Status
  status deal_status_enum NOT NULL DEFAULT 'DRAFT',
  notes TEXT,
  
  -- Timestamps
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on propertyId for faster lookups
CREATE INDEX IF NOT EXISTS idx_deals_property_id ON deals("propertyId");

-- Create trigger to update updatedAt
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

