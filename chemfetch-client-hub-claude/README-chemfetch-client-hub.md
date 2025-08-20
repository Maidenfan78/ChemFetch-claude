# ChemFetch Client Hub

**Client-facing dashboard** for businesses to manage their chemical registers, Safety Data Sheets (SDS), and compliance records.

This repo is part of the larger **ChemFetch** platform.

---

## 🔗 Related Repositories

| Repo                                                                                | Purpose                                                        |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| [`chemfetch-mobile`](https://github.com/YOUR_ORG/chemfetch-mobile)                  | Expo app for barcode scanning, OCR, and SDS capture            |
| [`chemfetch-client-hub`](.)                                                         | **(This repo)** Web dashboard for chemical register management |
| [`chemfetch-backend`](https://github.com/YOUR_ORG/chemfetch-backend)                | Node.js API server for OCR, scraping, and logic                |
| [`chemfetch-supabase`](https://github.com/YOUR_ORG/chemfetch-supabase)              | Supabase migrations and schema                                 |
| [`chemfetch-admin-hub`](https://github.com/YOUR_ORG/chemfetch-admin-hub) (optional) | Internal admin tools                                           |

---

## ✨ Features

- 🔐 Supabase Auth login (email/password)
- 📦 View and manage your company's chemical register
- 🔗 SDS URL integration with status indicators
- 📁 CSV export for compliance reporting
- 📍 Future: multi-location grouping and audit trail

---

## 🛠️ Tech Stack

- [Next.js 14](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Supabase](https://supabase.com/) (Auth + Postgres)
- TypeScript (App Router)

---

## 🧱 Project Structure

src/
app/ # Next.js App Router routes
components/ # Shared UI components
lib/ # Supabase client and utilities
types/ # Shared types (e.g. Supabase schema)
styles/ # Tailwind + global styles

---

## ⚙️ Setup Instructions

> Prerequisites: Node.js 18+, npm, Supabase project, Vercel (optional)

```bash
git clone https://github.com/YOUR_ORG/chemfetch-client-hub.git
cd chemfetch-client-hub
npm install
```

Create a `.env.local` file with your Supabase details:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Run the dev server:

```bash
npm run dev
```

🧪 Dev Tips
Run type checks:

```bash
npx tsc --noEmit
```

Deploy via Vercel for instant frontend hosting

Supabase schema is managed in the chemfetch-supabase repo

📜 License
MIT (or custom license if commercial)

🙋 Support
This is part of a private platform. For access, onboarding, or bug reports, please contact the project maintainer.

---
