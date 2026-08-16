-- =============================================
-- MIGRATION: Super Admin Role & Master Account
-- =============================================
-- Run this in Supabase SQL Editor.
-- Password for Super Admin: password123
-- =============================================

-- Step 1: Update the role CHECK constraint on users table to allow 'super_admin'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('super_admin', 'wms_admin', 'wms_senior_engineer', 'wms_engineer', 'client_admin', 'client_operator'));

-- Step 2: Update the author_role CHECK constraint on comments table
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_author_role_check;
ALTER TABLE comments ADD CONSTRAINT comments_author_role_check 
  CHECK (author_role IN ('super_admin', 'wms_admin', 'wms_senior_engineer', 'wms_engineer', 'client_admin', 'client_operator', 'system'));

-- Step 3: Insert or update the Super Admin master account
INSERT INTO users (
  id,
  email,
  password_hash,
  name,
  role,
  company_name,
  company_id,
  phone,
  provider,
  email_verified,
  is_active,
  created_at
)
VALUES (
  'usr-super-admin',
  'superadmin@wms.com',
  '$2a$10$pjGu7zn2kbYPV2mmjAB/COJYjiHZpBTBWXpFHQ060VwEd/u6tY.QO',  -- password123
  'Master Super Admin',
  'super_admin',
  'WMS Internal',
  NULL,
  '+1 (555) 000-9999',
  'local',
  TRUE,
  TRUE,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  password_hash = '$2a$10$pjGu7zn2kbYPV2mmjAB/COJYjiHZpBTBWXpFHQ060VwEd/u6tY.QO',
  is_active = TRUE;

-- Verify with:
-- SELECT id, email, name, role, is_active FROM users WHERE role = 'super_admin';
