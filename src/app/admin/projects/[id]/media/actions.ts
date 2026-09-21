'use server'

import { requireAuth, getOrCreateUserWorkspace } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { AssetInsert, Json } from '@/types'

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
  
  const supabase = await createServerClient()

  // Verify project ownership
  const { data: project } = (await supabase
    .from('projects')
    .select('id, workspace_id')
    .eq('id', projectId)
    .eq('workspace_id', workspace.workspace_id)
    .single()) as { data: { id: string; workspace_id: string } | null }

  if (!project) {
    throw new Error('Proyecto no encontrado')
  }

  // Generate unique file path
  const fileExt = file.name.split('.').pop()
  const fileName = `${workspace.workspace_id}/${projectId}/${crypto.randomUUID()}.${fileExt}`

  // Upload to storage
  const adminSupabase = createAdminClient()
  const { error: uploadError } = await adminSupabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file.arrayBuffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    throw new Error(`Error al subir archivo: ${uploadError.message}`)
  }

  // Determine asset type
  let assetType: 'image' | 'audio' | 'video'
  if (file.type.startsWith('image/')) {
    assetType = 'image'
  } else if (file.type.startsWith('audio/')) {
    assetType = 'audio'
  } else if (file.type.startsWith('video/')) {
    assetType = 'video'
  } else {
    throw new Error('Tipo de archivo no soportado')
  }

  // Get public URL
  const { data: urlData } = adminSupabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName)

  // Create asset record
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

  const { data: asset, error: assetError } = await supabase
    .from('assets')
    // @ts-expect-error Supabase insert typing
    .insert(assetInsert)
    .select()
    .single()

  if (assetError || !asset) {
    // Cleanup uploaded file if database insert fails
    await adminSupabase.storage.from(BUCKET_NAME).remove([fileName])
    throw new Error(`Error al crear registro: ${assetError?.message}`)
  }

  return {
    ...asset as Record<string, unknown>,
    url: urlData.publicUrl,
  }
}

export async function deleteAsset(assetId: string) {
  const user = await requireAuth()
  const workspace = await getOrCreateUserWorkspace(user.id, user.email || '')
  
  if (!workspace) {
    throw new Error('No se pudo obtener workspace')
  }
  
  const supabase = await createServerClient()

  // Get asset details
  const { data: asset } = (await supabase
    .from('assets')
    .select('id, workspace_id, storage_path, bucket')
    .eq('id', assetId)
    .eq('workspace_id', workspace.workspace_id)
    .single()) as { data: { id: string; workspace_id: string; storage_path: string; bucket: string } | null }

  if (!asset) {
    throw new Error('Asset no encontrado')
  }

  // Delete from storage
  const adminSupabase = createAdminClient()
  const { error: storageError } = await adminSupabase.storage
    .from(asset.bucket)
    .remove([asset.storage_path])

  if (storageError) {
    throw new Error(`Error al eliminar archivo: ${storageError.message}`)
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('assets')
    .delete()
    .eq('id', assetId)

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
  
  const supabase = await createServerClient()

  // Verify project ownership
  const { data: project } = (await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('workspace_id', workspace.workspace_id)
    .single()) as { data: { id: string } | null }

  if (!project) {
    throw new Error('Proyecto no encontrado')
  }

  // Get assets
  const { data: assets, error } = (await supabase
    .from('assets')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })) as { data: Array<{
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
    }> | null; error: unknown }

  if (error) {
    throw new Error('Error al obtener assets')
  }

  // Add public URLs
  const adminSupabase = createAdminClient()
  return (assets || []).map((asset) => ({
    ...asset,
    url: adminSupabase.storage.from(asset.bucket).getPublicUrl(asset.storage_path).data.publicUrl,
  }))
}
