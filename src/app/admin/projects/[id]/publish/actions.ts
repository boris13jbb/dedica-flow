'use server'

import { requireAuth, getOrCreateUserWorkspace } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPublicExperienceUrl } from '@/lib/app-url'
import { normalizeSlug } from '@/lib/slug'
import { revalidatePath } from 'next/cache'
import type { Json } from '@/types'

interface PublicationSnapshot {
  projectId: string
  name: string
  slug: string
  scenes: Array<{
    id: string
    sceneKey: string
    sceneType: string
    name: string
    position: number
    duration: {
      enter: number
      hold: number
      exit: number
    }
    trigger: string
    enabled: boolean
    config: Record<string, unknown>
  }>
  audio?: {
    assetId?: string
    url?: string | null
    volume: number
    loop: boolean
    fadeIn: number
    fadeOut: number
  }
  metadata?: {
    title?: string
    description?: string
    ogImage?: string
    noIndex: boolean
  }
}

async function assertProjectAccess(projectId: string) {
  const user = await requireAuth()
  const workspace = await getOrCreateUserWorkspace(user.id, user.email || '')

  if (!workspace) {
    throw new Error('No se pudo obtener workspace')
  }

  const admin = createAdminClient()

  const { data: project } = (await admin
    .from('projects')
    .select('id, name, slug, workspace_id, draft_config, status')
    .eq('id', projectId)
    .eq('workspace_id', workspace.workspace_id)
    .single()) as {
    data: {
      id: string
      name: string
      slug: string
      workspace_id: string
      draft_config: Json
      status: string
    } | null
  }

  if (!project) {
    throw new Error('Proyecto no encontrado')
  }

  return { user, workspace, admin, project }
}

async function resolvePublicationSlug(
  admin: ReturnType<typeof createAdminClient>,
  workspaceId: string,
  projectId: string,
  currentSlug: string,
  projectName: string
) {
  const cleaned = normalizeSlug(currentSlug) || normalizeSlug(projectName)

  if (!cleaned) {
    throw new Error('La URL pública del proyecto no es válida. Edita el slug antes de publicar.')
  }

  if (cleaned === currentSlug.trim()) {
    return cleaned
  }

  const { data: conflict } = (await admin
    .from('projects')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('slug', cleaned)
    .neq('id', projectId)
    .maybeSingle()) as { data: { id: string } | null }

  if (conflict) {
    throw new Error(
      `La URL "/p/${cleaned}" ya está en uso por otro proyecto. Elige otro slug.`
    )
  }

  const { error } = await admin
    .from('projects')
    .update({ slug: cleaned, updated_at: new Date().toISOString() } as never)
    .eq('id', projectId)

  if (error) {
    throw new Error(`No se pudo normalizar la URL pública: ${error.message}`)
  }

  return cleaned
}

export async function getPublishReadiness(projectId: string) {
  const { admin, project } = await assertProjectAccess(projectId)

  const { count } = await admin
    .from('scenes')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .eq('enabled', true)

  return {
    enabledScenes: count ?? 0,
    projectStatus: project.status,
    slug: project.slug.trim(),
  }
}

