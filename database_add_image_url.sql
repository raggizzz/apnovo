-- ============================================
-- ADD IMAGE URL COLUMN MIGRATION
-- ============================================

-- Add 'image_url' column to 'items' table for storing uploaded images
ALTER TABLE items ADD COLUMN IF NOT EXISTS image_url TEXT;
