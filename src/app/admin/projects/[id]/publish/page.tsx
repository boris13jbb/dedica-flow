import { requireAuth, getOrCreateUserWorkspace } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { PublishPanel } from '@/components/publish'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function PublishPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireAuth()
  const workspace = await getOrCreateUserWorkspace(user.id, user.email || '')
  
  if (!workspace) {
    return (
      <div className="p-8">
        <p className="text-zinc-400">Error al obtener workspace</p>
      </div>
    )
  }
  
  const supabase = await createServerClient()

  // Get project
  const { data: project } = (await supabase
    .from('projects')
    .select('id, name, slug, status')
    .eq('id', id)
    .eq('workspace_id', workspace.workspace_id)
    .single()) as { 
      data: { 
        id: string
        name: string
        slug: string
        status: string
      } | null 
    }

  if (!project) {
    return (
      <div className="p-8">
        <p className="text-zinc-400">Proyecto no encontrado</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="border-b border-zinc-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link
            href={`/admin/projects/${id}/edit`}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-sm text-zinc-400 mt-1">Gestión de publicación</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        <PublishPanel
          projectId={id}
          projectSlug={project.slug}
          projectStatus={project.status}
        />
      </div>
    </div>
  )
}
