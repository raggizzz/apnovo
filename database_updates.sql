-- Run this in your Supabase SQL Editor

ALTER TABLE items 
ADD COLUMN IF NOT EXISTS claim_code text,
ADD COLUMN IF NOT EXISTS claim_status text DEFAULT 'NONE', -- NONE, PENDING, RESOLVED
ADD COLUMN IF NOT EXISTS claimed_by_name text,
ADD COLUMN IF NOT EXISTS claimed_at timestamptz;

-- Create an index for faster lookup by claim code
CREATE INDEX IF NOT EXISTS idx_items_claim_code ON items(claim_code);
