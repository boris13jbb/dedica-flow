import Link from 'next/link'
import {
  Archive,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Music,
  Pencil,
  Plus,
  Rocket,
  Sparkles,
} from 'lucide-react'
import { requireAuth, getOrCreateUserWorkspace } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { AdminShell } from '@/components/admin/admin-shell'
import type { Project } from '@/types'

type ProjectListItem = Pick<Project, 'id' | 'name' | 'slug' | 'status' | 'updated_at'>

function formatRelativeDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin fecha'

  const diffMs = Date.now() - date.getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `Hace ${minutes} min`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Hace ${hours} h`

  const days = Math.floor(hours / 24)
  if (days < 7) return `Hace ${days} d`

  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function statusMeta(status: ProjectListItem['status']) {
  if (status === 'published') {
    return {
      label: 'Publicado',
      className: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30',
    }
  }
  if (status === 'archived') {
    return {
      label: 'Archivado',
      className: 'bg-zinc-500/15 text-zinc-300 ring-1 ring-zinc-500/30',
    }
  }
  return {
    label: 'Borrador',
    className: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30',
  }
}

export default async function AdminDashboardPage() {
  const user = await requireAuth()
  const workspace = await getOrCreateUserWorkspace(user.id, user.email || '')

  if (!workspace) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-zinc-50">
        Error al cargar workspace. Recarga la página o vuelve a iniciar sesión.
      </div>
    )
  }

  const supabase = createAdminClient()

  const { data: projects } = (await supabase
    .from('projects')
    .select('id, name, slug, status, updated_at')
    .eq('workspace_id', workspace.workspace_id)
    .order('updated_at', { ascending: false })
    .limit(20)) as { data: ProjectListItem[] | null }

  const { count: draftCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspace.workspace_id)
    .eq('status', 'draft')

  const { count: publishedCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspace.workspace_id)
    .eq('status', 'published')

  const { count: archivedCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspace.workspace_id)
    .eq('status', 'archived')

  const stats = [
    {
      label: 'Borradores',
      value: draftCount || 0,
      hint: 'En edición',
      icon: FileText,
      accent: 'text-amber-300',
      bg: 'bg-amber-400/10',
    },
    {
      label: 'Publicados',
      value: publishedCount || 0,
      hint: 'Listos para compartir',
      icon: CheckCircle2,
      accent: 'text-emerald-300',
      bg: 'bg-emerald-400/10',
    },
    {
      label: 'Archivados',
      value: archivedCount || 0,
      hint: 'Guardados',
      icon: Archive,
      accent: 'text-zinc-300',
      bg: 'bg-zinc-400/10',
    },
  ]

  return (
    <AdminShell
      email={user.email}
      title="Tus experiencias"
      subtitle="Crea, edita y publica experiencias audiovisuales en pocos pasos."
      actions={
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300"
        >
          <Plus className="h-4 w-4" />
          Nuevo proyecto
        </Link>
      }
    >
      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-zinc-800/90 bg-zinc-900/60 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-zinc-400">{stat.label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">{stat.hint}</p>
                </div>
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg} ${stat.accent}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            </div>
          )
        })}
      </section>

      <section className="overflow-hidden rounded-2xl border border-zinc-800/90 bg-zinc-900/50">
        <div className="flex flex-col gap-3 border-b border-zinc-800 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-zinc-50">Proyectos recientes</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Abre un proyecto para editar escenas, medios o publicarlo.
            </p>
          </div>
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 self-start rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800"
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            Empezar desde plantilla
          </Link>
        </div>

        {!projects || projects.length === 0 ? (
          <div className="px-5 py-16 text-center sm:px-6">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-300">
              <Rocket className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-zinc-50">Crea tu primera experiencia</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
              Elige una plantilla, personaliza las escenas y publícala con un enlace listo para
              compartir.
            </p>
            <Link
              href="/admin/projects/new"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300"
            >
              <Plus className="h-4 w-4" />
              Crear proyecto
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-800/80">
            {projects.map((project) => {
              const status = statusMeta(project.status)
              return (
                <li key={project.id} className="px-5 py-4 transition hover:bg-zinc-800/35 sm:px-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-medium text-zinc-50">
                          {project.name || 'Sin nombre'}
                        </h3>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm text-zinc-400">
                        /p/{project.slug}
                        <span className="mx-2 text-zinc-600">·</span>
                        Actualizado {formatRelativeDate(project.updated_at)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/projects/${project.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-950 transition hover:bg-white"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        1. Escenas
                      </Link>
                      <Link
                        href={`/admin/projects/${project.id}/media#audio-experiencia`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-400/10 px-3 py-2 text-sm font-medium text-amber-100 transition hover:bg-amber-400/15"
                      >
                        <Music className="h-3.5 w-3.5" />
                        2. Audio
                      </Link>
                      <Link
                        href={`/admin/projects/${project.id}/publish`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800"
                      >
                        <Rocket className="h-3.5 w-3.5" />
                        3. Publicar
                      </Link>
                      {project.status === 'published' && (
                        <Link
                          href={`/p/${project.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-700/50 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300 transition hover:bg-emerald-500/20"
                        >
                          Ver
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-dashed border-zinc-700/80 bg-zinc-900/30 p-5 sm:p-6">
        <h3 className="text-sm font-medium text-zinc-200">Flujo recomendado</h3>
        <ol className="mt-3 grid gap-3 text-sm text-zinc-400 sm:grid-cols-3">
          <li className="rounded-xl bg-zinc-950/50 p-3 ring-1 ring-zinc-800">
            <span className="font-medium text-amber-300">1.</span> Edita las escenas
          </li>
          <li className="rounded-xl bg-zinc-950/50 p-3 ring-1 ring-zinc-800">
            <span className="font-medium text-amber-300">2.</span> Inserta el audio y los medios
          </li>
          <li className="rounded-xl bg-zinc-950/50 p-3 ring-1 ring-zinc-800">
            <span className="font-medium text-amber-300">3.</span> Publica y comparte /p/...
          </li>
        </ol>
      </section>
    </AdminShell>
  )
}
