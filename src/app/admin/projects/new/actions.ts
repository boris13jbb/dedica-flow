'use server'

import { requireAuth, getOrCreateUserWorkspace } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { Json } from '@/types'
import { normalizeSlug } from '@/lib/slug'

interface TemplateSceneConfig {
  sceneType: string
  sceneKey: string
  name: string
  position: number
  duration?: { enter?: number; hold?: number; exit?: number }
  trigger?: string
  enabled?: boolean
  config?: Json
}

interface TemplateDefaultConfig {
  scenes?: TemplateSceneConfig[]
  audio?: Json
  metadata?: Json
}

type TemplateSelect = {
  id: string
  default_config: TemplateDefaultConfig | Json
}

function toDurationMs(duration?: { enter?: number; hold?: number; exit?: number }) {
  if (!duration) return 5000
  const hold = duration.hold ?? 0
  if (hold > 0) return hold
  return (duration.enter ?? 0) + (duration.exit ?? 0) || 5000
}

async function ensureUniqueSlug(
  admin: ReturnType<typeof createAdminClient>,
  workspaceId: string,
  baseSlug: string
) {
  let candidate = baseSlug || `proyecto-${Date.now().toString(36)}`
  let attempt = 1

  while (attempt <= 20) {
    const { data } = await admin
      .from('projects')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('slug', candidate)
      .maybeSingle()

    if (!data) {
      return candidate
    }

    attempt += 1
    candidate = `${baseSlug.slice(0, 50)}-${attempt}`
  }

  return `${baseSlug.slice(0, 40)}-${Date.now().toString(36)}`
}

export async function createProject(formData: FormData) {
  const user = await requireAuth()
  const workspace = await getOrCreateUserWorkspace(user.id, user.email || '')

  if (!workspace) {
    redirect('/admin/projects/new?error=workspace')
  }

  const name = String(formData.get('name') || '').trim()
  const rawSlug = String(formData.get('slug') || '')
  const description = String(formData.get('description') || '').trim()
  const templateId = String(formData.get('templateId') || '')

  if (!name) {
    redirect('/admin/projects/new?error=name')
  }

  const normalizedSlug = normalizeSlug(rawSlug || name)
  if (!normalizedSlug) {
    redirect('/admin/projects/new?error=slug')
  }

  if (!templateId) {
    redirect('/admin/projects/new?error=template')
  }

  const admin = createAdminClient()
  const workspaceId = workspace.workspace_id as string

  const { data: template, error: templateError } = (await admin
    .from('templates')
    .select('id, default_config')
    .eq('id', templateId)
    .single()) as { data: TemplateSelect | null; error: { message: string } | null }

  if (templateError || !template) {
    redirect('/admin/projects/new?error=template')
  }

  const defaultConfig = (template.default_config || {}) as TemplateDefaultConfig
  const uniqueSlug = await ensureUniqueSlug(admin, workspaceId, normalizedSlug)

  const insertData = {
    workspace_id: workspaceId,
    template_id: templateId,
    name,
    slug: uniqueSlug,
    description: description || null,
    status: 'draft' as const,
    draft_config: template.default_config,
    created_by: user.id,
  }

  const { data: project, error: projectError } = await admin
    .from('projects')
    .insert(insertData as never)
    .select('id')
    .single()

  if (projectError || !project) {
    // Carrera rara: reintentar una vez con sufijo único
    if (projectError?.message?.includes('projects_workspace_id_slug_key')) {
      const retrySlug = `${normalizedSlug}-${Date.now().toString(36)}`
      const { data: retryProject, error: retryError } = await admin
        .from('projects')
        .insert({ ...insertData, slug: retrySlug } as never)
        .select('id')
        .single()

      if (!retryError && retryProject) {
        const retryId = (retryProject as { id: string }).id
        await insertScenesFromTemplate(admin, retryId, defaultConfig)
        revalidatePath('/admin')
        redirect(`/admin/projects/${retryId}/edit`)
      }
    }

    console.error('createProject failed:', projectError)
    redirect('/admin/projects/new?error=create')
  }

  const projectId = (project as { id: string }).id

  try {
    await insertScenesFromTemplate(admin, projectId, defaultConfig)
  } catch (error) {
    await admin.from('projects').delete().eq('id', projectId)
    console.error('createProject scenes failed:', error)
    redirect('/admin/projects/new?error=scenes')
  }

  revalidatePath('/admin')
  redirect(`/admin/projects/${projectId}/edit`)
}

async function insertScenesFromTemplate(
  admin: ReturnType<typeof createAdminClient>,
  projectId: string,
  defaultConfig: TemplateDefaultConfig
) {
  const templateScenes = Array.isArray(defaultConfig.scenes) ? defaultConfig.scenes : []
  if (templateScenes.length === 0) return

  const sceneRows = templateScenes.map((scene, index) => ({
    project_id: projectId,
    scene_key: scene.sceneKey || `scene-${index + 1}`,
    scene_type: scene.sceneType,
    name: scene.name || scene.sceneType,
    position: scene.position ?? index,
    duration_ms: toDurationMs(scene.duration),
    trigger_mode: scene.trigger || 'auto',
    enabled: scene.enabled !== false,
    config: scene.config || {},
  }))

  const { error: scenesError } = await admin.from('scenes').insert(sceneRows as never)
  if (scenesError) {
    throw new Error(scenesError.message)
  }
}