export async function publishProject(projectId: string) {
  const { user, workspace, admin, project } = await assertProjectAccess(projectId)

  const publicationSlug = await resolvePublicationSlug(
    admin,
    workspace.workspace_id,
    projectId,
    project.slug,
    project.name
  )

  const { data: scenes } = (await admin
    .from('scenes')
    .select('*')
    .eq('project_id', projectId)
    .eq('enabled', true)
    .order('position', { ascending: true })) as {
    data: Array<{
      id: string
      scene_key: string
      scene_type: string
      name: string
      position: number
      duration_ms: number
      trigger_mode: string
      enabled: boolean
      config: Json
    }> | null
  }

  if (!scenes || scenes.length === 0) {
    throw new Error('No hay escenas habilitadas para publicar')
  }

  for (const scene of scenes) {
    if (!scene.config) {
      throw new Error(`La escena "${scene.name}" no tiene configuración`)
    }
  }

  const { data: assets } = (await admin
    .from('assets')
    .select('id, storage_path, bucket')
    .eq('project_id', projectId)) as {
    data: Array<{
      id: string
      storage_path: string
      bucket: string
    }> | null
  }

  const assetsMap = new Map(
    (assets || []).map((asset) => [
      asset.id,
      admin.storage.from(asset.bucket).getPublicUrl(asset.storage_path).data.publicUrl,
    ])
  )

  const draftConfig = project.draft_config as {
    audio?: {
      assetId?: string
      volume?: number
      loop?: boolean
      fadeIn?: number
      fadeOut?: number
    }
    metadata?: {
      title?: string
      description?: string
      ogImage?: string
      noIndex?: boolean
    }
  }

  const snapshot: PublicationSnapshot = {
    projectId: project.id,
    name: project.name,
    slug: publicationSlug,
    scenes: scenes.map((scene) => ({
      id: scene.id,
      sceneKey: scene.scene_key,
      sceneType: scene.scene_type,
      name: scene.name,
      position: scene.position,
      duration: {
        enter: 1000,
        hold: scene.duration_ms,
        exit: 1000,
      },
      trigger: scene.trigger_mode,
      enabled: scene.enabled,
      config: scene.config as Record<string, unknown>,
    })),
    audio: draftConfig.audio
      ? {
          assetId: draftConfig.audio.assetId,
          url: draftConfig.audio.assetId
            ? assetsMap.get(draftConfig.audio.assetId)
            : null,
          volume: draftConfig.audio.volume ?? 0.7,
          loop: draftConfig.audio.loop ?? false,
          fadeIn: draftConfig.audio.fadeIn ?? 2000,
          fadeOut: draftConfig.audio.fadeOut ?? 2000,
        }
      : undefined,
    metadata: {
      title: draftConfig.metadata?.title,
      description: draftConfig.metadata?.description,
      ogImage: draftConfig.metadata?.ogImage,
      noIndex: draftConfig.metadata?.noIndex ?? true,
    },
  }

  const { data: latestPublication } = (await admin
    .from('publications')
    .select('version')
    .eq('project_id', projectId)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle()) as { data: { version: number } | null }

  const newVersion = (latestPublication?.version ?? 0) + 1

  await admin
    .from('publications')
    .update({ status: 'superseded' } as never)
    .eq('project_id', projectId)
    .eq('status', 'active')

  const publicationInsert = {
    project_id: projectId,
    version: newVersion,
    slug: publicationSlug,
    snapshot: snapshot as unknown as Json,
    status: 'active',
    published_by: user.id,
    published_at: new Date().toISOString(),
  }

  const { data: publication, error: pubError } = await admin
    .from('publications')
    .insert(publicationInsert as never)
    .select()
    .single()

  if (pubError || !publication) {
    throw new Error(`Error al crear publicación: ${pubError?.message}`)
  }

  await admin
    .from('projects')
    .update({ status: 'published' } as never)
    .eq('id', projectId)

  revalidatePath(`/admin/projects/${projectId}`)
  revalidatePath(`/admin/projects/${projectId}/publish`)
  revalidatePath(`/p/${publicationSlug}`)

  return {
    publicationId: (publication as { id: string }).id,
    version: newVersion,
    slug: publicationSlug,
    publicUrl: getPublicExperienceUrl(publicationSlug),
  }
}

export async function unpublishProject(projectId: string) {
  const { admin, project } = await assertProjectAccess(projectId)

  await admin
    .from('publications')
    .update({
      status: 'inactive',
      unpublished_at: new Date().toISOString(),
    } as never)
    .eq('project_id', projectId)
    .in('status', ['active', 'superseded'])

  await admin
    .from('projects')
    .update({ status: 'draft' } as never)
    .eq('id', projectId)

  revalidatePath(`/admin/projects/${projectId}`)
  revalidatePath(`/admin/projects/${projectId}/publish`)
  revalidatePath(`/p/${project.slug.trim()}`)

  return { success: true }
}

export async function getPublications(projectId: string) {
  const { admin } = await assertProjectAccess(projectId)

  const { data: publications } = (await admin
    .from('publications')
    .select('id, version, slug, status, published_at, unpublished_at')
    .eq('project_id', projectId)
    .order('version', { ascending: false })) as {
    data: Array<{
      id: string
      version: number
      slug: string
      status: string
      published_at: string
      unpublished_at: string | null
    }> | null
  }

  return publications || []
}

export async function restorePublication(publicationId: string) {
  const user = await requireAuth()
  const workspace = await getOrCreateUserWorkspace(user.id, user.email || '')

  if (!workspace) {
    throw new Error('No se pudo obtener workspace')
  }

  const admin = createAdminClient()

  const { data: publication } = (await admin
    .from('publications')
    .select('id, project_id, version, slug, snapshot')
    .eq('id', publicationId)
    .single()) as {
    data: {
      id: string
      project_id: string
      version: number
      slug: string
      snapshot: Json
    } | null
  }

  if (!publication) {
    throw new Error('Publicación no encontrada')
  }

  const { data: project } = (await admin
    .from('projects')
    .select('id')
    .eq('id', publication.project_id)
    .eq('workspace_id', workspace.workspace_id)
    .single()) as { data: { id: string } | null }

  if (!project) {
    throw new Error('Proyecto no encontrado')
  }

  await admin
    .from('publications')
    .update({ status: 'superseded' } as never)
    .eq('project_id', publication.project_id)
    .eq('status', 'active')

  await admin
    .from('publications')
    .update({
      status: 'active',
      unpublished_at: null,
    } as never)
    .eq('id', publicationId)

  await admin
    .from('projects')
    .update({ status: 'published' } as never)
    .eq('id', publication.project_id)

  revalidatePath(`/admin/projects/${publication.project_id}`)
  revalidatePath(`/p/${publication.slug}`)

  return { success: true, version: publication.version }
}
