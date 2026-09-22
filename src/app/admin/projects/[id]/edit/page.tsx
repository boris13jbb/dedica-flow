import { requireAuth, getOrCreateUserWorkspace } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { EditorClient } from './editor-client'
import type { Project, Scene } from '@/types'

interface EditorPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { id } = await params
  const user = await requireAuth()
  const workspace = await getOrCreateUserWorkspace(user.id, user.email || '')

  if (!workspace) {
    return <div>Error al cargar workspace</div>
  }

  const admin = createAdminClient()

  const { data: project } = (await admin
    .from('projects')
    .select('id, name, slug, status, draft_config, workspace_id')
    .eq('id', id)
    .eq('workspace_id', workspace.workspace_id)
    .single()) as { data: Project | null }

  if (!project) {
    notFound()
  }

  const { data: scenes } = (await admin
    .from('scenes')
    .select('*')
    .eq('project_id', id)
    .order('position', { ascending: true })) as { data: Scene[] | null }

  return <EditorClient project={project} initialScenes={scenes || []} />
}
