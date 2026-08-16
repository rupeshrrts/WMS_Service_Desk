-- =============================================
-- INSERT: Apex Global + Admin (admin@apex.com / password123)
-- =============================================
-- Run this in Supabase SQL Editor if you want to create Apex via SQL.
-- =============================================

INSERT INTO companies (id, name, is_active, created_at, updated_at)
VALUES (
  'comp-4',
  'Apex Global',
  TRUE,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, email, password_hash, name, role, company_name, company_id, is_active, provider, email_verified, created_at)
VALUES (
  'usr-apex-admin',
  'admin@apex.com',
  '$2a$10$pjGu7zn2kbYPV2mmjAB/COJYjiHZpBTBWXpFHQ060VwEd/u6tY.QO',  -- password123
  'Apex Admin',
  'client_admin',
  'Apex Global',
  'comp-4',
  TRUE,
  'local',
  TRUE,
  NOW()
)
ON CONFLICT (id) DO NOTHING;
