-- Lead Management CRM — Initial Schema
-- Run: psql -U postgres -d leadcrm -f migrations/001_init.sql

-- Create database (run separately if needed)
-- CREATE DATABASE leadcrm;

-- Enum types
DO $$ BEGIN
  CREATE TYPE lead_status AS ENUM (
    'not_called',
    'called_no_answer',
    'call_back_later',
    'whatsapp_sent',
    'interested',
    'negotiation',
    'not_interested',
    'wrong_number',
    'converted'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE activity_type AS ENUM ('call', 'whatsapp');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id                SERIAL PRIMARY KEY,
  name              VARCHAR(255) NOT NULL,
  phone             VARCHAR(20) NOT NULL,
  location          VARCHAR(255),
  category          VARCHAR(100),
  status            lead_status DEFAULT 'not_called',
  source            VARCHAR(100) DEFAULT 'apify',
  attempt_count     INTEGER DEFAULT 0,
  priority          INTEGER DEFAULT 0,
  last_contacted_at TIMESTAMPTZ,
  next_follow_up    TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id              SERIAL PRIMARY KEY,
  lead_id         INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  type            activity_type NOT NULL,
  note            TEXT,
  outcome_status  lead_status NOT NULL,
  follow_up_date  TIMESTAMPTZ,
  new_number      VARCHAR(20),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_next_follow_up ON leads(next_follow_up);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);
