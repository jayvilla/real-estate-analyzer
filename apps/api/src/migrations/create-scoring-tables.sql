-- Create deal_scores table
CREATE TABLE IF NOT EXISTS deal_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "dealId" UUID NOT NULL,
  "overallScore" DECIMAL(5, 2) NOT NULL CHECK ("overallScore" >= 0 AND "overallScore" <= 100),
  criteria JSONB NOT NULL,
  weights JSONB NOT NULL,
  version INT NOT NULL DEFAULT 1,
  "calculatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_deal_score_deal FOREIGN KEY ("dealId") REFERENCES deals(id) ON DELETE CASCADE
);

-- Create scoring_configurations table
CREATE TABLE IF NOT EXISTS scoring_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "organizationId" UUID NOT NULL,
  weights JSONB NOT NULL,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_scoring_config_organization FOREIGN KEY ("organizationId") REFERENCES organizations(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_deal_scores_deal_id ON deal_scores("dealId");
CREATE INDEX IF NOT EXISTS idx_deal_scores_calculated_at ON deal_scores("calculatedAt");
CREATE INDEX IF NOT EXISTS idx_deal_scores_deal_calculated ON deal_scores("dealId", "calculatedAt");
CREATE INDEX IF NOT EXISTS idx_deal_scores_deal_version ON deal_scores("dealId", version);
CREATE INDEX IF NOT EXISTS idx_scoring_config_org_default ON scoring_configurations("organizationId", "isDefault");

-- Create trigger to update updatedAt for scoring_configurations
CREATE TRIGGER update_scoring_configurations_updated_at BEFORE UPDATE ON scoring_configurations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

