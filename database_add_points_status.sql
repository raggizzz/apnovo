-- ============================================
-- ADD POINTS STATUS MIGRATION
-- ============================================

-- Add 'points_status' column to 'items' table for gamification
-- Values: 'NONE', 'PENDING', 'APPROVED', 'REJECTED'
ALTER TABLE items ADD COLUMN IF NOT EXISTS points_status TEXT DEFAULT 'NONE';
