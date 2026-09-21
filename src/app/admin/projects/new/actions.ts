'use server'

import { requireAuth, getOrCreateUserWorkspace } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ProjectInsert, Template, Project } from '@/types'

type TemplateSelect = Pick<Template, 'id' | 'default_config'>

export async function createProject(formData: FormData) {
  const user = await requireAuth()
  const workspace = await getOrCreateUserWorkspace(user.id, user.email || '')

  if (!workspace) {
    throw new Error('No workspace found')
  }

  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const description = formData.get('description') as string
  const templateId = formData.get('templateId') as string

  if (!name || !slug) {
    throw new Error('Name and slug are required')
  }

  const supabase = await createServerClient()

  const { data: template } = await supabase
    .from('templates')
    .select('id, default_config')
    .eq('id', templateId)
    .single() as { data: TemplateSelect | null }

  if (!template) {
    throw new Error('Template not found')
  }

  const insertData = {
    workspace_id: workspace.workspace_id as string,
    template_id: templateId,
    name,
    slug,
    description: description || null,
    status: 'draft' as const,
    draft_config: template.default_config,
    created_by: user.id,
  }

  const { data: project } = await supabase
    .from('projects')
    // @ts-ignore - Supabase types issue
    .insert(insertData)
    .select('id')
    .single()

  if (!project) {
    throw new Error('Failed to create project')
  }

  revalidatePath('/admin')
  redirect(`/admin/projects/${(project as any).id}/edit`)
}
