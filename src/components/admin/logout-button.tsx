'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'

interface LogoutButtonProps {
  compact?: boolean
}

export function LogoutButton({ compact }: LogoutButtonProps) {
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

  const button = (
    <Button
      type="button"
      variant="outline"
      size={compact ? 'icon-sm' : 'sm'}
      onClick={handleLogout}
      loading={loading}
      aria-label="Cerrar sesión"
      className={compact ? undefined : 'w-full justify-start'}
    >
      <LogOut />
      {!compact && <span>{loading ? 'Saliendo…' : 'Cerrar sesión'}</span>}
    </Button>
  )

  if (compact) {
    return <Tooltip content="Cerrar sesión">{button}</Tooltip>
  }

  return button
}
