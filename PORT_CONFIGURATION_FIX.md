# ChemFetch Port Configuration Fix

## The Problem
The system was misconfigured with port conflicts:
- Next.js client was running on port 3000
- Backend API was also trying to run on port 3000
- Mobile app was connecting to port 3000 expecting the backend API
- **Mobile app .env file was hardcoding the backend URL to port 3000**
- This caused requests to fail as the mobile app was hitting the Next.js client instead of the backend

## The Solution
Fixed port assignments to avoid conflicts:

### Service Port Assignments
| Service | Port | Description |
|---------|------|-------------|
| Next.js Client (Web) | 3000 | Web dashboard interface |
| Backend API (Express) | 3001 | Main API server |
| OCR Service (Python) | 5001 | OCR processing service |

## Files Updated
1. **Backend Configuration**
   - `chemfetch-backend-claude/.env` - Changed PORT from 3000 to 3001
   - `chemfetch-backend-claude/server/index.ts` - Changed default port from 3000 to 3001

2. **Mobile App Configuration**
   - `chemfetch-mobile-claude/lib/constants.ts` - Changed BACKEND_API_URL from port 3000 to 3001
   - **`chemfetch-mobile-claude/.env` - Changed EXPO_PUBLIC_BACKEND_API_URL from port 3000 to 3001** ⚠️ IMPORTANT

## How to Apply the Fix

### 1. Stop all running services (Ctrl+C in each terminal)

### 2. IMPORTANT: Clear Expo cache and restart mobile app
```bash
cd chemfetch-mobile-claude
# Clear cache and restart
npx expo start -c
```

### 3. Start Backend API (Port 3001)
```bash
cd chemfetch-backend-claude
npx tsx server/index.ts
# Should see: "Backend API listening on port 3001"
```

### 4. Start OCR Service (Port 5001)
```bash
cd chemfetch-backend-claude/ocr_service
python ocr_service.py
# Should see: "Running on http://127.0.0.1:5001"
```

### 5. Start Web Client (Port 3000)
```bash
cd chemfetch-client-hub-claude
npm run dev
# Should see: "Local: http://localhost:3000"
```

## Testing the Fix
1. **Restart all services** in the order above
2. **Test mobile scanning**:
   - Scan a barcode - should connect to backend on port 3001
   - OCR should work without body size errors
3. **Check logs** to confirm:
   - Backend shows requests coming in on port 3001
   - No more "404" or "Body exceeded 1 MB limit" errors
   - Mobile app successfully calls backend endpoints

## Additional Notes
- The OCR service proxies through the backend, so mobile app only needs to know about port 3001
- Make sure to restart ALL services after these changes
- If you see "port already in use" errors, kill the existing processes first

## Environment Variables
If you're using environment variables to override ports, make sure they're set correctly:
- `PORT=3001` for backend
- `EXPO_PUBLIC_BACKEND_API_URL=http://[YOUR_IP]:3001` for mobile app (optional)
