# Duplicate Chemical Register Check Implementation

## Problems Fixed

### Problem 1: Duplicate Items in User's Watchlist
Previously, when scanning an existing barcode that was already in the user's chemical register list:
- The system would continue with web scraping and processing (wasting time and resources)
- The `created_at` date would be updated on the watchlist entry
- No notification was given to the user that the item was already in their list

### Problem 2: Re-scraping Products Already in Database
Previously, when scanning a barcode that was in the database but NOT in the user's watchlist:
- The system would perform unnecessary web scraping
- It would search for SDS files again
- This wasted time and resources when the data already existed

## Solution Implemented

### 1. Backend Changes (`chemfetch-backend-claude/server/routes/scan.ts`)
- Modified the `/scan` endpoint to accept an optional `userId` parameter
- Added TWO-STAGE checking:
  1. **First**: Check if item is in user's watchlist → Return with `alreadyInWatchlist: true`
  2. **Second**: Check if item is in product database → Return with `existingInDatabase: true`
  3. **Only if neither**: Perform web scraping and SDS search
- Returns appropriate flags and data based on where the product was found

### 2. Mobile App Changes

#### `barcode.tsx`
- Added import for `supabase` and `Alert` from React Native
- Modified barcode scanning handler to:
  - Get the current user's session and ID
  - Pass the `userId` to the backend `/scan` endpoint
  - Handle THREE different cases:
    1. `alreadyInWatchlist`: Show alert, item already in user's register
    2. `existingInDatabase`: Skip to confirm screen with pre-filled data (no OCR needed)
    3. New product: Continue with normal OCR flow
  - Different vibration patterns for different outcomes

#### `confirm.tsx`
- Added duplicate check before inserting into watchlist
- Prevents duplicate entries even if user manually confirms a product

### 3. Web Client Changes (`add-chemical-form.tsx`)
- Added duplicate check when manually adding chemicals
- Gets current user ID before processing
- Checks if product already exists in user's watchlist
- Shows confirmation dialog with the date the item was originally added
- Allows user to either cancel or update the existing entry

## Behavior Flow

### When Scanning a Barcode (Mobile):
1. User scans barcode
2. App sends barcode + userId to backend
3. Backend checks in order:
   a. **Already in user's watchlist?** → Return with `alreadyInWatchlist` flag
   b. **Already in product database?** → Return with `existingInDatabase` flag + product data
   c. **New product?** → Perform web scraping and SDS search

4. Mobile app responds accordingly:
   - **Case A**: Shows "Already in register" alert, resets scanner
   - **Case B**: Goes directly to confirm screen with pre-filled data (skips OCR)
   - **Case C**: Proceeds with normal OCR flow for new products

5. Result:
   - No unnecessary web scraping for existing products
   - No duplicate entries in watchlist
   - Faster experience for known products

### When Adding Manually (Web):
1. User enters product name
2. System checks if product exists
3. If exists, checks if already in user's watchlist
4. Shows confirmation dialog if duplicate
5. User can choose to update or cancel

## Benefits
- ✅ Saves processing time by avoiding unnecessary web scraping
- ✅ Preserves original `created_at` dates in watchlist
- ✅ Provides clear user feedback about duplicates
- ✅ Prevents duplicate entries in the chemical register
- ✅ Better user experience with immediate feedback
- ✅ Reduces backend load and API calls

## Testing Recommendations
1. Test scanning an item that's already in the watchlist
2. Test scanning a new item (should work as before)
3. Test manually adding a duplicate item via web interface
4. Verify that the original `created_at` date is preserved for existing items
5. Test with both authenticated and unauthenticated users (mobile app)

## Database Considerations

### Current Schema
Based on the `database.types.ts` file, the `user_chemical_watch_list` table currently doesn't show a unique constraint on `(user_id, product_id)`. This means duplicates could potentially be inserted at the database level.

### Required Database Migration
Run the migration script `chemfetch-supabase-claude/supabase/migrations/5_add_unique_constraint_watchlist.sql` to:
1. Remove any existing duplicates (keeping the oldest entry)
2. Add a unique constraint to prevent future duplicates
3. Add an index for better query performance

```sql
-- This migration will:
-- 1. Clean up any existing duplicates
-- 2. Add unique constraint: user_chemical_watch_list_user_product_unique
-- 3. Add performance index: idx_user_chemical_watch_list_user_product
```

### Running the Migration
In Supabase:
1. Go to the SQL Editor
2. Copy the contents of `add_unique_constraint.sql`
3. Run the migration
4. Verify the constraint was added successfully

This ensures data integrity at the database level, preventing duplicate entries even if the application logic fails.

## Future Enhancements

1. **Bulk Import Check**: When implementing bulk import of chemicals, include duplicate checking
2. **Merge Duplicates**: Add a feature to merge duplicate products that have different IDs but same barcode
3. **History Tracking**: Consider adding a history table to track when items were added/removed from watchlist
4. **Notification Options**: Allow users to choose whether they want to be notified about duplicates or silently skip them
5. **Quick Update**: Add a quick update button in the duplicate alert to directly edit the existing entry