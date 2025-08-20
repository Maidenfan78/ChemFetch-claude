# ChemFetch Agent Quick Reference

## Project Architecture
```
chemfetch-claude/
├── chemfetch-backend-claude/     # Node.js/Express API + OCR service
├── chemfetch-client-hub-claude/  # Next.js web dashboard  
├── chemfetch-mobile-claude/      # React Native mobile app
└── chemfetch-supabase-claude/    # Database schema/migrations
```

## Quick File Lookup by Task Type

### UI/Frontend Changes
- **Pages**: `chemfetch-client-hub-claude/src/app/*/page.tsx`
- **Components**: `chemfetch-client-hub-claude/src/components/`
- **Hooks/Data**: `chemfetch-client-hub-claude/src/lib/hooks/`
- **Types**: `chemfetch-client-hub-claude/database.types.ts`

### Backend/API Changes  
- **Routes**: `chemfetch-backend-claude/server/routes/`
- **Business Logic**: `chemfetch-backend-claude/server/utils/`
- **Main Server**: `chemfetch-backend-claude/server/index.ts`

### OCR/SDS Processing
- **OCR Service**: `chemfetch-backend-claude/ocr_service/ocr_service.py`
- **SDS Parser**: `chemfetch-backend-claude/ocr_service/parse_sds.py`
- **Scraper Logic**: `chemfetch-backend-claude/server/utils/scraper.ts`

### Mobile App
- **Screens**: `chemfetch-mobile-claude/src/screens/`
- **Components**: `chemfetch-mobile-claude/src/components/`
- **Services**: `chemfetch-mobile-claude/src/services/`

## Key Pages & Their Functions

### Web Client (`chemfetch-client-hub-claude`)
- `/` → Dashboard (redirects to login if not authenticated)
- `/login` → Authentication  
- `/watchlist` → **Chemical Register List** (main CRUD interface)
- `/sds` → SDS viewer/manager

### API Endpoints (`chemfetch-backend-claude`)
- `POST /scan` → Barcode scanning & product lookup
- `POST /sds-by-name` → Find SDS by product name
- `POST /confirm` → Confirm scanned product
- `POST /ocr` → OCR text extraction (port 5001)
- `POST /verify-sds` → Verify PDF is valid SDS (port 5001)

## Common Patterns

### Adding Refresh Functionality
1. Check if component uses `useWatchList` hook
2. The hook provides `refresh()` function
3. Add button that calls `refresh()` with loading state

### SDS Verification Issues
1. Check `ocr_service/ocr_service.py` → `verify_pdf_sds()`
2. Keywords are in comprehensive list (SDS, MSDS, etc.)
3. Requires 2+ keyword matches (no product name matching)

### Database Schema
- `product` → Core product info (name, barcode, sds_url)
- `user_chemical_watch_list` → User's chemical register entries
- `sds_metadata` → Parsed SDS data (hazard info, classifications)

## Debugging Resources
- **Runtime Logs**: `issues.txt` (server output, errors)
- **Todo Items**: `todo.txt` 
- **Setup Status**: `SETUP_COMPLETE.md`

## Quick Decision Tree

**UI Change?** → `chemfetch-client-hub-claude/src/app/`
**API Issue?** → `chemfetch-backend-claude/server/routes/`
**SDS Not Found?** → `chemfetch-backend-claude/ocr_service/ocr_service.py`
**Scanning Issue?** → `chemfetch-backend-claude/server/utils/scraper.ts`
**Mobile Issue?** → `chemfetch-mobile-claude/src/`

## Most Frequently Modified Files
1. `chemfetch-client-hub-claude/src/app/watchlist/page.tsx` (main UI)
2. `chemfetch-backend-claude/ocr_service/ocr_service.py` (SDS verification)
3. `chemfetch-backend-claude/server/utils/scraper.ts` (web scraping)
4. `chemfetch-client-hub-claude/src/lib/hooks/useWatchList.ts` (data fetching)
