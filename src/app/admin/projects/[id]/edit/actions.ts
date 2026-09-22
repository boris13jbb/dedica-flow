'use server'

import { requireAuth, getOrCreateUserWorkspace } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { Scene, SceneInsert, Json } from '@/types'

async function assertProjectAccess(projectId: string) {
  const user = await requireAuth()
  const workspace = await getOrCreateUserWorkspace(user.id, user.email || '')

  if (!workspace) {
    throw new Error('No workspace found')
  }

  const admin = createAdminClient()

  const { data: project } = (await admin
    .from('projects')
    .select('id, workspace_id')
    .eq('id', projectId)
    .eq('workspace_id', workspace.workspace_id)
    .single()) as { data: { id: string; workspace_id: string } | null }

  if (!project) {
    throw new Error('Project not found or access denied')
  }

  return { user, workspace, admin, project }
}

export async function updateProjectScenes(projectId: string, scenes: Partial<Scene>[]) {
  const { admin } = await assertProjectAccess(projectId)

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

    return admin
      .from('scenes')
      .update(updateData as never)
      .eq('id', scene.id)
      .eq('project_id', projectId)
  })

  const results = await Promise.all(updates)
  const firstError = results.find((result) => result.error)?.error
  if (firstError) {
    throw new Error(`Failed to update scenes: ${firstError.message}`)
  }

  revalidatePath(`/admin/projects/${projectId}/edit`)

  return { success: true }
}

export async function createScene(
  projectId: string,
  sceneData: Omit<SceneInsert, 'project_id'> & { config: Json }
) {
  const { admin } = await assertProjectAccess(projectId)

  const insertData = {
    project_id: projectId,
    ...sceneData,
  }

  const { data: scene, error } = await admin
    .from('scenes')
    .insert(insertData as never)
    .select()
    .single()

  if (error || !scene) {
    throw new Error(`Failed to create scene: ${error?.message ?? 'unknown'}`)
  }

  revalidatePath(`/admin/projects/${projectId}/edit`)

  return scene
}

export async function deleteScene(projectId: string, sceneId: string) {
  const { admin } = await assertProjectAccess(projectId)

  const { error } = await admin
    .from('scenes')
    .delete()
    .eq('id', sceneId)
    .eq('project_id', projectId)

  if (error) {
    throw new Error(`Failed to delete scene: ${error.message}`)
  }

  revalidatePath(`/admin/projects/${projectId}/edit`)

  return { success: true }
}
