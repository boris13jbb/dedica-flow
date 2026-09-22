'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Archive,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  MoreHorizontal,
  Music,
  Pencil,
  Plus,
  Rocket,
  Search,
  Sparkles,
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

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string
  value: number
  hint: string
  icon: React.ComponentType<{ className?: string }>
  accent: string
}) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-df-border bg-df-card p-5 transition-colors hover:border-df-border-hover">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-df-muted">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-df-fg">{value}</p>
          <p className="mt-1 text-xs text-df-muted-fg">{hint}</p>
        </div>
        <span
          className={cn(
            'flex size-10 items-center justify-center rounded-[var(--radius-lg)]',
            accent
          )}
        >
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  )
}

function ProjectRowActions({ project }: { project: DashboardProject }) {
  const router = useRouter()

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/admin/projects/${project.id}/edit`}
        className={buttonVariants({ variant: 'primary', size: 'sm' })}
      >
        <Pencil className="size-3.5" />
        Editar
      </Link>

      <div className="hidden items-center gap-1.5 sm:flex lg:hidden">
        <Link
          href={`/admin/projects/${project.id}/media#audio-experiencia`}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          <Music className="size-3.5" />
          Audio
        </Link>
        <Link
          href={`/admin/projects/${project.id}/publish`}
          className={buttonVariants({ variant: 'secondary', size: 'sm' })}
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
            buttonVariants({ variant: 'success', size: 'sm' }),
            'hidden sm:inline-flex lg:hidden'
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
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Borradores"
          value={draftCount}
          hint="En edición"
          icon={FileText}
          accent="bg-df-primary/10 text-df-primary-light"
        />
        <StatCard
          label="Publicados"
          value={publishedCount}
          hint="Listos para compartir"
          icon={CheckCircle2}
          accent="bg-df-success/10 text-df-success"
        />
        <StatCard
          label="Archivados"
          value={archivedCount}
          hint="Guardados"
          icon={Archive}
          accent="bg-df-surface text-df-muted"
        />
      </section>

      <section className="overflow-hidden rounded-[var(--radius-xl)] border border-df-border bg-df-card">
        <div className="flex flex-col gap-4 border-b border-df-border px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-df-fg">Proyectos</h2>
              <p className="mt-1 text-sm text-df-muted">
                Edita escenas, configura audio y publica tu experiencia.
              </p>
            </div>
            <Link
              href="/admin/projects/new"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'self-start'
              )}
            >
              <Sparkles className="size-3.5 text-df-primary" />
              Empezar desde plantilla
            </Link>
          </div>

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
                        ? 'bg-df-card text-df-fg shadow-sm'
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

      <section className="rounded-[var(--radius-xl)] border border-dashed border-df-border bg-df-surface/30 p-5 sm:p-6">
        <h3 className="text-sm font-medium text-df-fg">Flujo recomendado</h3>
        <ol className="mt-3 grid gap-3 text-sm text-df-muted sm:grid-cols-3">
          <li className="rounded-[var(--radius-lg)] bg-df-bg/50 p-3 ring-1 ring-df-border">
            <span className="font-medium text-df-primary">1.</span> Edita las escenas
          </li>
          <li className="rounded-[var(--radius-lg)] bg-df-bg/50 p-3 ring-1 ring-df-border">
            <span className="font-medium text-df-primary">2.</span> Inserta el audio y los medios
          </li>
          <li className="rounded-[var(--radius-lg)] bg-df-bg/50 p-3 ring-1 ring-df-border">
            <span className="font-medium text-df-primary">3.</span> Publica y comparte /p/...
          </li>
        </ol>
      </section>

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
