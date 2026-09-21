'use server'

import { requireAuth, getOrCreateUserWorkspace } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Scene, SceneInsert, Json } from '@/types'

export async function updateProjectScenes(projectId: string, scenes: Partial<Scene>[]) {
  const user = await requireAuth()
  const workspace = await getOrCreateUserWorkspace(user.id, user.email || '')

  if (!workspace) {
    throw new Error('No workspace found')
  }

  const supabase = await createServerClient()

  // Verify project ownership
  const { data: project } = await supabase
    .from('projects')
    .select('id, workspace_id')
    .eq('id', projectId)
    .eq('workspace_id', workspace.workspace_id)
    .single() as { data: { id: string; workspace_id: string } | null }

  if (!project) {
    throw new Error('Project not found or access denied')
  }

  // Update scenes
  const updates = scenes.map((scene) => {
    if (!scene.id) throw new Error('Scene ID is required')
    
    const updateData = {
      name: scene.name,
      position: scene.position,
      duration_ms: scene.duration_ms,
      trigger_mode: scene.trigger_mode,
      enabled: scene.enabled,
      config: scene.config,
      updated_at: new Date().toISOString(),
    }

    return supabase
      .from('scenes')
      // @ts-expect-error - Supabase types issue
      .update(updateData)
      .eq('id', scene.id)
      .eq('project_id', projectId)
  })

  await Promise.all(updates)

  revalidatePath(`/admin/projects/${projectId}/edit`)
  
  return { success: true }
}

export async function createScene(projectId: string, sceneData: Omit<SceneInsert, 'project_id'> & { config: Json }) {
  const user = await requireAuth()
  const workspace = await getOrCreateUserWorkspace(user.id, user.email || '')

  if (!workspace) {
    throw new Error('No workspace found')
  }

  const supabase = await createServerClient()

  // Verify project ownership
  const { data: project } = await supabase
    .from('projects')
    .select('id, workspace_id')
    .eq('id', projectId)
    .eq('workspace_id', workspace.workspace_id)
    .single() as { data: { id: string; workspace_id: string } | null }

  if (!project) {
    throw new Error('Project not found or access denied')
  }

  const insertData = {
    project_id: projectId,
    ...sceneData,
  }

  const { data: scene } = await supabase
    .from('scenes')
    // @ts-expect-error - Supabase types issue
    .insert(insertData)
    .select()
    .single()

  if (!scene) {
    throw new Error('Failed to create scene')
  }

  revalidatePath(`/admin/projects/${projectId}/edit`)
  
  return scene
}

export async function deleteScene(projectId: string, sceneId: string) {
  const user = await requireAuth()
  const workspace = await getOrCreateUserWorkspace(user.id, user.email || '')

  if (!workspace) {
    throw new Error('No workspace found')
  }

  const supabase = await createServerClient()

  // Verify project ownership
  const { data: project } = await supabase
    .from('projects')
    .select('id, workspace_id')
    .eq('id', projectId)
    .eq('workspace_id', workspace.workspace_id)
    .single() as { data: { id: string; workspace_id: string } | null }

  if (!project) {
    throw new Error('Project not found or access denied')
  }

  await supabase
    .from('scenes')
    .delete()
    .eq('id', sceneId)
    .eq('project_id', projectId)

  revalidatePath(`/admin/projects/${projectId}/edit`)
  
  return { success: true }
}
