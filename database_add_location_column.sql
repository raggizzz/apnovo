-- ============================================
-- ADD LOCATION COLUMN MIGRATION
-- ============================================

-- Add 'location' column to 'items' table if it doesn't exist
ALTER TABLE items ADD COLUMN IF NOT EXISTS location TEXT;

-- Optional: Update RLS if needed (usually ADD COLUMN doesn't require RLS changes for existing policies unless they explicitly list columns)
-- The existing "Anyone can create items" policy (CHECK (TRUE)) should cover this new column.
