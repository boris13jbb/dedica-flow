import { requireAuth, getOrCreateUserWorkspace } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createProject } from './actions'
import type { Template } from '@/types'

type TemplateListItem = Pick<Template, 'id' | 'name' | 'description' | 'version' | 'is_system'>

export default async function NewProjectPage() {
  const user = await requireAuth()
  const workspace = await getOrCreateUserWorkspace(user.id, user.email || '')

  if (!workspace) {
    return <div>Error al cargar workspace</div>
  }

  const supabase = await createServerClient()

  const { data: templates } = await supabase
    .from('templates')
    .select('id, name, description, version, is_system')
    .eq('is_active', true)
    .or(`is_system.eq.true,workspace_id.eq.${workspace.workspace_id}`) as { data: TemplateListItem[] | null }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/admin"
            className="inline-flex items-center text-sm text-zinc-400 hover:text-zinc-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al dashboard
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Nuevo Proyecto</h1>
          <p className="text-zinc-400">
            Crea una nueva experiencia audiovisual
          </p>
        </div>

        <form action={createProject} className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-50">Información básica</CardTitle>
              <CardDescription className="text-zinc-400">
                Configura los datos principales de tu proyecto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-200">
                  Nombre del proyecto
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Mi experiencia especial"
                  required
                  className="bg-zinc-800 border-zinc-700 text-zinc-50 placeholder:text-zinc-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-zinc-200">
                  URL (slug)
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-400">/p/</span>
                  <Input
                    id="slug"
                    name="slug"
                    type="text"
                    placeholder="mi-experiencia"
                    required
                    pattern="[a-z0-9-]+"
                    title="Solo letras minúsculas, números y guiones"
                    className="bg-zinc-800 border-zinc-700 text-zinc-50 placeholder:text-zinc-500"
                  />
                </div>
                <p className="text-xs text-zinc-500">
                  Solo letras minúsculas, números y guiones. Ejemplo: para-daniela
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-zinc-200">
                  Descripción (opcional)
                </Label>
                <Input
                  id="description"
                  name="description"
                  type="text"
                  placeholder="Una breve descripción de tu proyecto"
                  className="bg-zinc-800 border-zinc-700 text-zinc-50 placeholder:text-zinc-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-50">Plantilla</CardTitle>
              <CardDescription className="text-zinc-400">
                Selecciona una plantilla como punto de partida
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {templates?.map((template) => (
                  <label
                    key={template.id}
                    className="flex items-start p-4 rounded-lg border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name="templateId"
                      value={template.id}
                      required
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-zinc-50">{template.name}</div>
                      {template.description && (
                        <p className="text-sm text-zinc-400 mt-1">
                          {template.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {template.is_system && (
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-950/30 text-blue-400 border border-blue-900/50">
                            Sistema
                          </span>
                        )}
                        <span className="text-xs text-zinc-500">v{template.version}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Link href="/admin" className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              className="flex-1 bg-zinc-50 text-zinc-900 hover:bg-zinc-200"
            >
              Crear Proyecto
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
