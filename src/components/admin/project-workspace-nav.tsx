'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Clapperboard, Music, Rocket } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  {
    key: 'edit',
    label: 'Escenas',
    description: 'Orden y contenido',
    href: (id: string) => `/admin/projects/${id}/edit`,
    match: '/edit',
    icon: Clapperboard,
  },
  {
    key: 'media',
    label: 'Audio y medios',
    description: 'Música e imágenes',
    href: (id: string) => `/admin/projects/${id}/media`,
    match: '/media',
    icon: Music,
  },
  {
    key: 'publish',
    label: 'Publicar',
    description: 'Compartir enlace',
    href: (id: string) => `/admin/projects/${id}/publish`,
    match: '/publish',
    icon: Rocket,
  },
] as const

interface ProjectWorkspaceNavProps {
  projectId: string
  className?: string
  /** Compact horizontal tabs (editor toolbar) */
  variant?: 'cards' | 'tabs'
}

/**
 * Navegación por pasos del proyecto: Escenas → Audio → Publicar.
 */
export function ProjectWorkspaceNav({
  projectId,
  className = '',
  variant = 'cards',
}: ProjectWorkspaceNavProps) {
  const pathname = usePathname()

  const tabsNav = (
    <nav
      aria-label="Pasos del proyecto"
      className={cn(
        'flex flex-wrap gap-1 rounded-[var(--radius-lg)] border border-df-border bg-df-surface p-1',
        className
      )}
    >
      {STEPS.map((step) => {
        const active = pathname.includes(step.match)
        const Icon = step.icon
        return (
          <Link
            key={step.key}
            href={step.href(projectId)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-xs font-medium transition-colors',
              active
                ? 'bg-df-primary/12 text-df-primary-light'
                : 'text-df-muted hover:text-df-fg'
            )}
          >
            <Icon className="size-3.5" />
            {step.label}
          </Link>
        )
      })}
    </nav>
  )

  if (variant === 'tabs') {
    return tabsNav
  }

  return (
    <>
    <div className="md:hidden">{tabsNav}</div>
    <nav
      aria-label="Pasos del proyecto"
      className={cn('hidden gap-2 md:grid md:grid-cols-3', className)}
    >
      {STEPS.map((step, index) => {
        const active = pathname.includes(step.match)
        const Icon = step.icon
        return (
          <Link
            key={step.key}
            href={step.href(projectId)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group flex items-center gap-3 rounded-[var(--radius-xl)] border px-3 py-3 transition-colors',
              active
                ? 'border-df-primary/50 bg-df-primary/10'
                : 'border-df-border bg-df-surface/50 hover:border-df-border-hover hover:bg-df-card'
            )}
          >
            <span
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)]',
                active
                  ? 'bg-df-primary text-df-primary-fg'
                  : 'bg-df-card text-df-muted group-hover:text-df-fg'
              )}
            >
              <Icon className="size-5" />
            </span>
            <span className="min-w-0 text-left">
              <span
                className={cn(
                  'block text-sm font-semibold',
                  active ? 'text-df-primary-light' : 'text-df-fg'
                )}
              >
                {index + 1}. {step.label}
              </span>
              <span className="block truncate text-xs text-df-muted-fg">
                {step.description}
              </span>
            </span>
          </Link>
        )
      })}
    </nav>
    </>
  )
}
