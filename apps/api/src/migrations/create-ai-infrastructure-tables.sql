-- Create AI Infrastructure tables

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  key_hash VARCHAR(255) NOT NULL,
  key_prefix VARCHAR(255),
  name VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT true,
  rate_limits JSONB,
  expires_at TIMESTAMP,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_api_keys_org_provider ON api_keys(organization_id, provider);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);

-- Cost Tracking table
CREATE TABLE IF NOT EXISTS ai_cost_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  provider VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  feature VARCHAR(100) NOT NULL,
  prompt_tokens INTEGER NOT NULL,
  completion_tokens INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  estimated_cost DECIMAL(12, 6) NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cost_tracking_org_time ON ai_cost_tracking(organization_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_cost_tracking_user_time ON ai_cost_tracking(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_cost_tracking_provider_time ON ai_cost_tracking(provider, timestamp);
CREATE INDEX IF NOT EXISTS idx_cost_tracking_feature_time ON ai_cost_tracking(feature, timestamp);

-- Feature Flags table
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT false,
  target_users JSONB,
  target_organizations JSONB,
  rollout_percentage INTEGER,
  conditions JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_feature_flags_name ON feature_flags(name);

-- AB Tests table
CREATE TABLE IF NOT EXISTS ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  variants JSONB NOT NULL,
  traffic_split JSONB NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metrics JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- AB Test Assignments table
CREATE TABLE IF NOT EXISTS ab_test_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  test_id UUID NOT NULL,
  variant_id UUID NOT NULL,
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, test_id)
);

CREATE INDEX IF NOT EXISTS idx_ab_assignments_org_test ON ab_test_assignments(organization_id, test_id);

-- AI Usage Analytics table
CREATE TABLE IF NOT EXISTS ai_usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature VARCHAR(100) NOT NULL,
  user_id UUID,
  organization_id UUID,
  provider VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  success BOOLEAN NOT NULL,
  response_time INTEGER,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  cost DECIMAL(12, 6) NOT NULL DEFAULT 0,
  error_code VARCHAR(50),
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usage_analytics_feature_org_time ON ai_usage_analytics(feature, organization_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_provider_time ON ai_usage_analytics(provider, timestamp);

-- Add comments
COMMENT ON TABLE api_keys IS 'Stores encrypted API keys for AI providers';
COMMENT ON TABLE ai_cost_tracking IS 'Tracks AI API usage costs';
COMMENT ON TABLE feature_flags IS 'Feature flags for AI features';
COMMENT ON TABLE ab_tests IS 'A/B tests for AI features';
COMMENT ON TABLE ab_test_assignments IS 'User assignments to A/B test variants';
COMMENT ON TABLE ai_usage_analytics IS 'Analytics for AI feature usage';

