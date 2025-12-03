-- ============================================
-- ANONYMOUS REPORTING MIGRATION
-- ============================================

-- 1. Make owner_id nullable in items table
ALTER TABLE items ALTER COLUMN owner_id DROP NOT NULL;

-- 2. Update RLS Policy for Inserting Items
-- Drop the existing policy that requires auth
DROP POLICY IF EXISTS "Users can create items" ON items;

-- Create a new policy that allows anyone (anon or authenticated) to insert
CREATE POLICY "Anyone can create items" ON items FOR INSERT WITH CHECK (TRUE);

-- 3. Update RLS Policy for Updating Items (Optional but good for safety)
-- Ensure only the creator (if logged in) or admins can update
-- Note: Anonymous users won't be able to update their items after creation unless we implement a claim code system later.
-- The existing policy "Users can update own items" checks for owner_id match, which is fine.

-- 4. Update RLS Policy for Item Photos (if used)
DROP POLICY IF EXISTS "Users can add photos to own items" ON item_photos;
CREATE POLICY "Anyone can add photos" ON item_photos FOR INSERT WITH CHECK (TRUE);
