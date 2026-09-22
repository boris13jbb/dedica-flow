'use server'

import { requireAuth, getOrCreateUserWorkspace } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { Json } from '@/types'

const BUCKET_NAME = 'project-assets'

export async function uploadAsset(
  projectId: string,
  file: {
    name: string
    type: string
    size: number
    arrayBuffer: ArrayBuffer
  }
) {
  const user = await requireAuth()
  const workspace = await getOrCreateUserWorkspace(user.id, user.email || '')

  if (!workspace) {
    throw new Error('No se pudo obtener workspace')
  }

  const admin = createAdminClient()

  const { data: project } = (await admin
    .from('projects')
    .select('id, workspace_id')
    .eq('id', projectId)
    .eq('workspace_id', workspace.workspace_id)
    .single()) as { data: { id: string; workspace_id: string } | null }

  if (!project) {
    throw new Error('Proyecto no encontrado')
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${workspace.workspace_id}/${projectId}/${crypto.randomUUID()}.${fileExt}`

  const { error: uploadError } = await admin.storage
    .from(BUCKET_NAME)
    .upload(fileName, file.arrayBuffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    throw new Error(`Error al subir archivo: ${uploadError.message}`)
  }

  let assetType: 'image' | 'audio' | 'video'
  if (file.type.startsWith('image/')) {
    assetType = 'image'
  } else if (file.type.startsWith('audio/')) {
    assetType = 'audio'
  } else if (file.type.startsWith('video/')) {
    assetType = 'video'
  } else {
    await admin.storage.from(BUCKET_NAME).remove([fileName])
    throw new Error('Tipo de archivo no soportado')
  }

  const { data: urlData } = admin.storage.from(BUCKET_NAME).getPublicUrl(fileName)

  const assetInsert = {
    workspace_id: workspace.workspace_id,
    project_id: projectId,
    type: assetType,
    bucket: BUCKET_NAME,
    storage_path: fileName,
    original_name: file.name,
    mime_type: file.type,
    size_bytes: file.size,
    metadata: {} as Json,
  }

  const { data: asset, error: assetError } = await admin
    .from('assets')
    .insert(assetInsert as never)
    .select()
    .single()

  if (assetError || !asset) {
    await admin.storage.from(BUCKET_NAME).remove([fileName])
    throw new Error(`Error al crear registro: ${assetError?.message}`)
  }

  return {
    ...(asset as Record<string, unknown>),
    url: urlData.publicUrl,
  }
}

export async function deleteAsset(assetId: string) {
  const user = await requireAuth()
  const workspace = await getOrCreateUserWorkspace(user.id, user.email || '')

  if (!workspace) {
    throw new Error('No se pudo obtener workspace')
  }

  const admin = createAdminClient()

  const { data: asset } = (await admin
    .from('assets')
    .select('id, workspace_id, storage_path, bucket')
    .eq('id', assetId)
    .eq('workspace_id', workspace.workspace_id)
    .single()) as {
    data: { id: string; workspace_id: string; storage_path: string; bucket: string } | null
  }

  if (!asset) {
    throw new Error('Asset no encontrado')
  }

  const { error: storageError } = await admin.storage
    .from(asset.bucket)
    .remove([asset.storage_path])

  if (storageError) {
    throw new Error(`Error al eliminar archivo: ${storageError.message}`)
  }

  const { error: dbError } = await admin.from('assets').delete().eq('id', assetId)

  if (dbError) {
    throw new Error(`Error al eliminar registro: ${dbError.message}`)
  }

  return { success: true }
}

export async function getProjectAssets(projectId: string) {
  const user = await requireAuth()
  const workspace = await getOrCreateUserWorkspace(user.id, user.email || '')

  if (!workspace) {
    throw new Error('No se pudo obtener workspace')
  }

  const admin = createAdminClient()

  const { data: project } = (await admin
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('workspace_id', workspace.workspace_id)
    .single()) as { data: { id: string } | null }

  if (!project) {
    throw new Error('Proyecto no encontrado')
  }

  const { data: assets, error } = (await admin
    .from('assets')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })) as {
    data: Array<{
      id: string
      workspace_id: string
      project_id: string
      type: 'image' | 'audio' | 'video'
      bucket: string
      storage_path: string
      original_name: string
      mime_type: string
      size_bytes: number
      width: number | null
      height: number | null
      duration_ms: number | null
      metadata: Json
      created_at: string
    }> | null
    error: { message: string } | null
  }

  if (error) {
    throw new Error(`Error al obtener assets: ${error.message}`)
  }

  return (assets || []).map((asset) => ({
    ...asset,
    url: admin.storage.from(asset.bucket).getPublicUrl(asset.storage_path).data.publicUrl,
  }))
}

export async function updateProjectAudioConfig(
  projectId: string,
  audio: {
    assetId?: string | null
    volume?: number
    loop?: boolean
    fadeIn?: number
    fadeOut?: number
  }
) {
  const user = await requireAuth()
  const workspace = await getOrCreateUserWorkspace(user.id, user.email || '')

  if (!workspace) {
    throw new Error('No se pudo obtener workspace')
  }

  const admin = createAdminClient()

  const { data: project } = (await admin
    .from('projects')
    .select('id, draft_config')
    .eq('id', projectId)
    .eq('workspace_id', workspace.workspace_id)
    .single()) as {
    data: { id: string; draft_config: Json } | null
  }

  if (!project) {
    throw new Error('Proyecto no encontrado')
  }

  if (audio.assetId) {
    const { data: asset } = (await admin
      .from('assets')
      .select('id, type')
      .eq('id', audio.assetId)
      .eq('project_id', projectId)
      .single()) as { data: { id: string; type: string } | null }

    if (!asset || asset.type !== 'audio') {
      throw new Error('El archivo seleccionado no es un audio válido de este proyecto')
    }
  }

  const prev =
    project.draft_config && typeof project.draft_config === 'object' && !Array.isArray(project.draft_config)
      ? ({ ...(project.draft_config as Record<string, unknown>) })
      : {}
  const prevAudio =
    prev.audio && typeof prev.audio === 'object' && !Array.isArray(prev.audio)
      ? ({ ...(prev.audio as Record<string, unknown>) })
      : {}

  const nextAudio: Record<string, unknown> = {
    volume:
      audio.volume ??
      (typeof prevAudio.volume === 'number' ? prevAudio.volume : 0.7),
    loop:
      audio.loop ??
      (typeof prevAudio.loop === 'boolean' ? prevAudio.loop : true),
    fadeIn:
      audio.fadeIn ??
      (typeof prevAudio.fadeIn === 'number' ? prevAudio.fadeIn : 2000),
    fadeOut:
      audio.fadeOut ??
      (typeof prevAudio.fadeOut === 'number' ? prevAudio.fadeOut : 2000),
  }

  if (audio.assetId === null) {
    // Quitar banda sonora
  } else if (typeof audio.assetId === 'string') {
    nextAudio.assetId = audio.assetId
  } else if (typeof prevAudio.assetId === 'string') {
    nextAudio.assetId = prevAudio.assetId
  }

  const draft_config = {
    ...prev,
    audio: nextAudio,
  } as Json

  const { error } = await admin
    .from('projects')
    .update({ draft_config, updated_at: new Date().toISOString() } as never)
    .eq('id', projectId)

  if (error) {
    throw new Error(`Error al guardar audio: ${error.message}`)
  }

  revalidatePath(`/admin/projects/${projectId}/media`)
  revalidatePath(`/admin/projects/${projectId}/edit`)
  revalidatePath(`/admin/projects/${projectId}/publish`)

  return { success: true, audio: nextAudio }
}
