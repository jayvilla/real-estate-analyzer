-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_role_enum
DO $$ BEGIN
  CREATE TYPE user_role_enum AS ENUM ('SUPER_ADMIN', 'ADMIN', 'USER', 'VIEWER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  "firstName" VARCHAR(100) NOT NULL,
  "lastName" VARCHAR(100) NOT NULL,
  role user_role_enum NOT NULL DEFAULT 'USER',
  "organizationId" UUID NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_organization FOREIGN KEY ("organizationId") REFERENCES organizations(id) ON DELETE CASCADE
);

-- Create trigger to update updatedAt for organizations
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to update updatedAt for users
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add organizationId to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "organizationId" UUID;
ALTER TABLE properties ADD CONSTRAINT fk_property_organization FOREIGN KEY ("organizationId") REFERENCES organizations(id) ON DELETE CASCADE;

-- Add organizationId to deals table (via property, but we can also add direct reference if needed)
-- Note: Deals inherit organization from property, but we can add direct reference for performance
ALTER TABLE deals ADD COLUMN IF NOT EXISTS "organizationId" UUID;
ALTER TABLE deals ADD CONSTRAINT fk_deal_organization FOREIGN KEY ("organizationId") REFERENCES organizations(id) ON DELETE CASCADE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users("organizationId");
CREATE INDEX IF NOT EXISTS idx_properties_organization_id ON properties("organizationId");
CREATE INDEX IF NOT EXISTS idx_deals_organization_id ON deals("organizationId");
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

