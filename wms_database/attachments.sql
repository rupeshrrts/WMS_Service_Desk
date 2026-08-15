-- =============================================
-- ATTACHMENTS FEATURE: Run this in Supabase SQL Editor
-- =============================================

-- 1. Create the ticket_attachments table
CREATE TABLE IF NOT EXISTS ticket_attachments (
  id              TEXT PRIMARY KEY,
  ticket_id       TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  file_name       TEXT NOT NULL,        -- Original filename e.g. "error_log.png"
  file_url        TEXT NOT NULL,        -- Public Supabase Storage URL
  file_type       TEXT NOT NULL,        -- MIME type e.g. "image/png"
  file_size       INTEGER NOT NULL,     -- Size in bytes
  uploaded_by_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  uploaded_by_name TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attachments_ticket_id ON ticket_attachments(ticket_id);

-- 2. Create the Supabase Storage bucket for attachments
-- Go to Supabase Dashboard → Storage → New Bucket
-- Name: ticket-attachments
-- Public: YES (so files can be viewed via URL)
-- NOTE: You must create this bucket manually in the Supabase dashboard!
-- After creating, add this policy to allow uploads:
--   Allow all operations for authenticated users.

-- To make the bucket public, run this after creating the bucket:
INSERT INTO storage.buckets (id, name, public)
VALUES ('ticket-attachments', 'ticket-attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;
