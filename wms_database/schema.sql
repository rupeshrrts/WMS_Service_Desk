-- =============================================
-- WMS Database Schema for Supabase (Unified Master Script)
-- =============================================
-- This script completely rebuilds your database with all tables,
-- columns (including Google OAuth), and mock data.
--
-- Run this ENTIRE file in the Supabase SQL Editor.
-- =============================================

-- =============================================
-- TABLE: users
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id              TEXT PRIMARY KEY,               -- e.g. "usr-1", "usr-2"
  email           TEXT UNIQUE NOT NULL,           -- Login email
  password_hash   TEXT,                           -- bcrypt hashed password (nullable for Google Auth)
  name            TEXT NOT NULL,                  -- Display name
  role            TEXT NOT NULL                   
                  CHECK (role IN ('super_admin', 'wms_admin', 'wms_senior_engineer', 'wms_engineer', 'client_admin', 'client_operator')),
  company_name    TEXT,                           -- Client company or 'WMS Internal'
  phone           TEXT,                           -- Optional phone number
  google_id       TEXT UNIQUE,                    -- For Google OAuth
  profile_picture TEXT,                           -- For Google OAuth
  provider        TEXT DEFAULT 'local' CHECK (provider IN ('local', 'google')),
  email_verified  BOOLEAN DEFAULT FALSE,
  last_login      TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW()       -- When account was created
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- =============================================
-- TABLE: tickets
-- =============================================
CREATE TABLE IF NOT EXISTS tickets (
  id            TEXT PRIMARY KEY,               -- e.g. "WMS-0001"
  title         TEXT NOT NULL,                  
  description   TEXT NOT NULL,                  
  status        TEXT NOT NULL DEFAULT 'open'    
                CHECK (status IN ('open', 'in_progress', 'escalated', 'resolved', 'closed')),
  priority      TEXT NOT NULL                   
                CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  category      TEXT NOT NULL                   
                CHECK (category IN ('pallet', 'crane', 'conveyor', 'software', 'other')),
  company_name  TEXT,                           -- The company this ticket belongs to
  created_by    TEXT NOT NULL                   
                REFERENCES users(id) ON DELETE CASCADE,
  creator_name  TEXT NOT NULL,                  
  assigned_to   TEXT                            
                REFERENCES users(id) ON DELETE SET NULL,
  assigned_name TEXT,                           
  resolution    TEXT,                           
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_status   ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_created_by  ON tickets(created_by);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at  ON tickets(created_at DESC);

-- =============================================
-- TABLE: comments
-- =============================================
CREATE TABLE IF NOT EXISTS comments (
  id          TEXT PRIMARY KEY,                 -- e.g. "cmt-abc123"
  ticket_id   TEXT NOT NULL                     
              REFERENCES tickets(id) ON DELETE CASCADE, 
  author_id   TEXT NOT NULL,                    
  author_name TEXT NOT NULL,                    
  author_role TEXT NOT NULL                     
              CHECK (author_role IN ('super_admin', 'wms_admin', 'wms_senior_engineer', 'wms_engineer', 'client_admin', 'client_operator', 'system')),
  content     TEXT NOT NULL,                    
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_ticket_id  ON comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at ASC);

-- =============================================
-- SEED DATA: Demo Users
-- =============================================
-- Passwords are all "password123" (bcrypt hashed).
INSERT INTO users (id, email, password_hash, name, role, company_name, phone, provider, email_verified) VALUES
  ('usr-1', 'admin@wms.com',           '$2a$10$pjGu7zn2kbYPV2mmjAB/COJYjiHZpBTBWXpFHQ060VwEd/u6tY.QO', 'System Admin',           'wms_admin',           'WMS Internal', '+1 (555) 010-0001', 'local', true),
  ('usr-2', 'senior@wms.com',          '$2a$10$pjGu7zn2kbYPV2mmjAB/COJYjiHZpBTBWXpFHQ060VwEd/u6tY.QO', 'Sarah (Senior Eng)',     'wms_senior_engineer', 'WMS Internal', '+1 (555) 019-2831', 'local', true),
  ('usr-3', 'engineer@wms.com',        '$2a$10$pjGu7zn2kbYPV2mmjAB/COJYjiHZpBTBWXpFHQ060VwEd/u6tY.QO', 'Alex (Engineer)',        'wms_engineer',        'WMS Internal', '+1 (555) 014-9982', 'local', true),
  ('usr-4', 'client_admin@acme.com',   '$2a$10$pjGu7zn2kbYPV2mmjAB/COJYjiHZpBTBWXpFHQ060VwEd/u6tY.QO', 'Alice (Acme Admin)',     'client_admin',        'Acme Corp',    '+1 (555) 012-3456', 'local', true),
  ('usr-5', 'operator@acme.com',       '$2a$10$pjGu7zn2kbYPV2mmjAB/COJYjiHZpBTBWXpFHQ060VwEd/u6tY.QO', 'Bob (Acme Operator)',    'client_operator',     'Acme Corp',    '+1 (555) 017-8910', 'local', true),
  ('usr-6', 'operator@globex.com',     '$2a$10$pjGu7zn2kbYPV2mmjAB/COJYjiHZpBTBWXpFHQ060VwEd/u6tY.QO', 'Charlie (Globex Op)',    'client_operator',     'Globex Inc',   '+1 (555) 011-1213', 'local', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- SEED DATA: Demo Tickets
-- =============================================
INSERT INTO tickets (id, title, description, status, priority, category, company_name, created_by, creator_name, assigned_to, assigned_name, created_at, updated_at) VALUES
('WMS-0007', 'Conveyor Belt Jam', 'Pallet conveyor line D routing sensor is showing light misalignment.', 'open', 'low', 'pallet', 'Acme Corp', 'usr-5', 'Bob (Acme Operator)', NULL, NULL, '2026-07-30 09:12:00', '2026-07-30 09:12:00'),
('WMS-0006', 'ASRS vertical lift failure', 'ASRS automated retrieval unit failed vertical lift calibration on Aisle 4.', 'escalated', 'critical', 'software', 'Globex Inc', 'usr-6', 'Charlie (Globex Op)', 'usr-3', 'Alex (Engineer)', '2026-07-30 08:30:00', '2026-07-30 10:15:00'),
('WMS-0005', 'Pallet not picked by crane', 'Conveyor handoff bay sensor timing error.', 'in_progress', 'medium', 'conveyor', 'Acme Corp', 'usr-4', 'Alice (Acme Admin)', 'usr-3', 'Alex (Engineer)', '2026-07-30 08:00:00', '2026-07-30 08:00:00')
ON CONFLICT (id) DO NOTHING;
