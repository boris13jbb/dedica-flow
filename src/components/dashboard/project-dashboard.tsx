'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowUpRight,
  MoreHorizontal,
  Music,
  Pencil,
  Plus,
  Rocket,
  Search,
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { formatRelativeDate } from '@/lib/format'
import type { ProjectStatus } from '@/types'

export type DashboardProject = {
  id: string
  name: string
  slug: string
  status: ProjectStatus
  updated_at: string
}

type FilterKey = 'all' | ProjectStatus

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'draft', label: 'Borradores' },
  { key: 'published', label: 'Publicados' },
  { key: 'archived', label: 'Archivados' },
]

/** Evita mismatch de hidratación: Date.now() difiere entre SSR y cliente. */
function RelativeUpdatedAt({ value }: { value: string }) {
  return (
    <span suppressHydrationWarning>
      Actualizado {formatRelativeDate(value)}
    </span>
  )
}

interface ProjectDashboardProps {
  projects: DashboardProject[]
  draftCount: number
  publishedCount: number
  archivedCount: number
}

function CompactStat({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-semibold tracking-tight text-df-fg">{value}</span>
      <span className="text-sm text-df-muted">{label}</span>
    </div>
  )
}

function ProjectRowActions({ project }: { project: DashboardProject }) {
  const router = useRouter()

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/admin/projects/${project.id}/edit`}
        className={buttonVariants({ variant: 'ghost', size: 'sm' })}
      >
        <Pencil className="size-3.5" />
        Escenas
      </Link>

      <div className="hidden items-center gap-1 sm:flex">
        <Link
          href={`/admin/projects/${project.id}/media#audio-experiencia`}
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
        >
          <Music className="size-3.5" />
          Audio
        </Link>
        <Link
          href={`/admin/projects/${project.id}/publish`}
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
        >
          <Rocket className="size-3.5" />
          Publicar
        </Link>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({ variant: 'outline', size: 'icon-sm' }),
            'hidden lg:inline-flex'
          )}
          aria-label="Más acciones"
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/admin/projects/${project.id}/edit`)}>
            <Pencil className="size-3.5" />
            Escenas
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              router.push(`/admin/projects/${project.id}/media#audio-experiencia`)
            }
          >
            <Music className="size-3.5" />
            Audio y medios
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/admin/projects/${project.id}/publish`)}
          >
            <Rocket className="size-3.5" />
            Publicar
          </DropdownMenuItem>
          {project.status === 'published' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  window.open(`/p/${project.slug}`, '_blank', 'noopener,noreferrer')
                }
              >
                <ArrowUpRight className="size-3.5" />
                Ver experiencia
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }), 'sm:hidden')}
          aria-label="Más acciones"
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() =>
              router.push(`/admin/projects/${project.id}/media#audio-experiencia`)
            }
          >
            <Music className="size-3.5" />
            Audio y medios
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/admin/projects/${project.id}/publish`)}
          >
            <Rocket className="size-3.5" />
            Publicar
          </DropdownMenuItem>
          {project.status === 'published' && (
            <DropdownMenuItem
              onClick={() =>
                window.open(`/p/${project.slug}`, '_blank', 'noopener,noreferrer')
              }
            >
              <ArrowUpRight className="size-3.5" />
              Ver
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {project.status === 'published' && (
        <Link
          href={`/p/${project.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'hidden sm:inline-flex'
          )}
        >
          Ver
          <ArrowUpRight className="size-3.5" />
        </Link>
      )}
    </div>
  )
}

export function ProjectDashboard({
  projects,
  draftCount,
  publishedCount,
  archivedCount,
}: ProjectDashboardProps) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return projects.filter((project) => {
      if (filter !== 'all' && project.status !== filter) return false
      if (!q) return true
      return (
        project.name.toLowerCase().includes(q) ||
        project.slug.toLowerCase().includes(q)
      )
    })
  }, [projects, query, filter])

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4 border-b border-df-border pb-5">
        <div className="flex flex-wrap gap-8">
          <CompactStat label="en edición" value={draftCount} />
          <CompactStat label="publicados" value={publishedCount} />
          <CompactStat label="archivados" value={archivedCount} />
        </div>
      </section>

      <section className="overflow-hidden rounded-[var(--radius-xl)] border border-df-border bg-df-card/80">
        <div className="flex flex-col gap-4 border-b border-df-border px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-df-muted-fg" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar experiencias…"
                className="pl-9"
                aria-label="Buscar experiencias"
              />
            </div>
            <div
              role="tablist"
              aria-label="Filtrar por estado"
              className="flex flex-wrap gap-1 rounded-[var(--radius-lg)] border border-df-border bg-df-surface p-1"
            >
              {FILTERS.map((item) => {
                const active = filter === item.key
                return (
                  <button
                    key={item.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setFilter(item.key)}
                    className={cn(
                      'rounded-[var(--radius-md)] px-2.5 py-1.5 text-xs font-medium transition-colors',
                      active
                        ? 'bg-df-primary/12 text-df-primary-light'
                        : 'text-df-muted hover:text-df-fg'
                    )}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="p-5 sm:p-6">
            <EmptyState
              icon={<Rocket className="size-5" />}
              title="Crea tu primera experiencia"
              description="Elige una plantilla, personaliza las escenas y publícala con un enlace listo para compartir."
              action={{ label: 'Crear proyecto', href: '/admin/projects/new' }}
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-12 text-center sm:px-6">
            <p className="text-sm text-df-muted">
              No hay proyectos que coincidan con tu búsqueda.
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => {
                setQuery('')
                setFilter('all')
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-df-border">
            {filtered.map((project) => (
              <li
                key={project.id}
                className="px-5 py-4 transition-colors hover:bg-df-card-hover/50 sm:px-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/projects/${project.id}/edit`}
                        className="truncate text-base font-medium text-df-fg transition-colors hover:text-df-primary-light"
                      >
                        {project.name || 'Sin nombre'}
                      </Link>
                      <StatusBadge status={project.status} />
                    </div>
                    <p className="mt-1 truncate text-sm text-df-muted">
                      /p/{project.slug}
                      <span className="mx-2 text-df-muted-fg">·</span>
                      <RelativeUpdatedAt value={project.updated_at} />
                    </p>
                  </div>

                  <ProjectRowActions project={project} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-xs text-df-muted-fg">
        Escenas → Audio → Publicar. Así se construye cada experiencia.
      </p>

      <Link
        href="/admin/projects/new"
        className={cn(
          buttonVariants({ variant: 'primary', size: 'icon' }),
          'fixed bottom-5 right-5 z-40 size-14 rounded-full shadow-[var(--shadow-glow)] lg:hidden'
        )}
        aria-label="Nuevo proyecto"
      >
        <Plus className="size-6" />
      </Link>
    </div>
  )
}
