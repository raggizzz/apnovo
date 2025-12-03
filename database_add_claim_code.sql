-- ============================================
-- ADD CLAIM CODE MIGRATION
-- ============================================

-- Add 'claim_code' column to 'items' table
ALTER TABLE items ADD COLUMN IF NOT EXISTS claim_code TEXT;

-- Add 'claim_status' column to 'items' table with default 'NONE'
-- Values: 'NONE', 'PENDING', 'APPROVED', 'REJECTED'
ALTER TABLE items ADD COLUMN IF NOT EXISTS claim_status TEXT DEFAULT 'NONE';
