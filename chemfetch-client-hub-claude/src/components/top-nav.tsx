// src/components/top-nav.tsx

'use client';

import { ThemeToggle } from '@/components/theme-toggle';

export function TopNav() {
  return (
    <header className="flex items-center justify-between px-4 py-2 border-b">
      <h1 className="text-lg font-semibold">Client Hub</h1>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <div className="w-8 h-8 bg-gray-300 rounded-full" />
      </div>
    </header>
  );
}
