import Link from 'next/link'
import { LogoutButton } from './logout-button'

interface AdminShellProps {
  email?: string | null
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

export function AdminShell({
  email,
  children,
  title,
  subtitle,
  actions,
}: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#1c1917_0%,_#09090b_45%,_#000_100%)] text-zinc-50">
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/admin" className="group flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-sm font-bold text-zinc-950 shadow-[0_0_24px_rgba(251,191,36,0.35)]">
              D
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-semibold tracking-tight text-zinc-50 group-hover:text-amber-200">
                DedicaStudio
              </span>
              {email && (
                <span className="block truncate text-xs text-zinc-400">{email}</span>
              )}
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {actions}
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {(title || subtitle) && (
          <div className="mb-8 flex flex-col gap-2 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              {title && (
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-1 max-w-2xl text-sm text-zinc-400 sm:text-base">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  )
}
