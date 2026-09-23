'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useFormStatus } from 'react-dom'
import { Check, LayoutTemplate } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { appConfig } from '@/config'

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={disabled || pending} loading={pending} className="h-11 sm:flex-1">
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
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]?.id ?? '')

  const errorMessage = useMemo(
    () => (errorCode ? ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.create : null),
    [errorCode]
  )

  const publicPreview = `${appConfig.url}/p/${slug || 'tu-experiencia'}`

  return (
    <form action={action} className="mx-auto max-w-3xl space-y-6">
      {errorMessage && (
        <div
          role="alert"
          className="rounded-[var(--radius-lg)] border border-df-error/40 bg-df-error/10 px-4 py-3 text-sm text-red-200"
        >
          {errorMessage}
        </div>
      )}

      <section className="rounded-[var(--radius-xl)] border border-df-border bg-df-card p-5 sm:p-6">
        <h2 className="text-base font-semibold text-df-fg">Datos del proyecto</h2>
        <p className="mt-1 text-sm text-df-muted">
          Si la URL ya existe, el sistema le agregará un sufijo automáticamente.
        </p>

        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del proyecto</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => {
                const next = e.target.value
                setName(next)
                if (!slugTouched) setSlug(slugify(next))
              }}
              placeholder="Ej. Aniversario Daniela"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL pública (slug)</Label>
            <div className="flex items-center gap-2">
              <span className="shrink-0 rounded-[var(--radius-md)] border border-df-border bg-df-surface px-3 py-2.5 text-sm text-df-muted-fg">
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
              />
            </div>
            <p className="flex items-start gap-1.5 text-xs text-df-muted">
              {slug ? (
                <>
                  <Check className="mt-0.5 size-3.5 shrink-0 text-df-success" aria-hidden />
                  <span className="break-all">
                    Vista pública: <span className="text-df-fg">{publicPreview}</span>
                  </span>
                </>
              ) : (
                'Solo minúsculas, números y guiones. Ejemplo: para-ti-2026'
              )}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Una breve descripción interna"
              rows={2}
            />
          </div>
        </div>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-df-border bg-df-card p-5 sm:p-6">
        <h2 className="text-base font-semibold text-df-fg">Plantilla</h2>
        <p className="mt-1 text-sm text-df-muted">
          Empieza con una estructura lista: intro, galaxia, flores, mensaje y final.
        </p>

        <input type="hidden" name="templateId" value={selectedTemplate} />

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {templates.length === 0 ? (
            <p className="col-span-full rounded-[var(--radius-lg)] border border-df-warning/30 bg-df-warning/10 p-4 text-sm text-df-fg">
              No hay plantillas disponibles. Contacta al administrador o ejecuta el seed de
              Supabase.
            </p>
          ) : (
            templates.map((template) => {
              const selected = selectedTemplate === template.id
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedTemplate(template.id)}
                  className={cn(
                    'flex cursor-pointer flex-col items-start rounded-[var(--radius-xl)] border p-4 text-left transition-colors',
                    selected
                      ? 'border-df-primary/50 bg-df-primary/10 ring-1 ring-df-primary/30'
                      : 'border-df-border bg-df-surface/50 hover:border-df-border-hover hover:bg-df-card-hover'
                  )}
                >
                  <span className="mb-3 flex size-10 items-center justify-center rounded-[var(--radius-lg)] bg-df-bg text-df-primary ring-1 ring-df-border">
                    <LayoutTemplate className="size-5" />
                  </span>
                  <span className="font-medium text-df-fg">{template.name}</span>
                  {template.description && (
                    <span className="mt-1 line-clamp-2 text-sm text-df-muted">
                      {template.description}
                    </span>
                  )}
                  <span className="mt-3 flex flex-wrap items-center gap-2">
                    {template.is_system && <Badge variant="info">Recomendada</Badge>}
                    <span className="text-xs text-df-muted-fg">v{template.version}</span>
                  </span>
                </button>
              )
            })
          )}
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <Link
          href={cancelHref}
          className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-11 sm:flex-1')}
        >
          Cancelar
        </Link>
        <SubmitButton disabled={templates.length === 0 || !selectedTemplate} />
      </div>
    </form>
  )
}
