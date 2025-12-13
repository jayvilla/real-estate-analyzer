-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum type for propertyType
DO $$ BEGIN
  CREATE TYPE property_type_enum AS ENUM ('SINGLE_FAMILY', 'MULTI_FAMILY', 'CONDO', 'TOWNHOUSE', 'COMMERCIAL', 'LAND');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  "zipCode" VARCHAR(20) NOT NULL,
  "propertyType" property_type_enum NOT NULL,
  bedrooms INT,
  bathrooms INT,
  "squareFeet" DECIMAL(10, 2),
  "lotSize" DECIMAL(10, 2),
  "yearBuilt" INT,
  "purchasePrice" DECIMAL(12, 2),
  "currentValue" DECIMAL(12, 2),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to update updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

