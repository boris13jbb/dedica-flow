'use server'

import { requireAuth, getOrCreateUserWorkspace } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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

export async function publishProject(projectId: string) {
  const user = await requireAuth()
  const workspace = await getOrCreateUserWorkspace(user.id, user.email || '')
  
  if (!workspace) {
    throw new Error('No se pudo obtener workspace')
  }
  
  const supabase = await createServerClient()
  const adminSupabase = createAdminClient()

  // Get project
  const { data: project } = (await supabase
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

  // Get all enabled scenes
  const { data: scenes } = (await supabase
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

  // Validate all scenes
  for (const scene of scenes) {
    if (!scene.config) {
      throw new Error(`La escena "${scene.name}" no tiene configuración`)
    }
  }

  // Get assets for resolving URLs
  const { data: assets } = (await supabase
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
      adminSupabase.storage.from(asset.bucket).getPublicUrl(asset.storage_path).data.publicUrl
    ])
  )

  // Build snapshot
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
    slug: project.slug,
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
    audio: draftConfig.audio ? {
      assetId: draftConfig.audio.assetId,
      url: draftConfig.audio.assetId ? assetsMap.get(draftConfig.audio.assetId) : null,
      volume: draftConfig.audio.volume ?? 0.7,
      loop: draftConfig.audio.loop ?? false,
      fadeIn: draftConfig.audio.fadeIn ?? 2000,
      fadeOut: draftConfig.audio.fadeOut ?? 2000,
    } : undefined,
    metadata: {
      title: draftConfig.metadata?.title,
      description: draftConfig.metadata?.description,
      ogImage: draftConfig.metadata?.ogImage,
      noIndex: draftConfig.metadata?.noIndex ?? true,
    },
  }

  // Get current version number
  const { data: latestPublication } = (await supabase
    .from('publications')
    .select('version')
    .eq('project_id', projectId)
    .order('version', { ascending: false })
    .limit(1)
    .single()) as { data: { version: number } | null }

  const newVersion = (latestPublication?.version ?? 0) + 1

  // Mark previous publications as superseded
  await supabase
    .from('publications')
    // @ts-expect-error Supabase update typing
    .update({ status: 'superseded' })
    .eq('project_id', projectId)
    .eq('status', 'active')

  // Create new publication
  const publicationInsert = {
    project_id: projectId,
    version: newVersion,
    slug: project.slug,
    snapshot: snapshot as unknown as Json,
    status: 'active',
    published_by: user.id,
    published_at: new Date().toISOString(),
  }

  const { data: publication, error: pubError } = await supabase
    .from('publications')
    // @ts-expect-error Supabase insert typing
    .insert(publicationInsert)
    .select()
    .single()

  if (pubError || !publication) {
    throw new Error(`Error al crear publicación: ${pubError?.message}`)
  }

  // Update project status
  await supabase
    .from('projects')
    // @ts-expect-error Supabase update typing
    .update({ status: 'published' })
    .eq('id', projectId)

  revalidatePath(`/admin/projects/${projectId}`)
  revalidatePath(`/p/${project.slug}`)

  return {
    publicationId: (publication as { id: string }).id,
    version: newVersion,
    slug: project.slug,
  }
}

export async function unpublishProject(projectId: string) {
  const user = await requireAuth()
  const workspace = await getOrCreateUserWorkspace(user.id, user.email || '')
  
  if (!workspace) {
    throw new Error('No se pudo obtener workspace')
  }
  
  const supabase = await createServerClient()

  // Verify ownership
  const { data: project } = (await supabase
    .from('projects')
    .select('id, slug')
    .eq('id', projectId)
    .eq('workspace_id', workspace.workspace_id)
    .single()) as { data: { id: string; slug: string } | null }

  if (!project) {
    throw new Error('Proyecto no encontrado')
  }

  // Mark all publications as inactive
  await supabase
    .from('publications')
    // @ts-expect-error Supabase update typing
    .update({ 
      status: 'inactive',
      unpublished_at: new Date().toISOString(),
    })
    .eq('project_id', projectId)
    .in('status', ['active', 'superseded'])

  // Update project status
  await supabase
    .from('projects')
    // @ts-expect-error Supabase update typing
    .update({ status: 'draft' })
    .eq('id', projectId)

  revalidatePath(`/admin/projects/${projectId}`)
  revalidatePath(`/p/${project.slug}`)

  return { success: true }
}

export async function getPublications(projectId: string) {
  const user = await requireAuth()
  const workspace = await getOrCreateUserWorkspace(user.id, user.email || '')
  
  if (!workspace) {
    throw new Error('No se pudo obtener workspace')
  }
  
  const supabase = await createServerClient()

  // Verify ownership
  const { data: project } = (await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('workspace_id', workspace.workspace_id)
    .single()) as { data: { id: string } | null }

  if (!project) {
    throw new Error('Proyecto no encontrado')
  }

  // Get publications
  const { data: publications } = (await supabase
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
  
  const supabase = await createServerClient()

  // Get publication
  const { data: publication } = (await supabase
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

  // Verify project ownership
  const { data: project } = (await supabase
    .from('projects')
    .select('id')
    .eq('id', publication.project_id)
    .eq('workspace_id', workspace.workspace_id)
    .single()) as { data: { id: string } | null }

  if (!project) {
    throw new Error('Proyecto no encontrado')
  }

  // Mark all current publications as superseded
  await supabase
    .from('publications')
    .update({ status: 'superseded' } as never)
    .eq('project_id', publication.project_id)
    .eq('status', 'active')

  // Reactivate this publication
  await supabase
    .from('publications')
    .update({ 
      status: 'active',
      unpublished_at: null,
    } as never)
    .eq('id', publicationId)

  // Update project status
  await supabase
    .from('projects')
    .update({ status: 'published' } as never)
    .eq('id', publication.project_id)

  revalidatePath(`/admin/projects/${publication.project_id}`)
  revalidatePath(`/p/${publication.slug}`)

  return { success: true, version: publication.version }
}
