'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { appConfig } from '@/config'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
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
        const message =
          signInError.message.toLowerCase().includes('invalid')
            ? 'Correo o contraseña incorrectos.'
            : 'No se pudo iniciar sesión. Inténtalo de nuevo.'
        setError(message)
        setLoading(false)
        return
      }

      // remember: la sesión de Supabase ya persiste en localStorage por defecto;
      // el checkbox documenta la intención UX sin cambiar el contrato de Auth.
      void remember

      router.push('/admin')
      router.refresh()
    } catch {
      setError('Error al iniciar sesión. Comprueba tu conexión.')
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden df-atmosphere px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.1),transparent_45%)]" />

      <div className="relative w-full max-w-[420px] animate-df-slide-up">
        <div className="rounded-[var(--radius-2xl)] border border-df-border bg-df-card/90 p-6 shadow-[var(--shadow-elevated)] backdrop-blur-xl sm:p-8">
          <div className="mb-8 text-center">
            <div className="mb-5 flex justify-center">
              <Logo size="lg" showWordmark={false} />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-df-fg">
              DedicaFlow
            </h1>
            <p className="mt-2 text-sm text-df-muted">{appConfig.tagline}</p>
            <p className="mt-1 font-serif text-sm italic text-df-muted-fg">
              Historias que se viven.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                error={Boolean(error)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                error={Boolean(error)}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={loading}
                className="size-4 rounded border-df-border bg-df-surface text-df-primary focus:ring-df-primary"
              />
              <Label htmlFor="remember" className="font-normal text-df-muted">
                Recordarme
              </Label>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-[var(--radius-md)] border border-df-error/40 bg-df-error/10 px-3 py-2.5 text-sm text-red-300"
              >
                {error}
              </div>
            )}

            <Button type="submit" className="h-11 w-full" disabled={loading} loading={loading}>
              {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
