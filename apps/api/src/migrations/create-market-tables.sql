-- Create market_data table
CREATE TABLE IF NOT EXISTS market_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "zipCode" VARCHAR(10) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  "medianPrice" DECIMAL(12, 2),
  "averagePrice" DECIMAL(12, 2),
  "pricePerSquareFoot" DECIMAL(10, 2),
  "medianRent" DECIMAL(10, 2),
  "averageRent" DECIMAL(10, 2),
  "daysOnMarket" INT,
  "inventoryCount" INT,
  "salesCount" INT,
  "appreciationRate" DECIMAL(5, 2),
  source VARCHAR(50),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("zipCode", date)
);

-- Create market_alert_type_enum
DO $$ BEGIN
  CREATE TYPE market_alert_type_enum AS ENUM ('price_change', 'rent_change', 'inventory_change', 'appreciation_change');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create market_alerts table
CREATE TABLE IF NOT EXISTS market_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "organizationId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  type market_alert_type_enum NOT NULL,
  "zipCode" VARCHAR(10) NOT NULL,
  threshold DECIMAL(10, 2) NOT NULL,
  "currentValue" DECIMAL(12, 2) NOT NULL,
  "previousValue" DECIMAL(12, 2) NOT NULL,
  change DECIMAL(10, 2) NOT NULL,
  message TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "triggeredAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_market_alert_organization FOREIGN KEY ("organizationId") REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_market_alert_user FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_market_data_zip_date ON market_data("zipCode", date);
CREATE INDEX IF NOT EXISTS idx_market_data_city_state_date ON market_data(city, state, date);
CREATE INDEX IF NOT EXISTS idx_market_alerts_org_read ON market_alerts("organizationId", "isRead");
CREATE INDEX IF NOT EXISTS idx_market_alerts_user_read ON market_alerts("userId", "isRead");
CREATE INDEX IF NOT EXISTS idx_market_alerts_zip_triggered ON market_alerts("zipCode", "triggeredAt");

