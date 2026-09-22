import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { requireAuth, getOrCreateUserWorkspace } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { AdminShell } from '@/components/admin/admin-shell'
import { ProjectWorkspaceNav } from '@/components/admin/project-workspace-nav'
import { PublishPanel } from '@/components/publish'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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
      <div className="flex min-h-screen items-center justify-center bg-df-bg p-6 text-df-muted">
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
      <div className="flex min-h-screen items-center justify-center bg-df-bg p-6 text-df-muted">
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
      title="Publicar experiencia"
      subtitle="Comparte el enlace público y gestiona versiones."
      breadcrumbs={[
        { label: 'Experiencias', href: '/admin' },
        { label: project.name, href: `/admin/projects/${id}/edit` },
        { label: 'Publicar' },
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

      <PublishPanel
        projectId={id}
        projectSlug={project.slug.trim()}
        projectStatus={project.status}
        publicBaseUrl={getAppUrl()}
        enabledScenes={enabledScenes ?? 0}
      />
    </AdminShell>
  )
}
