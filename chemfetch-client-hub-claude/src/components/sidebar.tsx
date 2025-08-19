// src/components/sidebar.tsx

'use client'

import Link from 'next/link'
import { Home, FileText, LogOut, Eye } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export function Sidebar() {
  const router = useRouter()
  const supabase = supabaseBrowser()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-64 hidden md:flex flex-col border-r bg-gray-100 dark:bg-gray-900 p-4">
      <div className="text-xl font-bold mb-6">ChemFetch</div>
      <nav className="space-y-2 flex-1">
        <Link href="/" className="flex items-center gap-2 hover:text-blue-600">
          <Home size={20} /> Dashboard
        </Link>
        <Link href="/sds" className="flex items-center gap-2 hover:text-blue-600">
          <FileText size={20} /> SDS Register
        </Link>
        <Link href="/watchlist" className="flex items-center gap-2 hover:text-blue-600">
          <Eye size={20} /> Chemical Register List
        </Link>
      </nav>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 hover:text-blue-600 mt-4"
      >
        <LogOut size={20} /> Logout
      </button>
    </aside>
  )
}
