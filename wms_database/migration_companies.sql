-- =============================================
-- MIGRATION: Multi-Company Support
-- =============================================
-- Run this ENTIRE file in the Supabase SQL Editor.
-- This adds:
--   1. companies table
--   2. company_id FK on users and tickets
--   3. is_active column on users (to enable/disable operators)
--   4. Seeds companies and links existing users/tickets
-- =============================================

-- =============================================
-- STEP 1: Create companies table
-- =============================================
CREATE TABLE IF NOT EXISTS companies (
  id          TEXT PRIMARY KEY,           -- e.g. "comp-1"
  name        TEXT UNIQUE NOT NULL,       -- e.g. "Acme Corp"
  is_active   BOOLEAN DEFAULT TRUE,       -- WMS Admin can suspend a whole company
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);

-- =============================================
-- STEP 2: Add company_id column to users
-- =============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id TEXT REFERENCES companies(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active   BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_users_company_id  ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active   ON users(is_active);

-- =============================================
-- STEP 3: Add company_id column to tickets
-- =============================================
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS company_id TEXT REFERENCES companies(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tickets_company_id ON tickets(company_id);

-- =============================================
-- STEP 4: Seed companies (Acme Corp + Globex Inc)
-- =============================================
INSERT INTO companies (id, name, is_active, created_at, updated_at) VALUES
  ('comp-1', 'Acme Corp',  TRUE, NOW(), NOW()),
  ('comp-2', 'Globex Inc', TRUE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- STEP 5: Link existing users to their companies
-- =============================================
UPDATE users SET company_id = 'comp-1', is_active = TRUE WHERE company_name = 'Acme Corp';
UPDATE users SET company_id = 'comp-2', is_active = TRUE WHERE company_name = 'Globex Inc';
-- WMS internal users have no company
UPDATE users SET is_active = TRUE WHERE company_name = 'WMS Internal' OR company_name IS NULL;

-- =============================================
-- STEP 6: Link existing tickets to their companies
-- =============================================
UPDATE tickets SET company_id = 'comp-1' WHERE company_name = 'Acme Corp';
UPDATE tickets SET company_id = 'comp-2' WHERE company_name = 'Globex Inc';

-- =============================================
-- Done! Verify with these queries:
-- SELECT * FROM companies;
-- SELECT id, name, role, company_name, company_id, is_active FROM users;
-- SELECT id, company_name, company_id FROM tickets;
-- =============================================
