'use server'

import { requireAuth, getOrCreateUserWorkspace } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { normalizeSlug } from '@/lib/slug'
import {
  allocateUniqueSlug,
  buildProjectDuplicateDraft,
  suggestCopyName,
  suggestCopySlug,
  type DuplicableScene,
} from '@/lib/project-duplicate'
import { revalidatePath } from 'next/cache'
import type { Json } from '@/types'

export async function getProjectDuplicateDefaults(projectId: string) {
  const { project } = await assertOwnedProject(projectId)
  return {
    name: suggestCopyName(project.name),
    slug: suggestCopySlug(project.slug),
  }
}

export async function duplicateProject(input: {
  projectId: string
  name: string
  slug: string
}) {
  const { user, workspace, admin, project } = await assertOwnedProject(input.projectId)

  const name = input.name.trim() || suggestCopyName(project.name)
  const requestedSlug = normalizeSlug(input.slug || suggestCopySlug(project.slug))
  if (!requestedSlug) {
    throw new Error('El slug no es válido')
  }

  const { data: scenes, error: scenesError } = (await admin
    .from('scenes')
    .select(
      'scene_key, scene_type, name, position, duration_ms, trigger_mode, enabled, config'
    )
    .eq('project_id', project.id)
    .order('position', { ascending: true })) as {
    data: DuplicableScene[] | null
    error: { message: string } | null
  }

  if (scenesError) {
    throw new Error(`No se pudieron leer las escenas: ${scenesError.message}`)
  }

  const { data: existingSlugs } = (await admin
    .from('projects')
    .select('slug')
    .eq('workspace_id', workspace.workspace_id)) as { data: Array<{ slug: string }> | null }

  const uniqueSlug = allocateUniqueSlug(
    requestedSlug,
    new Set((existingSlugs ?? []).map((row) => row.slug))
  )

  const draft = buildProjectDuplicateDraft(
    {
      id: project.id,
      name: project.name,
      slug: project.slug,
      description: project.description,
      template_id: project.template_id,
      cover_asset_id: project.cover_asset_id,
      draft_config: project.draft_config,
      status: project.status,
      scenes: scenes ?? [],
    },
    { name, slug: uniqueSlug }
  )

  const insertData = {
    workspace_id: workspace.workspace_id,
    template_id: draft.template_id,
    name: draft.name,
    slug: draft.slug,
    description: draft.description,
    status: draft.status,
    draft_config: draft.draft_config,
    cover_asset_id: draft.cover_asset_id,
    created_by: user.id,
  }

  const { data: created, error: createError } = await admin
    .from('projects')
    .insert(insertData as never)
    .select('id, name, slug')
    .single()

  if (createError || !created) {
    throw new Error(`No se pudo duplicar el proyecto: ${createError?.message ?? 'error desconocido'}`)
  }

  const createdProject = created as { id: string; name: string; slug: string }

  try {
    if (draft.scenes.length > 0) {
      const sceneRows = draft.scenes.map((scene) => ({
        project_id: createdProject.id,
        scene_key: scene.scene_key,
        scene_type: scene.scene_type,
        name: scene.name,
        position: scene.position,
        duration_ms: scene.duration_ms,
        trigger_mode: scene.trigger_mode,
        enabled: scene.enabled,
        config: scene.config,
      }))

      const { error: insertScenesError } = await admin.from('scenes').insert(sceneRows as never)
      if (insertScenesError) {
        throw new Error(insertScenesError.message)
      }
    }
  } catch (error) {
    await admin.from('projects').delete().eq('id', createdProject.id)
    throw new Error(
      `No se pudieron copiar las escenas: ${error instanceof Error ? error.message : 'error desconocido'}`
    )
  }

  revalidatePath('/admin')
  return createdProject
}

async function assertOwnedProject(projectId: string) {
  const user = await requireAuth()
  const workspace = await getOrCreateUserWorkspace(user.id, user.email || '')

  if (!workspace) {
    throw new Error('No workspace found')
  }

  const admin = createAdminClient()

  const { data: project } = (await admin
    .from('projects')
    .select(
      'id, name, slug, description, template_id, cover_asset_id, draft_config, status, workspace_id'
    )
    .eq('id', projectId)
    .eq('workspace_id', workspace.workspace_id)
    .single()) as {
    data: {
      id: string
      name: string
      slug: string
      description: string | null
      template_id: string | null
      cover_asset_id: string | null
      draft_config: Json
      status: 'draft' | 'published' | 'archived'
      workspace_id: string
    } | null
  }

  if (!project) {
    throw new Error('Proyecto no encontrado o acceso denegado')
  }

  return { user, workspace, admin, project }
}
