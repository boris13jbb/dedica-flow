'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/toast'
import { duplicateProject, getProjectDuplicateDefaults } from '@/app/admin/projects/actions'
import { normalizeSlug } from '@/lib/slug'

interface DuplicateProjectTarget {
  id: string
  name: string
  slug: string
}

interface DuplicateProjectDialogProps {
  project: DuplicateProjectTarget | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DuplicateProjectDialog({
  project,
  open,
  onOpenChange,
}: DuplicateProjectDialogProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !project) return

    let cancelled = false
    void getProjectDuplicateDefaults(project.id)
      .then((defaults) => {
        if (cancelled) return
        setName(defaults.name)
        setSlug(defaults.slug)
      })
      .catch(() => {
        if (cancelled) return
        setName(`Copia de ${project.name}`)
        setSlug(normalizeSlug(`${project.slug}-copia`))
      })

    return () => {
      cancelled = true
    }
  }, [open, project])

  const handleConfirm = async () => {
    if (!project) return
    setLoading(true)
    try {
      const created = await duplicateProject({
        projectId: project.id,
        name,
        slug,
      })
      toast.success('Proyecto duplicado', created.name)
      onOpenChange(false)
      router.refresh()
      router.push(`/admin/projects/${created.id}/edit`)
    } catch (error) {
      toast.error(
        'Error al duplicar',
        error instanceof Error ? error.message : 'Inténtalo de nuevo.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Duplicar proyecto"
      description={
        project
          ? `Se creará un borrador nuevo a partir de “${project.name}”. El original no se modifica.`
          : undefined
      }
      footer={
        <>
          <Button type="button" variant="outline" disabled={loading} onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            loading={loading}
            onClick={() => void handleConfirm()}
            data-testid="duplicate-project-confirm"
          >
            Duplicar
          </Button>
        </>
      }
    >
      <div className="space-y-4" data-testid="duplicate-project-dialog">
        <div className="space-y-2">
          <Label htmlFor="duplicate-name">Nombre</Label>
          <Input
            id="duplicate-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duplicate-slug">Slug</Label>
          <Input
            id="duplicate-slug"
            value={slug}
            onChange={(event) => setSlug(normalizeSlug(event.target.value))}
          />
          <p className="text-xs text-df-muted-fg">/p/{slug || '…'}</p>
        </div>
      </div>
    </Dialog>
  )
}
