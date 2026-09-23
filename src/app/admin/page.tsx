import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requireAuth, getOrCreateUserWorkspace } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { AdminShell } from '@/components/admin/admin-shell'
import { ProjectDashboard } from '@/components/dashboard/project-dashboard'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Project, ProjectStatus } from '@/types'

type ProjectListItem = Pick<Project, 'id' | 'name' | 'slug' | 'updated_at'> & {
  status: ProjectStatus
}

export default async function AdminDashboardPage() {
  const user = await requireAuth()
  const workspace = await getOrCreateUserWorkspace(user.id, user.email || '')

  if (!workspace) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-df-bg p-6 text-df-fg">
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
    .limit(50)) as { data: ProjectListItem[] | null }

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

  return (
    <AdminShell
      email={user.email}
      title="Tus experiencias"
      subtitle="Crea, gestiona y publica experiencias audiovisuales interactivas."
      actions={
        <Link
          href="/admin/projects/new"
          className={cn(buttonVariants({ variant: 'primary', size: 'md' }), 'hidden sm:inline-flex')}
        >
          <Plus className="size-4" />
          Nuevo proyecto
        </Link>
      }
    >
      <ProjectDashboard
        projects={projects ?? []}
        draftCount={draftCount || 0}
        publishedCount={publishedCount || 0}
        archivedCount={archivedCount || 0}
      />
    </AdminShell>
  )
}
