import { requireAuth, getOrCreateUserWorkspace } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FileText, Plus, Archive, CheckCircle } from 'lucide-react'
import type { Project } from '@/types'

type ProjectListItem = Pick<Project, 'id' | 'name' | 'slug' | 'status' | 'updated_at'>

export default async function AdminDashboardPage() {
  const user = await requireAuth()
  const workspace = await getOrCreateUserWorkspace(user.id, user.email || '')

  if (!workspace) {
    return <div>Error al cargar workspace</div>
  }

  const supabase = await createServerClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, slug, status, updated_at')
    .eq('workspace_id', workspace.workspace_id)
    .order('updated_at', { ascending: false })
    .limit(10) as { data: ProjectListItem[] | null }

  const { count: draftCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspace.workspace_id)
    .eq('status', 'draft')

  const { count: publishedCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspace.workspace_id)
    .eq('status', 'published')

  const { count: archivedCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspace.workspace_id)
    .eq('status', 'archived')

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">DedicaStudio</h1>
            <p className="text-sm text-zinc-400">{user.email}</p>
          </div>
          <Link href="/admin/projects/new">
            <Button className="bg-zinc-50 text-zinc-900 hover:bg-zinc-200">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Proyecto
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">
                Borradores
              </CardTitle>
              <FileText className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-50">{draftCount || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">
                Publicados
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-50">{publishedCount || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">
                Archivados
              </CardTitle>
              <Archive className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-50">{archivedCount || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-50">Proyectos Recientes</CardTitle>
            <CardDescription className="text-zinc-400">
              Tus experiencias más recientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!projects || projects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-zinc-400 mb-4">Aún no tienes proyectos</p>
                <Link href="/admin/projects/new">
                  <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                    Crear tu primer proyecto
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/admin/projects/${project.id}/edit`}
                    className="block p-4 rounded-lg border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-zinc-50">{project.name}</h3>
                        <p className="text-sm text-zinc-400">/p/{project.slug}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            project.status === 'published'
                              ? 'bg-green-950/30 text-green-400 border border-green-900/50'
                              : project.status === 'archived'
                              ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                              : 'bg-yellow-950/30 text-yellow-400 border border-yellow-900/50'
                          }`}
                        >
                          {project.status === 'published'
                            ? 'Publicado'
                            : project.status === 'archived'
                            ? 'Archivado'
                            : 'Borrador'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
