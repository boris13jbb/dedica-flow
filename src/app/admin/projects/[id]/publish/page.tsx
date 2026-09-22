import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { requireAuth, getOrCreateUserWorkspace } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { AdminShell } from '@/components/admin/admin-shell'
import { ProjectWorkspaceNav } from '@/components/admin/project-workspace-nav'
import { PublishPanel } from '@/components/publish'
import { getAppUrl } from '@/lib/app-url'

export default async function PublishPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await requireAuth()
  const workspace = await getOrCreateUserWorkspace(user.id, user.email || '')

  if (!workspace) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-zinc-400">
        Error al obtener workspace
      </div>
    )
  }

  const admin = createAdminClient()

  const { data: project } = (await admin
    .from('projects')
    .select('id, name, slug, status')
    .eq('id', id)
    .eq('workspace_id', workspace.workspace_id)
    .single()) as {
    data: {
      id: string
      name: string
      slug: string
      status: string
    } | null
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-zinc-400">
        Proyecto no encontrado
      </div>
    )
  }

  const { count: enabledScenes } = await admin
    .from('scenes')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', id)
    .eq('enabled', true)

  return (
    <AdminShell
      email={user.email}
      title={project.name}
      subtitle="Paso 3 · Publica y comparte el enlace de la experiencia"
      actions={
        <Link
          href={`/admin/projects/${id}/edit`}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-zinc-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al editor
        </Link>
      }
    >
      <div className="mb-8 space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Flujo del proyecto · /p/{project.slug}
        </p>
        <ProjectWorkspaceNav projectId={id} />
      </div>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-emerald-300/80">
          Apartado de publicación
        </p>
        <h2 className="mb-6 text-xl font-semibold text-zinc-50">
          Estado y enlace público
        </h2>
        <PublishPanel
          projectId={id}
          projectSlug={project.slug.trim()}
          projectStatus={project.status}
          publicBaseUrl={getAppUrl()}
          enabledScenes={enabledScenes ?? 0}
        />
      </section>
    </AdminShell>
  )
}
