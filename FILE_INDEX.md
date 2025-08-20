# ChemFetch File Index

## Backend Files (`chemfetch-backend-claude/`)
```
server/
  routes/
    scan.ts              # Main barcode scanning logic
    [other routes]
  utils/
    scraper.ts          # Web scraping & SDS finding
    supabaseClient.ts   # Database connection
    validation.ts       # Input validation
    logger.ts          # Logging utilities
  index.ts             # Express server entry point

ocr_service/
  ocr_service.py       # OCR & SDS verification service
  parse_sds.py         # SDS parsing logic
  requirements.txt     # Python dependencies
```

## Frontend Files (`chemfetch-client-hub-claude/`)
```
src/
  app/
    page.tsx                    # Dashboard/home page
    login/page.tsx             # Authentication
    watchlist/page.tsx         # Chemical Register List (MAIN UI)
    sds/page.tsx              # SDS viewer
    api/                      # API route handlers
      update-sds/route.ts     # Update SDS data
      delete-item/route.ts    # Delete chemicals
  
  components/
    add-chemical-form.tsx     # Add new chemicals
    [ui components]
  
  lib/
    hooks/
      useWatchList.ts         # Main data fetching hook
    supabase-browser.ts       # Client-side DB
    supabase-server.ts        # Server-side DB
```

## Mobile Files (`chemfetch-mobile-claude/`)
```
src/
  screens/
    ScanScreen.tsx           # Barcode scanning
    ChemicalListScreen.tsx   # Chemical list view
    [other screens]
  
  components/
    [mobile components]
  
  services/
    api.ts                   # API communication
    camera.ts               # Camera functionality
```

## Configuration Files
```
Root/
  issues.txt              # Runtime logs & errors
  todo.txt               # Planned features
  SETUP_COMPLETE.md      # Setup status
  
Backend/
  .env                   # Environment variables
  package.json          # Node dependencies
  
Frontend/  
  .env                  # Environment variables
  next.config.ts        # Next.js configuration
  database.types.ts     # TypeScript database types
  
Mobile/
  package.json         # React Native dependencies
  app.json            # Expo configuration
```

## Database Schema (Supabase)
```
Tables:
  product                     # Core product data
  user_chemical_watch_list    # User's chemical register
  sds_metadata               # Parsed SDS information
  [auth tables]              # Supabase auth system
```
