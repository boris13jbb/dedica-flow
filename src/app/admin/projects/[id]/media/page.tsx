import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { requireAuth, getOrCreateUserWorkspace } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { AdminShell } from '@/components/admin/admin-shell'
import { ProjectWorkspaceNav } from '@/components/admin/project-workspace-nav'
import { getProjectAssets } from './actions'
import { MediaPageClient } from './media-page-client'
import type { Json } from '@/types'

export default async function MediaPage({
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
    .select('id, name, slug, workspace_id, draft_config')
    .eq('id', id)
    .eq('workspace_id', workspace.workspace_id)
    .single()) as {
    data: {
      id: string
      name: string
      slug: string
      workspace_id: string
      draft_config: Json
    } | null
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-zinc-400">
        Proyecto no encontrado
      </div>
    )
  }

  const assets = await getProjectAssets(id)
  const draftAudio =
    project.draft_config &&
    typeof project.draft_config === 'object' &&
    !Array.isArray(project.draft_config) &&
    'audio' in project.draft_config &&
    project.draft_config.audio &&
    typeof project.draft_config.audio === 'object'
      ? (project.draft_config.audio as {
          assetId?: string
          volume?: number
          loop?: boolean
          fadeIn?: number
          fadeOut?: number
        })
      : null

  return (
    <AdminShell
      email={user.email}
      title={project.name}
      subtitle="Paso 2 · Inserta el audio y gestiona imágenes o videos"
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

      <MediaPageClient
        projectId={id}
        assets={assets}
        initialAudio={draftAudio}
      />
    </AdminShell>
  )
}
