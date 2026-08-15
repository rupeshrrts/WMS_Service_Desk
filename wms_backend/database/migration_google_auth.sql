-- =============================================
-- MIGRATION: Add Google OAuth columns to users
-- =============================================
-- Run this in Supabase SQL Editor to add Google auth support.
-- Safe to run on existing database (uses IF NOT EXISTS / DO NOTHING).
-- =============================================

-- 1. Add Google-specific columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id       TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider        TEXT DEFAULT 'local' CHECK (provider IN ('local', 'google'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified  BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login      TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ DEFAULT NOW();

-- 2. Make password_hash nullable (Google users don't have passwords)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- 3. Index on google_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- 4. Update existing seed users to have provider='local' and email_verified=true
UPDATE users SET provider = 'local', email_verified = true, updated_at = NOW()
WHERE provider IS NULL;

-- =============================================
-- DONE! Google Auth columns added. ✅
-- =============================================
