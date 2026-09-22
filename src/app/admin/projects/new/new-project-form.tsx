'use client'

import { useMemo, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={disabled || pending}
      className="h-11 sm:flex-1 bg-amber-400 text-zinc-950 hover:bg-amber-300 disabled:opacity-60"
    >
      {pending ? 'Creando proyecto…' : 'Crear y abrir editor'}
    </Button>
  )
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

const ERROR_MESSAGES: Record<string, string> = {
  workspace: 'No se pudo cargar tu espacio de trabajo. Recarga e inténtalo de nuevo.',
  name: 'Escribe un nombre para el proyecto.',
  slug: 'La URL pública no es válida. Usa solo letras, números y guiones.',
  template: 'Selecciona una plantilla válida.',
  create: 'No se pudo crear el proyecto. Prueba con otra URL o recarga la página.',
  scenes: 'El proyecto se creó mal. Inténtalo otra vez.',
}

interface NewProjectFormProps {
  templates: Array<{
    id: string
    name: string
    description: string | null
    version: string
    is_system: boolean
  }>
  errorCode?: string | null
  action: (formData: FormData) => Promise<void>
  cancelHref: string
}

export function NewProjectForm({
  templates,
  errorCode,
  action,
  cancelHref,
}: NewProjectFormProps) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)

  const errorMessage = useMemo(
    () => (errorCode ? ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.create : null),
    [errorCode]
  )

  return (
    <form action={action} className="mx-auto max-w-3xl space-y-6">
      {errorMessage && (
        <div className="rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {errorMessage}
        </div>
      )}

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-zinc-50">Datos del proyecto</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Si la URL ya existe, el sistema le agregará un número automáticamente.
        </p>

        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-200">
              Nombre
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => {
                const next = e.target.value
                setName(next)
                if (!slugTouched) {
                  setSlug(slugify(next))
                }
              }}
              placeholder="Ej. Aniversario Daniela"
              required
              className="h-11 border-zinc-700 bg-zinc-950 text-zinc-50 placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="text-zinc-200">
              URL pública (slug)
            </Label>
            <div className="flex items-center gap-2">
              <span className="shrink-0 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-500">
                /p/
              </span>
              <Input
                id="slug"
                name="slug"
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  setSlug(slugify(e.target.value))
                }}
                placeholder="aniversario-daniela"
                required
                pattern="[a-z0-9-]+"
                title="Solo letras minúsculas, números y guiones"
                className="h-11 border-zinc-700 bg-zinc-950 text-zinc-50 placeholder:text-zinc-500"
              />
            </div>
            <p className="text-xs text-zinc-500">
              Solo minúsculas, números y guiones. Ejemplo: `para-ti-2026`
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
              placeholder="Una breve descripción interna"
              className="h-11 border-zinc-700 bg-zinc-950 text-zinc-50 placeholder:text-zinc-500"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-zinc-50">Plantilla</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Empieza con una estructura lista: intro, galaxia, flores, mensaje y final.
        </p>

        <div className="mt-5 space-y-3">
          {templates.length === 0 ? (
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
              No hay plantillas disponibles. Contacta al administrador o ejecuta el seed de
              Supabase.
            </p>
          ) : (
            templates.map((template, index) => (
              <label
                key={template.id}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 transition hover:border-amber-500/40 hover:bg-zinc-950"
              >
                <input
                  type="radio"
                  name="templateId"
                  value={template.id}
                  required
                  defaultChecked={index === 0}
                  className="mt-1 accent-amber-400"
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-zinc-50">{template.name}</span>
                  {template.description && (
                    <span className="mt-1 block text-sm text-zinc-400">
                      {template.description}
                    </span>
                  )}
                  <span className="mt-2 flex flex-wrap items-center gap-2">
                    {template.is_system && (
                      <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-xs text-sky-300 ring-1 ring-sky-500/30">
                        Recomendada
                      </span>
                    )}
                    <span className="text-xs text-zinc-500">v{template.version}</span>
                  </span>
                </span>
              </label>
            ))
          )}
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <a href={cancelHref} className="sm:flex-1">
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50"
          >
            Cancelar
          </Button>
        </a>
        <SubmitButton disabled={templates.length === 0} />
      </div>
    </form>
  )
}
