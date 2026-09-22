'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Clapperboard, Music, Rocket } from 'lucide-react'

const STEPS = [
  {
    key: 'edit',
    label: '1. Escenas',
    description: 'Orden y contenido',
    href: (id: string) => `/admin/projects/${id}/edit`,
    match: '/edit',
    icon: Clapperboard,
  },
  {
    key: 'media',
    label: '2. Audio y medios',
    description: 'Música e imágenes',
    href: (id: string) => `/admin/projects/${id}/media`,
    match: '/media',
    icon: Music,
  },
  {
    key: 'publish',
    label: '3. Publicar',
    description: 'Compartir enlace',
    href: (id: string) => `/admin/projects/${id}/publish`,
    match: '/publish',
    icon: Rocket,
  },
] as const

interface ProjectWorkspaceNavProps {
  projectId: string
  className?: string
}

/**
 * Navegación por pasos del proyecto: deja claro cada apartado funcional.
 */
export function ProjectWorkspaceNav({
  projectId,
  className = '',
}: ProjectWorkspaceNavProps) {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Pasos del proyecto"
      className={`grid gap-2 sm:grid-cols-3 ${className}`}
    >
      {STEPS.map((step) => {
        const active = pathname.includes(step.match)
        const Icon = step.icon
        return (
          <Link
            key={step.key}
            href={step.href(projectId)}
            className={[
              'group flex items-center gap-3 rounded-xl border px-3 py-3 transition',
              active
                ? 'border-amber-400/50 bg-amber-400/10 shadow-[0_0_0_1px_rgba(251,191,36,0.15)]'
                : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900',
            ].join(' ')}
          >
            <span
              className={[
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                active
                  ? 'bg-amber-400 text-zinc-950'
                  : 'bg-zinc-800 text-zinc-300 group-hover:text-zinc-50',
              ].join(' ')}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 text-left">
              <span
                className={[
                  'block text-sm font-semibold',
                  active ? 'text-amber-100' : 'text-zinc-100',
                ].join(' ')}
              >
                {step.label}
              </span>
              <span className="block truncate text-xs text-zinc-500">
                {step.description}
              </span>
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
