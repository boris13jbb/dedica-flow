import { createServerClient } from '@/lib/supabase/server'
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

interface WorkspaceMembership {
  workspace_id: string
  role: string
  workspaces: {
    id: string
    name: string
    slug: string
    owner_user_id: string
  } | null
}

export async function getUserWorkspace(userId: string) {
  const supabase = await createServerClient()

  const { data: membership } = await supabase
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
    .single()

  return membership as WorkspaceMembership | null
}

export async function getOrCreateUserWorkspace(userId: string, userEmail: string) {
  const supabase = await createServerClient()

  let membership = await getUserWorkspace(userId)

  if (!membership) {
    const workspaceName = userEmail.split('@')[0]
    const workspaceSlug = `workspace-${userId.slice(0, 8)}`

    const insertData = {
      name: workspaceName,
      slug: workspaceSlug,
      owner_user_id: userId,
    }

    const { data: workspace, error: workspaceError} = await supabase
      .from('workspaces')
      // @ts-expect-error - Supabase types issue
      .insert(insertData)
      .select()
      .single()

    if (workspaceError || !workspace) {
      throw new Error('Failed to create workspace')
    }

    const memberData = {
      workspace_id: (workspace as { id: string }).id,
      user_id: userId,
      role: 'owner',
    }

    const { error: memberError } = await supabase
      .from('workspace_members')
      // @ts-expect-error - Supabase types issue
      .insert(memberData)

    if (memberError) {
      throw new Error('Failed to create workspace member')
    }

    membership = await getUserWorkspace(userId)
  }

  return membership
}
