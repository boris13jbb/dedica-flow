'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import { MediaLibrary, type MediaAsset } from '@/components/media/media-library'
import { getProjectAssets } from '@/app/admin/projects/[id]/media/actions'
import { mergeUniqueUrls } from '@/lib/scene-builder'

interface MediaPickerProps {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'single' | 'multiple'
  selectedUrls: string[]
  onConfirm: (urls: string[]) => void
  title?: string
  description?: string
  maxSelection?: number
}

export function MediaPicker({
  projectId,
  open,
  onOpenChange,
  mode,
  selectedUrls,
  onConfirm,
  title = 'Seleccionar de Biblioteca',
  description = 'Elige imágenes ya subidas o carga otras nuevas.',
  maxSelection,
}: MediaPickerProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [draftUrls, setDraftUrls] = useState<string[]>(selectedUrls)
  const [wasOpen, setWasOpen] = useState(false)
  const [reloadTick, setReloadTick] = useState(0)

  if (open && !wasOpen) {
    setWasOpen(true)
    setDraftUrls(selectedUrls)
    setQuery('')
    setLoading(true)
  }
  if (!open && wasOpen) {
    setWasOpen(false)
  }

  useEffect(() => {
    if (!open) return

    let cancelled = false
    getProjectAssets(projectId)
      .then((next) => {
        if (cancelled) return
        setAssets(
          next.map((asset) => ({
            id: asset.id,
            type: asset.type as MediaAsset['type'],
            original_name: asset.original_name,
            mime_type: asset.mime_type,
            size_bytes: asset.size_bytes,
            url: asset.url,
            created_at: asset.created_at,
          }))
        )
        setLoading(false)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        toast.error(
          error instanceof Error ? error.message : 'No se pudieron cargar los archivos'
        )
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, projectId, reloadTick])

  const handleToggle = (url: string) => {
    if (mode === 'single') {
      setDraftUrls((current) => (current[0] === url ? [] : [url]))
      return
    }

    setDraftUrls((current) => {
      if (current.includes(url)) {
        return current.filter((item) => item !== url)
      }
      return mergeUniqueUrls(current, [url], maxSelection)
    })
  }

  const handleConfirm = () => {
    onConfirm(draftUrls)
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      className="sm:max-w-3xl"
      footer={
        <>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirm}
            data-testid="media-picker-confirm"
          >
            Confirmar
            {draftUrls.length > 0 ? ` (${draftUrls.length})` : ''}
          </Button>
        </>
      }
    >
      <div className="space-y-4" data-testid="media-picker">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nombre…"
          aria-label="Buscar en biblioteca"
        />
        {loading ? (
          <p className="py-8 text-center text-sm text-df-muted">Cargando biblioteca…</p>
        ) : (
          <MediaLibrary
            projectId={projectId}
            assets={assets}
            onRefresh={() => {
              setLoading(true)
              setReloadTick((tick) => tick + 1)
            }}
            filterType="image"
            selectionMode={mode}
            selectedUrls={draftUrls}
            onToggleUrl={handleToggle}
            hideDelete
            searchQuery={query}
          />
        )}
      </div>
    </Dialog>
  )
}
