// src/app/layout.tsx

import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ChemFetch Client Hub',
  description: 'Chemical register dashboard for clients',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar />
            <div className="flex flex-col flex-1">
              <TopNav />
              <main className="p-4">{children}</main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
