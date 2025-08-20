# ChemFetch – Multi-Platform Chemical Safety System

ChemFetch is a comprehensive chemical management platform that combines mobile barcode scanning, automated SDS parsing, and web-based compliance management. The system helps businesses track chemicals, manage safety data sheets, and maintain regulatory compliance.

---
Vision & Problem

Workplaces must maintain an accessible, up‑to‑date register of hazardous chemicals with a current SDS for each product. Australian WHS regulation mandates SDS review at least every **five years** and requires the review date to be visible (typically in Section 16). Paper binders and spreadsheets quickly fall out‑of‑date, risking non‑compliance and worker confusion.

## 🔗 Repository Structure

| Repository | Purpose | Tech Stack |
|-----------|---------|------------|
| [**chemfetch-mobile-claude**](#chemfetch-mobile) | Mobile app for barcode scanning & OCR | Expo + React Native |
| [**chemfetch-client-hub-claude**](#chemfetch-client-hub) | Web dashboard for chemical management | Next.js + Supabase |
| [**chemfetch-backend-claude**](#chemfetch-backend) | API server & scraping engine | Node.js + Express |
| [**chemfetch-supabase-claude**](#chemfetch-supabase) | Database schema & migrations | Supabase + PostgreSQL |

---

## 🎯 System Overview

### Core Workflow
1. **📱 Mobile Scanning**: Workers scan barcodes using the mobile app
2. **🔍 Product Discovery**: System searches for product information via web scraping
3. **📄 SDS Detection**: Automatically finds and associates Safety Data Sheets
4. **🤖 Document Parsing**: AI-powered extraction of safety information from PDFs
5. **📊 Compliance Dashboard**: Web interface for managing chemical registers and compliance

### Key Features
- **Barcode Recognition**: EAN-8, EAN-13, and other standard formats
- **OCR Processing**: Extract text from product labels using PaddleOCR
- **Intelligent Web Scraping**: Australian-focused product discovery
- **Automated SDS Parsing**: Extract hazard information, classifications, and metadata
- **Multi-user Support**: Role-based access with user isolation
- **Compliance Ready**: Generate reports for regulatory requirements

---

## 🚀 chemfetch-mobile

> **Expo + React Native** app for field workers and safety personnel

### Features
- **Barcode Scanning**: Fast, accurate scanning with live preview
- **OCR Text Extraction**: Capture product names and details from labels
- **SDS Verification**: Confirm Safety Data Sheet associations
- **Offline Capability**: Queue actions for sync when connection available
- **User Authentication**: Secure login with role-based permissions

### Tech Stack
- React Native 0.79 + Expo 53
- NativeWind (Tailwind CSS for React Native)
- Zustand for state management
- Expo Camera & Barcode Scanner
- Supabase client SDK

### Quick Start
```bash
cd chemfetch-mobile-claude
npm install
npx expo start
```

---

## 🌐 chemfetch-client-hub

> **Next.js** web dashboard for chemical register management

### Features
- **Chemical Registry**: View, edit, and organize company chemical inventory
- **SDS Management**: Access safety data sheets with parsed metadata display
- **Hazard Assessment**: Risk ratings and classification information
- **Compliance Reports**: Export data for regulatory submissions
- **Multi-location Support**: Organize chemicals by site/department
- **Vendor Tracking**: Monitor chemical suppliers and issue dates

### Tech Stack
- Next.js 15 with App Router
- React 19 + TypeScript
- Tailwind CSS + shadcn/ui components
- Supabase for authentication and data
- Server-side rendering for performance

### Quick Start
```bash
cd chemfetch-client-hub-claude
npm install
npm run dev
```

---

## ⚙️ chemfetch-backend

> **Node.js + Express** API server with integrated Python OCR service

### Core Endpoints
- **POST /scan**: Barcode lookup with web scraping fallback
- **POST /confirm**: Save OCR-confirmed product data
- **POST /sds-by-name**: Find Safety Data Sheet URLs
- **POST /parse-sds**: Extract metadata from SDS PDFs
- **POST /verify-sds**: Validate SDS document relevance
- **POST /ocr**: Process images for text extraction

### Tech Stack
- Node.js 18+ with Express 5
- TypeScript + ESM modules
- Puppeteer for web scraping
- Python microservice (Flask + PaddleOCR)
- Supabase service role integration
- Rate limiting and request validation

### Python OCR Service
- **PaddleOCR**: GPU-accelerated text recognition
- **PDF Processing**: Extract text from Safety Data Sheets
- **Image Processing**: Enhance image quality for better OCR
- **Flask API**: RESTful endpoints for OCR operations

### Quick Start
```bash
# Start Python OCR service
cd chemfetch-backend-claude/ocr_service
python ocr_service.py

# Start Node.js API server
cd chemfetch-backend-claude
npm start
```

---

## 🗄️ chemfetch-supabase

> **PostgreSQL** schema with Supabase integration

### Database Schema

#### Core Tables
- **`product`**: Master catalog of chemical products
- **`user_chemical_watch_list`**: Per-user chemical inventory with safety data
- **`sds_metadata`**: Parsed Safety Data Sheet information

#### Key Features
- **Row Level Security**: Users can only access their organization's data
- **Foreign Key Constraints**: Maintain data integrity across tables
- **Indexed Queries**: Optimized for common lookup patterns
- **Timestamped Records**: Full audit trail of changes

### Quick Start
```bash
cd chemfetch-supabase-claude
supabase db push
supabase gen types typescript --local > database.types.ts
```

---

## 📋 Current Database Schema

### Products Table
```sql
CREATE TABLE product (
  id SERIAL PRIMARY KEY,
  barcode TEXT NOT NULL UNIQUE,
  name TEXT,
  manufacturer TEXT,
  contents_size_weight TEXT,
  sds_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);
```

### Chemical Watch List
```sql
CREATE TABLE user_chemical_watch_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES product(id) ON DELETE CASCADE,
  quantity_on_hand INTEGER,
  location TEXT,
  sds_available BOOLEAN,
  sds_issue_date DATE,
  hazardous_substance BOOLEAN,
  dangerous_good BOOLEAN,
  dangerous_goods_class TEXT,
  description TEXT,
  packing_group TEXT,
  subsidiary_risks TEXT,
  consequence TEXT,
  likelihood TEXT,
  risk_rating TEXT,
  swp_required BOOLEAN,
  comments_swp TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);
```

### SDS Metadata
```sql
CREATE TABLE sds_metadata (
  product_id INTEGER PRIMARY KEY REFERENCES product(id) ON DELETE CASCADE,
  vendor TEXT,
  issue_date DATE,
  hazardous_substance BOOLEAN,
  dangerous_good BOOLEAN,
  dangerous_goods_class TEXT,
  description TEXT,
  packing_group TEXT,
  subsidiary_risks TEXT,
  raw_json JSONB,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);
```

---

## 🧹 Code Quality & Linting

This monorepo includes comprehensive linting and formatting configurations for all projects:

### Features
- **ESLint**: Code quality checks with project-specific rules
- **Prettier**: Consistent code formatting across all projects
- **TypeScript**: Strict type checking for better code quality
- **Pre-commit Hooks**: Automatic linting before commits
- **GitHub Actions**: Continuous integration with quality checks

### Quick Start
```bash
# Install all dependencies and set up linting
npm run setup

# Check all projects for linting issues
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format all code with Prettier
npm run format

# Run TypeScript type checking
npm run type-check
```

### Project-Specific Linting
Each project has its own linting configuration:

- **Mobile App**: React Native/Expo ESLint config with NativeWind support
- **Client Hub**: Next.js ESLint config with TypeScript strict mode
- **Backend**: Node.js ESLint config with modern JavaScript rules

### VSCode Integration
The workspace includes VSCode settings for:
- Auto-formatting on save
- ESLint auto-fix on save
- Recommended extensions
- Multi-project support

See [LINTING.md](./LINTING.md) for detailed documentation.

---

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- Python 3.9+
- Supabase account
- Expo CLI (for mobile development)

### Environment Variables

**Backend (.env)**
```env
PORT=3000
SB_URL=https://your-project.supabase.co
SB_SERVICE_KEY=your-service-role-key
OCR_SERVICE_URL=http://localhost:5001
```

**Client Hub (.env.local)**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

**Mobile (.env)**
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_BACKEND_API_URL=http://localhost:3000
```

### Local Development
```bash
# 1. Start Supabase (if running locally)
cd chemfetch-supabase-claude
supabase start

# 2. Start Python OCR service
cd chemfetch-backend-claude/ocr_service
pip install -r requirements.txt
python ocr_service.py

# 3. Start Node.js backend
cd chemfetch-backend-claude
npm install
npm start

# 4. Start web client
cd chemfetch-client-hub-claude
npm install
npm run dev

# 5. Start mobile app
cd chemfetch-mobile-claude
npm install
npx expo start
```

---

## 🚀 Deployment

### Recommended Infrastructure

| Component | Platform | Notes |
|-----------|----------|-------|
| Database | Supabase Cloud | Managed PostgreSQL with auth |
| Backend API | Railway/Render | Auto-scaling Node.js hosting |
| Python OCR | Fly.io | GPU support for PaddleOCR |
| Web Client | Vercel | Edge deployment with Next.js |
| Mobile App | EAS Build | Native app distribution |

### Production Checklist
- [ ] Configure environment variables for all services
- [ ] Set up database migrations in production
- [ ] Configure CORS for API endpoints
- [ ] Set up SSL certificates
- [ ] Configure rate limiting and security headers
- [ ] Set up monitoring and error tracking
- [ ] Create backup strategy for database

---

## 🔒 Security Features

- **Row Level Security**: Database-level user isolation
- **JWT Authentication**: Secure token-based auth via Supabase
- **API Rate Limiting**: Prevent abuse of scraping endpoints
- **Input Validation**: Zod schemas for request validation
- **CORS Configuration**: Restrict cross-origin requests
- **Service Role Keys**: Separate permissions for backend operations

---

## 📊 Performance Optimizations

### Recent Improvements
- **Faster SDS Verification**: Reduced processing time from 6+ minutes to ~30 seconds
- **Stream Processing**: Handle large PDF files without memory issues
- **Intelligent Caching**: Avoid duplicate web scraping requests
- **Australian-focused Scraping**: Improved product discovery accuracy
- **Race Condition Fixes**: Eliminated server crashes from timeout conflicts

### Monitoring
- Response time tracking for all API endpoints
- PDF processing success rates
- OCR accuracy metrics
- User session analytics

---

## 🧪 Testing

```bash
# Backend tests
cd chemfetch-backend-claude
npm test

# Client hub tests
cd chemfetch-client-hub-claude
npm run test

# Mobile app tests
cd chemfetch-mobile-claude
npm run test
```

---

## 📖 API Documentation

### Core Endpoints

#### Barcode Scanning
```http
POST /scan
Content-Type: application/json

{
  "code": "044600069913"
}
```

#### SDS Parsing
```http
POST /parse-sds
Content-Type: application/json

{
  "product_id": 123,
  "sds_url": "https://example.com/sds.pdf",
  "force": false
}
```

#### OCR Processing
```http
POST /ocr
Content-Type: multipart/form-data

image: [file]
left: 100
top: 100
width: 200
height: 150
```

---

## 🔄 Recent Updates

### Version 2024.12
- ✅ **SDS Auto-parsing**: Automatic extraction of safety metadata from PDFs
- ✅ **Vendor Tracking**: Added vendor information to chemical records
- ✅ **Performance Fixes**: Resolved timeout and race condition issues
- ✅ **Enhanced UI**: Improved client dashboard with better data display
- ✅ **Australian Focus**: Optimized product discovery for Australian market

### Bug Fixes
- Fixed race conditions in SDS parsing endpoints
- Improved PDF verification performance with size limits
- Resolved client-side data fetching for SDS metadata
- Enhanced error handling for timeout scenarios

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 👥 Support

For technical support, deployment assistance, or feature requests:
- Create an issue in the relevant repository
- Contact the development team
- Check the documentation in each service's README

---

## 🗺️ Roadmap

### Upcoming Features
- **Batch Processing**: Bulk import of chemical inventories
- **Advanced Reporting**: Custom compliance report generation
- **Mobile Offline Mode**: Full offline capability with sync
- **API Integrations**: Connect with existing ERP systems
- **Advanced Analytics**: Chemical usage patterns and insights
- **Multi-language Support**: Localization for different regions