import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { requireAuth, getOrCreateUserWorkspace } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { AdminShell } from '@/components/admin/admin-shell'
import { ProjectWorkspaceNav } from '@/components/admin/project-workspace-nav'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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
      <div className="flex min-h-screen items-center justify-center bg-df-bg p-6 text-df-muted">
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
      <div className="flex min-h-screen items-center justify-center bg-df-bg p-6 text-df-muted">
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
      title="Audio y medios"
      subtitle="Configura la música de la experiencia y gestiona tu biblioteca."
      breadcrumbs={[
        { label: 'Experiencias', href: '/admin' },
        { label: project.name, href: `/admin/projects/${id}/edit` },
        { label: 'Medios' },
      ]}
      actions={
        <Link
          href={`/admin/projects/${id}/edit`}
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
        >
          <ArrowLeft className="size-4" />
          Editor
        </Link>
      }
    >
      <div className="mb-8 space-y-3">
        <p className="text-xs text-df-muted-fg">/p/{project.slug}</p>
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
