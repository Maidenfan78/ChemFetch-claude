-- Migration: Add unique constraint to prevent duplicate products in user's watchlist
-- File: 5_add_unique_constraint_watchlist.sql
-- Purpose: Ensure each user can only have one entry per product in their chemical watch list
--------------------------------------------------------------------------------

-- Step 1: Identify and report any existing duplicates
DO $$
DECLARE
    duplicate_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT user_id, product_id, COUNT(*) as cnt
        FROM user_chemical_watch_list
        WHERE user_id IS NOT NULL 
          AND product_id IS NOT NULL
        GROUP BY user_id, product_id
        HAVING COUNT(*) > 1
    ) AS duplicates;
    
    IF duplicate_count > 0 THEN
        RAISE NOTICE 'Found % duplicate product entries that will be cleaned up', duplicate_count;
    END IF;
END $$;

-- Step 2: Remove duplicates, keeping the OLDEST entry (preserving original created_at)
-- This respects the user's original addition date
DELETE FROM user_chemical_watch_list a
USING user_chemical_watch_list b
WHERE a.created_at > b.created_at  -- Delete newer entries
  AND a.user_id = b.user_id 
  AND a.product_id = b.product_id
  AND a.user_id IS NOT NULL
  AND a.product_id IS NOT NULL;

-- Alternative: If you want to keep the entry with the most complete data instead:
-- DELETE FROM user_chemical_watch_list a
-- USING user_chemical_watch_list b
-- WHERE a.id != b.id
--   AND a.user_id = b.user_id 
--   AND a.product_id = b.product_id
--   AND a.user_id IS NOT NULL
--   AND a.product_id IS NOT NULL
--   AND (
--     -- Keep b if it has more complete data
--     (b.quantity_on_hand IS NOT NULL AND a.quantity_on_hand IS NULL) OR
--     (b.location IS NOT NULL AND a.location IS NULL) OR
--     (b.comments_swp IS NOT NULL AND a.comments_swp IS NULL) OR
--     -- Or if data completeness is equal, keep the older one
--     (a.created_at > b.created_at)
--   );

-- Step 3: Add the unique constraint
-- This prevents future duplicates at the database level
ALTER TABLE user_chemical_watch_list 
ADD CONSTRAINT user_chemical_watch_list_user_product_unique 
UNIQUE (user_id, product_id);

-- Step 4: Add an index for better query performance
-- This helps with the duplicate checking queries in the application
CREATE INDEX IF NOT EXISTS idx_user_chemical_watch_list_user_product 
ON user_chemical_watch_list(user_id, product_id) 
WHERE user_id IS NOT NULL AND product_id IS NOT NULL;

-- Step 5: Add documentation
COMMENT ON CONSTRAINT user_chemical_watch_list_user_product_unique 
ON user_chemical_watch_list 
IS 'Ensures each user can only have one entry per product in their chemical watch list. Added to prevent duplicate entries when scanning barcodes.';

-- Step 6: Verify the constraint was added successfully
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_chemical_watch_list_user_product_unique'
    ) THEN
        RAISE NOTICE 'SUCCESS: Unique constraint added successfully';
    ELSE
        RAISE EXCEPTION 'ERROR: Failed to add unique constraint';
    END IF;
END $$;

--------------------------------------------------------------------------------
-- Rollback script (in case you need to undo this migration)
--------------------------------------------------------------------------------
-- ALTER TABLE user_chemical_watch_list 
-- DROP CONSTRAINT IF EXISTS user_chemical_watch_list_user_product_unique;
--
-- DROP INDEX IF EXISTS idx_user_chemical_watch_list_user_product;
--------------------------------------------------------------------------------
