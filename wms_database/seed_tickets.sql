-- =============================================
-- ADDITIONAL SEED DATA: Demo Tickets & Comments
-- =============================================
-- Run this script in Supabase to populate your dashboards with a lot of realistic data!

INSERT INTO tickets (id, title, description, status, priority, category, company_name, created_by, creator_name, assigned_to, assigned_name, created_at, updated_at) VALUES
('WMS-0008', 'Software timeout on picking station', 'Station 3 software freezes when scanning barcode 129304.', 'resolved', 'low', 'software', 'Acme Corp', 'usr-5', 'Bob (Acme Operator)', 'usr-3', 'Alex (Engineer)', '2026-08-10 10:00:00', '2026-08-11 11:00:00'),
('WMS-0009', 'Crane 2 emergency stop triggered', 'Emergency stop was triggered automatically during high-speed rotation.', 'escalated', 'critical', 'crane', 'Acme Corp', 'usr-5', 'Bob (Acme Operator)', 'usr-2', 'Sarah (Senior Eng)', '2026-08-12 14:30:00', '2026-08-12 15:00:00'),
('WMS-0010', 'Pallet scanning error in Zone A', 'Laser scanner is dirty or failing to read standard format labels.', 'open', 'medium', 'pallet', 'Globex Inc', 'usr-5', 'Charlie (Globex Op)', NULL, NULL, '2026-08-13 09:15:00', '2026-08-13 09:15:00'),
('WMS-0011', 'Conveyor belt speed sync issue', 'Belt B is moving 5% faster than Belt A causing pallet jams.', 'in_progress', 'high', 'conveyor', 'Globex Inc', 'usr-6', 'Charlie (Globex Op)', 'usr-3', 'Alex (Engineer)', '2026-08-14 11:20:00', '2026-08-14 13:45:00'),
('WMS-0012', 'Weekly maintenance check failed', 'Routine diagnostic check on sorting algorithms returned error code 404.', 'open', 'low', 'software', 'Acme Corp', 'usr-4', 'Alice (Acme Admin)', NULL, NULL, '2026-08-15 08:00:00', '2026-08-15 08:00:00'),
('WMS-0013', 'Hydraulic fluid leak on Crane 4', 'Small leak detected near the base of Crane 4. Needs immediate attention.', 'escalated', 'critical', 'crane', 'Globex Inc', 'usr-6', 'Charlie (Globex Op)', 'usr-2', 'Sarah (Senior Eng)', '2026-08-15 09:30:00', '2026-08-15 10:15:00'),
('WMS-0014', 'Dashboard reporting incorrect metrics', 'The WCS dashboard is showing yesterday''s throughput numbers.', 'resolved', 'medium', 'software', 'Acme Corp', 'usr-4', 'Alice (Acme Admin)', 'usr-3', 'Alex (Engineer)', '2026-08-01 10:00:00', '2026-08-02 11:00:00')
ON CONFLICT (id) DO NOTHING;

-- Add some comments to make the tickets look active
INSERT INTO comments (id, ticket_id, author_id, author_name, author_role, content, created_at) VALUES
('cmt-101', 'WMS-0011', 'usr-3', 'Alex (Engineer)', 'wms_engineer', 'I have remotely accessed the PLC and I am recalibrating Belt B speed now.', '2026-08-14 12:00:00'),
('cmt-102', 'WMS-0011', 'usr-6', 'Charlie (Globex Op)', 'client_operator', 'Thank you Alex, please let me know when we can resume operations in Zone C.', '2026-08-14 12:15:00'),
('cmt-103', 'WMS-0009', 'usr-5', 'Bob (Acme Operator)', 'client_operator', 'The crane is completely locked up. We cannot move it manually.', '2026-08-12 14:35:00'),
('cmt-104', 'WMS-0009', 'usr-2', 'Sarah (Senior Eng)', 'wms_senior_engineer', 'This looks like a hardware safety lock. I am escalating this to the field team for an on-site visit.', '2026-08-12 15:00:00')
ON CONFLICT (id) DO NOTHING;
