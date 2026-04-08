-- Lead Lists / Batches — Group leads by import batch
-- e.g., "Nursery Schools - Kalaburagi", "Restaurants - Mumbai"

CREATE TABLE IF NOT EXISTS lead_lists (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  lead_count  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Add list_id reference to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS list_id INTEGER REFERENCES lead_lists(id) ON DELETE CASCADE;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_leads_list_id ON leads(list_id);
