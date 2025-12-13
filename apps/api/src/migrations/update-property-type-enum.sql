-- Drop the old enum type (this will fail if there are existing rows, so we need to alter it)
-- First, let's add the new values to the enum
DO $$ 
BEGIN
  -- Add new enum values if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'SINGLE_FAMILY' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'property_type_enum')) THEN
    ALTER TYPE property_type_enum ADD VALUE 'SINGLE_FAMILY';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'MULTI_FAMILY' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'property_type_enum')) THEN
    ALTER TYPE property_type_enum ADD VALUE 'MULTI_FAMILY';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'CONDO' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'property_type_enum')) THEN
    ALTER TYPE property_type_enum ADD VALUE 'CONDO';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'TOWNHOUSE' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'property_type_enum')) THEN
    ALTER TYPE property_type_enum ADD VALUE 'TOWNHOUSE';
  END IF;
END $$;

-- Note: We can't easily remove 'RESIDENTIAL' and 'INDUSTRIAL' if they exist without recreating the enum
-- For now, we'll just add the new values. If you need to remove old values, you'd need to:
-- 1. Create a new enum with only the values you want
-- 2. Alter the table to use the new enum
-- 3. Drop the old enum

