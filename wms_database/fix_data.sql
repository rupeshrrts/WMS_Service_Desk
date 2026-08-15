-- =============================================
-- DATA FIX: Correct ticket category mismatches
-- =============================================
-- Run this in Supabase SQL Editor to fix the data issues.

-- WMS-0007: "Conveyor Belt Jam" was wrongly set to category='pallet'. Fix to 'conveyor'.
UPDATE tickets SET category = 'conveyor' WHERE id = 'WMS-0007';

-- WMS-0005: "Pallet not picked by crane" was wrongly set to category='conveyor'. Fix to 'crane'.
UPDATE tickets SET category = 'crane' WHERE id = 'WMS-0005';

-- WMS-0010: creator_name says 'Charlie (Globex Op)' but created_by is usr-5 (Bob).
--           Fix the creator_name and company to match usr-5 (Bob, Acme Corp).
UPDATE tickets SET created_by = 'usr-6', company_name = 'Globex Inc' WHERE id = 'WMS-0010';
