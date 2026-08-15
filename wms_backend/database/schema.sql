-- =============================================
-- WMS Database Schema for Supabase
-- =============================================
-- Run this ENTIRE file in the Supabase SQL Editor.
--
-- HOW TO USE:
-- 1. Go to https://supabase.com → your project
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Paste this entire file
-- 4. Click "Run"
--
-- This creates 3 tables:
--   users    → all accounts (admin, engineers, customers)
--   tickets  → maintenance/support tickets
--   comments → messages on tickets
-- =============================================


-- =============================================
-- TABLE: users
-- =============================================
-- Stores all user accounts in the WMS system.
-- The password is stored as a bcrypt hash — NEVER plain text.
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,               -- e.g. "usr-1", "usr-2"
  email         TEXT UNIQUE NOT NULL,           -- Login email
  password_hash TEXT NOT NULL,                  -- bcrypt hashed password
  name          TEXT NOT NULL,                  -- Display name
  role          TEXT NOT NULL                   -- "admin", "engineer", or "customer"
                CHECK (role IN ('admin', 'engineer', 'customer')),
  phone         TEXT,                           -- Optional phone number
  created_at    TIMESTAMPTZ DEFAULT NOW()       -- When account was created
);

-- Index on email for fast login lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
-- Index on role for fast filtering (e.g. "get all engineers")
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);


-- =============================================
-- TABLE: tickets
-- =============================================
-- Each row is one maintenance/support request.
CREATE TABLE IF NOT EXISTS tickets (
  id            TEXT PRIMARY KEY,               -- e.g. "WMS-0001"
  title         TEXT NOT NULL,                  -- Short summary of the problem
  description   TEXT NOT NULL,                  -- Full details
  status        TEXT NOT NULL DEFAULT 'open'    -- Ticket lifecycle state
                CHECK (status IN ('open', 'in_progress', 'resolved')),
  priority      TEXT NOT NULL                   -- Urgency level
                CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  category      TEXT NOT NULL                   -- Equipment type
                CHECK (category IN ('pallet', 'crane', 'conveyor', 'software', 'other')),
  created_by    TEXT NOT NULL                   -- User ID of the reporter
                REFERENCES users(id) ON DELETE CASCADE,
  creator_name  TEXT NOT NULL,                  -- Cached display name (avoids extra join)
  assigned_to   TEXT                            -- Engineer user ID (NULL if unassigned)
                REFERENCES users(id) ON DELETE SET NULL,
  assigned_name TEXT,                           -- Cached engineer name
  resolution    TEXT,                           -- How the problem was fixed
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_tickets_status   ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_created_by  ON tickets(created_by);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at  ON tickets(created_at DESC);


-- =============================================
-- TABLE: comments
-- =============================================
-- Activity log / messages attached to tickets.
-- Includes both user messages and system-generated logs.
CREATE TABLE IF NOT EXISTS comments (
  id          TEXT PRIMARY KEY,                 -- e.g. "cmt-abc123"
  ticket_id   TEXT NOT NULL                     -- Which ticket this belongs to
              REFERENCES tickets(id) ON DELETE CASCADE, -- Delete comments when ticket is deleted
  author_id   TEXT NOT NULL,                    -- User ID or "system"
  author_name TEXT NOT NULL,                    -- Display name
  author_role TEXT NOT NULL                     -- Role at time of posting
              CHECK (author_role IN ('admin', 'engineer', 'customer')),
  content     TEXT NOT NULL,                    -- The comment text
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quickly fetching all comments on a ticket
CREATE INDEX IF NOT EXISTS idx_comments_ticket_id  ON comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at ASC);


-- =============================================
-- SEED DATA: Demo Users
-- =============================================
-- These match the demo accounts in your frontend exactly.
-- Passwords are all "password123" (bcrypt hashed).
--
-- To generate a fresh bcrypt hash for a different password, you can use:
-- https://bcrypt-generator.com/ (use 10 rounds)
--
-- Login credentials:
--   admin@wms.com     / password123 → Admin
--   engineer@wms.com  / password123 → Engineer (Erin)
--   engineer2@wms.com / password123 → Engineer (Alex)
--   customer@wms.com  / password123 → Customer (John)
--   customer2@wms.com / password123 → Customer (Alice)
--   customer3@wms.com / password123 → Customer (Bob)
-- =============================================
INSERT INTO users (id, email, password_hash, name, role, phone) VALUES
  ('usr-1', 'admin@wms.com',     '$2a$10$pjGu7zn2kbYPV2mmjAB/COJYjiHZpBTBWXpFHQ060VwEd/u6tY.QO', 'Admin User',              'admin',    '+1 (555) 010-0001'),
  ('usr-2', 'engineer@wms.com',  '$2a$10$pjGu7zn2kbYPV2mmjAB/COJYjiHZpBTBWXpFHQ060VwEd/u6tY.QO', 'Erin Engineer',           'engineer', '+1 (555) 019-2831'),
  ('usr-6', 'engineer2@wms.com', '$2a$10$pjGu7zn2kbYPV2mmjAB/COJYjiHZpBTBWXpFHQ060VwEd/u6tY.QO', 'Alex Mercer (Engineer)',  'engineer', '+1 (555) 014-9982'),
  ('usr-3', 'customer@wms.com',  '$2a$10$pjGu7zn2kbYPV2mmjAB/COJYjiHZpBTBWXpFHQ060VwEd/u6tY.QO', 'John Doe (Zone A Op)',    'customer', '+1 (555) 012-3456'),
  ('usr-4', 'customer2@wms.com', '$2a$10$pjGu7zn2kbYPV2mmjAB/COJYjiHZpBTBWXpFHQ060VwEd/u6tY.QO', 'Alice Vance (Zone B Op)', 'customer', '+1 (555) 017-8910'),
  ('usr-5', 'customer3@wms.com', '$2a$10$pjGu7zn2kbYPV2mmjAB/COJYjiHZpBTBWXpFHQ060VwEd/u6tY.QO', 'Bob Smith (Zone C Op)',   'customer', '+1 (555) 011-1213')
ON CONFLICT (id) DO NOTHING;  -- Don't fail if users already exist


-- =============================================
-- DONE! ✅
-- After running this, your database is ready.
-- Tables created: users, tickets, comments
-- Demo users inserted with password: password123
-- =============================================
