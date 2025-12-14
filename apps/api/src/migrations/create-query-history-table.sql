-- Create query_history table for NLQ feature
CREATE TABLE IF NOT EXISTS query_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  structured_query JSONB NOT NULL,
  result_count INTEGER NOT NULL DEFAULT 0,
  execution_time INTEGER NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_query_history_user_org_timestamp 
  ON query_history(user_id, organization_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_query_history_org_timestamp 
  ON query_history(organization_id, timestamp DESC);

-- Add comment
COMMENT ON TABLE query_history IS 'Stores natural language query history for users';

