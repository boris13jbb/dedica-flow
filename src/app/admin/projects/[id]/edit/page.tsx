import { requireAuth, getOrCreateUserWorkspace } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
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

  const supabase = await createServerClient()

  // Load project
  const { data: project } = await supabase
    .from('projects')
    .select('id, name, slug, status, draft_config, workspace_id')
    .eq('id', id)
    .eq('workspace_id', workspace.workspace_id)
    .single() as { data: Project | null }

  if (!project) {
    notFound()
  }

  // Load scenes
  const { data: scenes } = await supabase
    .from('scenes')
    .select('*')
    .eq('project_id', id)
    .order('position', { ascending: true }) as { data: Scene[] | null }

  return <EditorClient project={project} initialScenes={scenes || []} />
}
