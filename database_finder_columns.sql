-- Add finder columns to items table
ALTER TABLE items
ADD COLUMN finder_name TEXT,
ADD COLUMN finder_ra TEXT;

-- Add index for potential gamification queries
CREATE INDEX idx_items_finder_ra ON items(finder_ra);
