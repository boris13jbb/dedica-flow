import { requireAuth, getOrCreateUserWorkspace } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { MediaLibrary } from '@/components/media'
import { getProjectAssets } from './actions'

export default async function MediaPage({ params }: { params: Promise<{ id: string }> }) {
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
    .select('id, name, workspace_id')
    .eq('id', id)
    .eq('workspace_id', workspace.workspace_id)
    .single()) as { data: { id: string; name: string; workspace_id: string } | null }

  if (!project) {
    return (
      <div className="p-8">
        <p className="text-zinc-400">Proyecto no encontrado</p>
      </div>
    )
  }

  const assets = await getProjectAssets(id)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="border-b border-zinc-800 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-sm text-zinc-400 mt-1">Biblioteca de medios</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <MediaLibrary projectId={id} assets={assets} />
      </div>
    </div>
  )
}
