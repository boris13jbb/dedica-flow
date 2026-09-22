import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export async function getCurrentUser() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

export interface WorkspaceMembership {
  workspace_id: string
  role: string
  workspaces: {
    id: string
    name: string
    slug: string
    owner_user_id: string
  } | null
}

function mapMembership(row: {
  workspace_id: string
  role: string
  workspaces:
    | {
        id: string
        name: string
        slug: string
        owner_user_id: string
      }
    | {
        id: string
        name: string
        slug: string
        owner_user_id: string
      }[]
    | null
}): WorkspaceMembership {
  const workspace = Array.isArray(row.workspaces)
    ? row.workspaces[0] ?? null
    : row.workspaces

  return {
    workspace_id: row.workspace_id,
    role: row.role,
    workspaces: workspace,
  }
}

/**
 * Lee membership con service role para evitar el chicken-and-egg de RLS
 * (policies que consultan workspace_members sobre sí mismas).
 */
async function getUserWorkspaceAdmin(userId: string): Promise<WorkspaceMembership | null> {
  const admin = createAdminClient()

  const { data: membership, error } = await admin
    .from('workspace_members')
    .select(
      `
      workspace_id,
      role,
      workspaces (
        id,
        name,
        slug,
        owner_user_id
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('getUserWorkspaceAdmin error:', error.message)
    return null
  }

  if (!membership) {
    return null
  }

  return mapMembership(membership as Parameters<typeof mapMembership>[0])
}

export async function getUserWorkspace(userId: string) {
  // Prefer admin read: user-scoped RLS on workspace_members is recursive and
  // often hides the owner's own row right after bootstrap.
  return getUserWorkspaceAdmin(userId)
}

/**
 * Obtiene o crea el workspace del usuario de forma idempotente.
 */
export async function getOrCreateUserWorkspace(userId: string, userEmail: string) {
  const existing = await getUserWorkspaceAdmin(userId)
  if (existing) {
    return existing
  }

  const admin = createAdminClient()
  const workspaceName = (userEmail.split('@')[0] || 'workspace').slice(0, 60)
  const workspaceSlug = `workspace-${userId.slice(0, 8)}`

  // Si ya existe por slug (intento previo fallido a medias), reutilizarlo.
  const { data: existingBySlug } = await admin
    .from('workspaces')
    .select('id, name, slug, owner_user_id')
    .eq('slug', workspaceSlug)
    .maybeSingle()

  let workspaceId = (existingBySlug as { id: string } | null)?.id

  if (!workspaceId) {
    const { data: owned } = await admin
      .from('workspaces')
      .select('id, name, slug, owner_user_id')
      .eq('owner_user_id', userId)
      .limit(1)
      .maybeSingle()

    workspaceId = (owned as { id: string } | null)?.id
  }

  if (!workspaceId) {
    const insertData = {
      name: workspaceName,
      slug: workspaceSlug,
      owner_user_id: userId,
    }

    const { data: workspace, error: workspaceError } = await admin
      .from('workspaces')
      .insert(insertData as never)
      .select('id')
      .single()

    if (workspaceError || !workspace) {
      // Carrera / unique: releer por slug o owner
      const { data: raced } = await admin
        .from('workspaces')
        .select('id')
        .or(`slug.eq.${workspaceSlug},owner_user_id.eq.${userId}`)
        .limit(1)
        .maybeSingle()

      workspaceId = (raced as { id: string } | null)?.id

      if (!workspaceId) {
        throw new Error(
          `Failed to create workspace: ${workspaceError?.message ?? 'unknown error'}`
        )
      }
    } else {
      workspaceId = (workspace as { id: string }).id
    }
  }

  const { data: existingMember } = await admin
    .from('workspace_members')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .maybeSingle()

  if (!existingMember) {
    const { error: memberError } = await admin
      .from('workspace_members')
      .insert({
        workspace_id: workspaceId,
        user_id: userId,
        role: 'owner',
      } as never)

    if (memberError && !memberError.message.toLowerCase().includes('duplicate')) {
      throw new Error(`Failed to create workspace member: ${memberError.message}`)
    }
  }

  const membership = await getUserWorkspaceAdmin(userId)
  if (!membership) {
    throw new Error('Workspace created but membership could not be loaded')
  }

  return membership
}
