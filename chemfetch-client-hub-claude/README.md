# 🌐 ChemFetch Client Hub

**Next.js web dashboard** for businesses to manage chemical registers, Safety Data Sheets (SDS), and regulatory compliance. Part of the ChemFetch chemical management platform.

This client-facing application provides a comprehensive interface for chemical safety officers, facility managers, and compliance teams to oversee their organization's chemical inventory and safety documentation.

---

## ✨ Features

### Chemical Register Management

- **📦 Inventory Tracking**: View and manage chemical products across multiple locations
- **📄 SDS Integration**: Access Safety Data Sheets with parsed metadata display
- **⚠️ Hazard Assessment**: Risk classifications, dangerous goods information, and safety ratings
- **📊 Compliance Reporting**: Export data for regulatory submissions and audits
- **🏢 Multi-location Support**: Organize chemicals by site, department, or storage area
- **👥 User Management**: Role-based access control for different team members

### SDS Management

- **🤖 Automated Parsing**: Display vendor, hazard class, issue dates from parsed SDS documents
- **🔗 Document Links**: Direct access to PDF Safety Data Sheets
- **⏱️ Issue Date Tracking**: Monitor SDS currency and expiration
- **🏷️ Vendor Information**: Track chemical suppliers and manufacturers
- **📋 Classification Data**: Hazardous substance and dangerous goods classifications
- **🔄 Update Triggers**: Manual SDS re-parsing and metadata refresh

---

## 🛠️ Tech Stack

### Frontend Framework

- **Next.js 15** with App Router for modern React development
- **React 19** with TypeScript for type safety
- **Server-Side Rendering** for improved performance and SEO

### UI & Styling

- **Tailwind CSS 4** for utility-first styling
- **shadcn/ui** components for consistent design system
- **Lucide React** for modern iconography
- **Next Themes** for dark/light mode support
- **Responsive Design** optimized for desktop and tablet use

### Backend Integration

- **Supabase** for authentication, database, and real-time updates
- **Row Level Security** for multi-tenant data isolation
- **Server-Side Auth** with cookie-based sessions
- **API Routes** for backend integration and data processing

---

## ⚙️ Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase project with authentication enabled
- ChemFetch backend service running

### 1. Environment Setup

Create `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Development Server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) to view the application.

---

## 🎯 Core Pages & Features

### Dashboard (`/`)

- **Overview Cards**: Total chemicals, pending SDS updates, compliance status
- **Recent Activity**: Latest chemical additions and SDS updates
- **Quick Actions**: Add new chemicals, trigger SDS parsing, export reports

### Chemical Register (`/watchlist`)

- **Data Table**: Comprehensive view of all chemicals with sorting and filtering
- **Columns**: Product name, vendor, issue date, hazard classification, dangerous goods info
- **Actions**: Update SDS, edit details, remove from inventory

### SDS Viewer (`/sds`)

- **Document Links**: Direct access to PDF Safety Data Sheets
- **Metadata Display**: Parsed information including vendor, hazard class, issue dates
- **Status Indicators**: Document availability and parsing status

### Authentication (`/login`, `/register`)

- **Secure Login**: Email/password authentication via Supabase Auth
- **User Registration**: Account creation with email verification
- **Session Management**: Persistent login with secure cookie sessions

---

## 🔧 Configuration

### Data Structure

```typescript
interface WatchListItem {
  id: number;
  product: {
    id: string;
    name: string;
    sds_url: string | null;
    sds_metadata: {
      vendor: string | null;
      issue_date: string | null;
      hazardous_substance: boolean | null;
      dangerous_good: boolean | null;
      dangerous_goods_class: string | null;
      packing_group: string | null;
      subsidiary_risks: string | null;
      description: string | null;
    } | null;
  };
}
```

### Custom Hook Implementation

```typescript
// lib/hooks/useWatchList.ts
export function useWatchList() {
  const [data, setData] = useState<WatchListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWatchList = async () => {
      // Fetch watchlist with product info
      const { data: watchListData } = await supabase
        .from('user_chemical_watch_list')
        .select('id, product_id, product:product_id(id, name, sds_url)')
        .order('created_at', { ascending: false });

      // Fetch SDS metadata separately
      const productIds = watchListData.map(item => item.product_id);
      const { data: sdsMetadata } = await supabase
        .from('sds_metadata')
        .select('product_id, vendor, issue_date, hazardous_substance, dangerous_good')
        .in('product_id', productIds);

      // Combine data
      const combinedData = watchListData.map(item => ({
        id: item.id,
        product: {
          ...item.product,
          sds_metadata: sdsMetadata.find(meta => meta.product_id === item.product_id) || null,
        },
      }));

      setData(combinedData);
      setLoading(false);
    };

    fetchWatchList();
  }, []);

  return { data, loading, error };
}
```

---

## 🚀 Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_BACKEND_URL
```

### Production Environment Variables

```env
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com
```

---

## 🔄 Recent Updates

### Version 2024.12

**New Features:**

- ✅ **Enhanced SDS Display**: Show vendor information and parsed metadata
- ✅ **Improved Data Fetching**: Separate queries for better performance
- ✅ **Date Formatting**: Human-readable issue dates instead of ISO strings
- ✅ **Better Error Handling**: Graceful fallbacks for missing SDS data

**UI Improvements:**

- 🎨 **Responsive Tables**: Better mobile and tablet support
- 🎨 **Status Indicators**: Visual cues for SDS status and hazard levels
- 🎨 **Loading States**: Improved feedback during SDS parsing
- 🎨 **Dark Mode**: Full dark theme support

**Bug Fixes:**

- 🔧 **SDS Metadata Display**: Fixed missing vendor and date information
- 🔧 **Authentication Flow**: Improved login redirect handling
- 🔧 **Table Sorting**: Fixed column sorting with null values

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 👥 Support

**Technical Issues:**

- Check browser console for error messages
- Verify Supabase connection and permissions
- Test backend API connectivity

**Feature Requests:**

- Submit detailed requirements and use cases
- Include mockups or wireframes if applicable
- Consider impact on existing functionality

---

## 🗺️ Roadmap

### Q1 2025

- **Advanced Filtering**: Multi-column search and filter combinations
- **Bulk Operations**: Mass import/export and batch editing
- **Reporting Dashboard**: Advanced analytics and compliance reports
- **Mobile Optimization**: Improved responsive design for mobile devices

### Q2 2025

- **User Roles**: Admin, manager, and viewer permission levels
- **Audit Trail**: Detailed change history and user activity logs
- **API Integration**: Connect with external ERP and safety systems
- **Notifications**: Email alerts for SDS expiry and compliance deadlines
