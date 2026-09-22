'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { AppSidebar } from './app-sidebar'
import { AppHeader } from './app-header'
import type { BreadcrumbItem } from './breadcrumbs'

interface AppShellProps {
  email?: string | null
  children: React.ReactNode
  title?: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: React.ReactNode
  hidePageHeading?: boolean
  className?: string
  contentClassName?: string
  fullWidth?: boolean
}

/**
 * Shell SaaS: sidebar + header + contenido. Responsive con drawer en móvil.
 */
function AppShell({
  email,
  children,
  title,
  subtitle,
  breadcrumbs,
  actions,
  hidePageHeading,
  className,
  contentClassName,
  fullWidth,
}: AppShellProps) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  React.useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [mobileOpen])

  return (
    <div className={cn('relative flex min-h-screen bg-df-bg text-df-fg', className)}>
      <div className="pointer-events-none absolute inset-0 df-atmosphere" aria-hidden />

      <AppSidebar
        email={email}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
      />

      <div className="relative z-[1] flex min-w-0 flex-1 flex-col">
        <AppHeader
          breadcrumbs={breadcrumbs}
          actions={actions}
          onMenuClick={() => setMobileOpen(true)}
        />

        <main
          className={cn(
            'flex-1 overflow-y-auto df-scrollbar',
            fullWidth ? 'p-0' : 'px-4 py-6 sm:px-6 sm:py-8',
            contentClassName
          )}
        >
          <div className={cn(!fullWidth && 'mx-auto w-full max-w-6xl')}>
            {!hidePageHeading && (title || subtitle) && (
              <div className="mb-6 sm:mb-8">
                {title && (
                  <h1 className="text-2xl font-semibold tracking-tight text-df-fg sm:text-3xl">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="mt-1.5 max-w-2xl text-sm text-df-muted sm:text-base">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export { AppShell }
export type { AppShellProps }
