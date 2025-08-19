# chemfetch-client-hub To Do

This document tracks what has been implemented and what remains to be built for the **chemfetch-client-hub** Next.js dashboard.

---

## ✅ Completed

- **Repository setup**
  - Initialized Next.js 14 app with TypeScript and `src` directory
  - Configured import alias `@/*`
- **Styling**
  - Installed Tailwind CSS, PostCSS, Autoprefixer
  - Tailwind config (`tailwind.config.ts`) and global CSS (`globals.css`) in place
  - Dark/light mode via `next-themes` and CSS variables
- **Design System (shadcn/ui)**
  - Installed `shadcn` CLI and initialized base theme tokens
  - Added `button`, `card`, and necessary components
- **Supabase Integration**
  - `src/lib/supabase-browser.ts`: Client-side Supabase helper
  - `src/lib/supabase-server.ts`: Server-side Supabase helper with `cookies()`
  - `src/types/supabase.ts`: Basic typed schema for `user_chemical_watch_list`
- **Layout & Navigation**
  - `src/app/layout.tsx`: Root layout with `<ThemeProvider>`, sidebar, and top nav
  - `src/components/sidebar.tsx`: Sidebar with Dashboard, SDS Register, and Logout
  - `src/components/top-nav.tsx`: Header with title, user avatar, and theme toggle
  - `src/components/theme-toggle.tsx`: Dark/light mode toggle button
- **Authentication UI**
  - `src/app/login/page.tsx`: Login form (email/password) with Supabase Auth
  - `src/app/register/page.tsx`: Registration form with Supabase Auth
  - Logout hook wired in sidebar
- **Route Protection**
  - Guarded **`app/page.tsx`** and **`app/sds/page.tsx`** via `supabaseServer()` + `redirect` if no session
  - Ensures only authenticated users can access dashboard and SDS pages

---

## 🚧 In Progress / Remaining

### 1. Core Features

- **Dashboard Page (`app/page.tsx`)**
  - [ ] Display user info (e.g., `session.user.email`)
  - [ ] Fetch & list chemical watch list items
  - [ ] Add links to SDS viewer
- **SDS Register Page (`app/sds/page.tsx`)**
  - [ ] UI: Table or list of scanned products
  - [ ] Fetch `user_chemical_watch_list` records
  - [ ] Integrate SDS PDF viewer or external link
  - [ ] CSV export button for compliance reporting

### 2. Sidebar & Responsive UI

- **Mobile Drawer**
  - [ ] Implement responsive sidebar using shadcn’s `Sheet` or `Dialog`
  - [ ] Slide-in/out navigation for small screens

### 3. Advanced Auth & UX

- **Session Persistence**
  - [ ] Show user avatar & name in top-nav
  - [ ] Handle expired sessions gracefully (refresh token UI)
- **Route Guards**
  - [ ] Redirect unauthorized API requests in `app/api`
  - [ ] Add placeholder `404` or `Not Found` pages

### 4. Data & Backend Integration

- **Supabase Schema**
  - [ ] Finalize fields on `product` and `user_chemical_watch_list`
  - [ ] Add RLS policies for multi-tenancy (per `auth.uid`)
- **Backend Endpoints**
  - [ ] Wire frontend to `chemfetch-backend` APIs (`/scan`, `/sds-by-name`)
  - [ ] Add fallback scraping for missing SDS URLs

### 5. Testing & Quality

- **Unit & Integration Tests**
  - [ ] Jest tests for React components
  - [ ] E2E tests for auth and page flows
- **Type Safety**
  - [ ] Expand `types/supabase.ts` to cover full schema
  - [ ] Add Zod schemas for form validation

### 6. Deployment & DevOps

- **Environment & Secrets**
  - [ ] Configure `.env.production` for Vercel
  - [ ] Add Supabase service role key as secret for SSR use
- **CI/CD**
  - [ ] GitHub Actions for linting, type checks, and tests on PRs
  - [ ] Automatic deployment to Vercel on `main` branch

---

_Keep this list updated as you progress through development._

