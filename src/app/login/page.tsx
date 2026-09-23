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

      void remember

      router.push('/admin')
      router.refresh()
    } catch {
      setError('Error al iniciar sesión. Comprueba tu conexión.')
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-df-fg">
      <div className="pointer-events-none absolute inset-0 df-atmosphere" aria-hidden />

      <div className="relative z-[1] grid min-h-screen lg:grid-cols-[minmax(320px,440px)_1fr]">
        <section className="flex flex-col justify-center border-r border-df-border/80 bg-black/55 px-6 py-10 backdrop-blur-md sm:px-10">
          <div className="mx-auto w-full max-w-[360px] animate-df-slide-up">
            <Logo size="md" />
            <p className="mt-3 text-sm text-df-muted">
              Crea experiencias que dejan huella.
            </p>

            <h1 className="mt-8 text-2xl font-semibold tracking-tight text-df-fg">
              DedicaFlow
            </h1>
            <p className="mt-1 text-sm text-df-muted-fg">{appConfig.tagline}</p>

            <form onSubmit={handleLogin} className="mt-8 space-y-4" noValidate>
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
                  className="size-4 rounded border-df-border bg-df-surface accent-df-primary text-df-primary focus:ring-2 focus:ring-df-primary"
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

              <Button type="submit" className="h-11 w-full rounded-full" disabled={loading} loading={loading}>
                {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
              </Button>
            </form>
          </div>
        </section>

        <aside className="relative hidden min-h-screen lg:block" aria-hidden>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(212,175,55,0.14),transparent_42%)]" />
          <div className="absolute inset-x-16 bottom-16 max-w-md">
            <p className="font-serif text-3xl italic leading-snug text-df-fg/90">
              Historias que se viven.
            </p>
            <p className="mt-3 text-sm text-df-muted">
              Convierte emociones en experiencias inolvidables.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
