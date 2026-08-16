-- =============================================
-- INSERT: New Company (TechMart Ltd) + Admin + 2 Operators
-- =============================================
-- Run this in Supabase SQL Editor.
-- Password for ALL users below: password123
-- =============================================

-- STEP 1: Insert the company
INSERT INTO companies (id, name, is_active, created_at, updated_at)
VALUES (
  'comp-3',
  'TechMart Ltd',
  TRUE,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- STEP 2: Insert Client Admin for TechMart Ltd
INSERT INTO users (id, email, password_hash, name, role, company_name, company_id, is_active, provider, email_verified, created_at)
VALUES (
  'usr-techmart-admin',
  'admin@techmart.com',
  '$2a$10$pjGu7zn2kbYPV2mmjAB/COJYjiHZpBTBWXpFHQ060VwEd/u6tY.QO',  -- password123
  'TechMart Admin',
  'client_admin',
  'TechMart Ltd',
  'comp-3',
  TRUE,
  'local',
  TRUE,
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- STEP 3: Insert Operator 1 for TechMart Ltd
INSERT INTO users (id, email, password_hash, name, role, company_name, company_id, is_active, provider, email_verified, created_at)
VALUES (
  'usr-techmart-op1',
  'operator1@techmart.com',
  '$2a$10$pjGu7zn2kbYPV2mmjAB/COJYjiHZpBTBWXpFHQ060VwEd/u6tY.QO',  -- password123
  'TechMart Operator 1',
  'client_operator',
  'TechMart Ltd',
  'comp-3',
  TRUE,
  'local',
  TRUE,
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- STEP 4: Insert Operator 2 for TechMart Ltd
INSERT INTO users (id, email, password_hash, name, role, company_name, company_id, is_active, provider, email_verified, created_at)
VALUES (
  'usr-techmart-op2',
  'operator2@techmart.com',
  '$2a$10$pjGu7zn2kbYPV2mmjAB/COJYjiHZpBTBWXpFHQ060VwEd/u6tY.QO',  -- password123
  'TechMart Operator 2',
  'client_operator',
  'TechMart Ltd',
  'comp-3',
  TRUE,
  'local',
  TRUE,
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- Verify with:
-- SELECT * FROM companies WHERE id = 'comp-3';
-- SELECT id, name, email, role, company_name, is_active FROM users WHERE company_id = 'comp-3';
-- =============================================
