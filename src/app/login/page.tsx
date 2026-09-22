'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createBrowserClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }

      router.push('/admin')
      router.refresh()
    } catch {
      setError('Error al iniciar sesión')
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,_#1c1917_0%,_#09090b_45%,_#000_100%)] px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(251,191,36,0.08),transparent_25%)]" />

      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl backdrop-blur sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-lg font-bold text-zinc-950 shadow-[0_0_30px_rgba(251,191,36,0.35)]">
            D
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">DedicaStudio</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Entra para crear y publicar experiencias audiovisuales
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-200">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="h-11 border-zinc-700 bg-zinc-900 text-zinc-50 placeholder:text-zinc-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-200">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="h-11 border-zinc-700 bg-zinc-900 text-zinc-50 placeholder:text-zinc-500"
            />
          </div>
          {error && (
            <div className="rounded-lg border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-300">
              {error}
            </div>
          )}
          <Button
            type="submit"
            className="h-11 w-full bg-amber-400 text-zinc-950 hover:bg-amber-300"
            disabled={loading}
          >
            {loading ? 'Entrando…' : 'Entrar al panel'}
          </Button>
        </form>
      </div>
    </div>
  )
}
