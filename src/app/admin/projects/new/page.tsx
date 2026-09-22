import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { requireAuth, getOrCreateUserWorkspace } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { AdminShell } from '@/components/admin/admin-shell'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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
      <div className="flex min-h-screen items-center justify-center bg-df-bg p-6 text-df-fg">
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
      title="Crear nueva experiencia"
      subtitle="Configura los detalles iniciales de tu experiencia."
      breadcrumbs={[
        { label: 'Tus experiencias', href: '/admin' },
        { label: 'Nuevo proyecto' },
      ]}
      actions={
        <Link
          href="/admin"
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
        >
          <ArrowLeft className="size-4" />
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
