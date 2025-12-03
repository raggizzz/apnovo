-- Add event_name column to items table
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS event_name TEXT;

-- Create index for faster filtering by event
CREATE INDEX IF NOT EXISTS idx_items_event_name ON items(event_name);
