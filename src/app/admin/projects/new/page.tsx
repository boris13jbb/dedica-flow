import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { requireAuth, getOrCreateUserWorkspace } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { AdminShell } from '@/components/admin/admin-shell'
import { createProject } from './actions'
import { NewProjectForm } from './new-project-form'
import type { Template } from '@/types'

type TemplateListItem = Pick<Template, 'id' | 'name' | 'description' | 'version' | 'is_system'>

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const user = await requireAuth()
  const workspace = await getOrCreateUserWorkspace(user.id, user.email || '')

  if (!workspace) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-zinc-50">
        Error al cargar workspace
      </div>
    )
  }

  const admin = createAdminClient()

  const { data: templates } = (await admin
    .from('templates')
    .select('id, name, description, version, is_system')
    .eq('is_active', true)
    .or(`is_system.eq.true,workspace_id.eq.${workspace.workspace_id}`)) as {
    data: TemplateListItem[] | null
  }

  return (
    <AdminShell
      email={user.email}
      title="Nuevo proyecto"
      subtitle="Define el nombre, la URL pública y la plantilla de partida."
      actions={
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800 hover:text-zinc-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
      }
    >
      <NewProjectForm
        templates={templates || []}
        errorCode={params.error || null}
        action={createProject}
        cancelHref="/admin"
      />
    </AdminShell>
  )
}
