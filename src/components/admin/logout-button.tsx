'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      const supabase = createBrowserClient()
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800 hover:text-zinc-50 disabled:opacity-50"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">{loading ? 'Saliendo…' : 'Salir'}</span>
    </button>
  )
}
