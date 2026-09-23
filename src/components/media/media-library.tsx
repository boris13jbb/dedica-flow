'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Upload, Trash2, Image as ImageIcon, Music, Film } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { ConfirmDialog } from '@/components/ui/dialog'
import { toast } from '@/components/ui/toast'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { mediaConfig } from '@/config'
import { formatFileSize } from '@/lib/format'
import { cn } from '@/lib/utils'

interface Asset {
  id: string
  type: 'image' | 'audio' | 'video'
  original_name: string
  mime_type: string
  size_bytes: number
  url: string
  created_at: string
}

interface MediaLibraryProps {
  projectId: string
  assets: Asset[]
  onAssetSelect?: (asset: Asset) => void
  onRefresh?: () => void
  filterType?: 'image' | 'audio' | 'video' | 'all'
  /** Si true, muestra tabs Todos/Imágenes/Videos/Audios (solo cuando filterType=all) */
  showTabs?: boolean
}

export function MediaLibrary({
  projectId,
  assets,
  onAssetSelect,
  onRefresh,
  filterType = 'all',
  showTabs = false,
}: MediaLibraryProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [tab, setTab] = useState<'all' | 'image' | 'audio' | 'video'>(
    filterType === 'all' ? 'all' : filterType
  )
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const activeFilter = filterType !== 'all' ? filterType : tab

  const filteredAssets = useMemo(
    () =>
      activeFilter === 'all'
        ? assets
        : assets.filter((a) => a.type === activeFilter),
    [assets, activeFilter]
  )

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setUploadProgress(`Subiendo ${i + 1}/${files.length}: ${file.name}`)

        const formData = new FormData()
        formData.append('file', file)
        formData.append('projectId', projectId)

        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(
            (error as { message?: string }).message || 'Error al subir archivo'
          )
        }
      }

      setUploadProgress('¡Completado!')
      toast.success('Archivos subidos')
      setTimeout(() => {
        setUploadProgress('')
        onRefresh?.()
      }, 800)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al subir archivo'
      )
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const response = await fetch(`/api/media/${deleteId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(
          (error as { message?: string }).message || 'Error al eliminar archivo'
        )
      }

      toast.success('Archivo eliminado')
      onRefresh?.()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al eliminar archivo'
      )
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="size-5" />
      case 'audio':
        return <Music className="size-5" />
      case 'video':
        return <Film className="size-5" />
      default:
        return null
    }
  }

  const acceptTypes =
    activeFilter === 'image'
      ? mediaConfig.allowedMimeTypes.image.join(',')
      : activeFilter === 'audio'
        ? mediaConfig.allowedMimeTypes.audio.join(',')
        : activeFilter === 'video'
          ? mediaConfig.allowedMimeTypes.video.join(',')
          : [
              ...mediaConfig.allowedMimeTypes.image,
              ...mediaConfig.allowedMimeTypes.audio,
              ...mediaConfig.allowedMimeTypes.video,
            ].join(',')

  const limitHint =
    activeFilter === 'image'
      ? `JPG, PNG, GIF, WEBP · máx. ${formatFileSize(mediaConfig.maxFileSize.image)}`
      : activeFilter === 'audio'
        ? `MP3, WAV, OGG · máx. ${formatFileSize(mediaConfig.maxFileSize.audio)}`
        : activeFilter === 'video'
          ? `MP4, WEBM · máx. ${formatFileSize(mediaConfig.maxFileSize.video)}`
          : 'Imágenes, audio o video según límites del proyecto'

  const uploadId = `file-upload-${projectId}-${activeFilter}`

  return (
    <div className="space-y-4">
      {showTabs && filterType === 'all' && (
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="flex h-auto w-full flex-wrap justify-start sm:w-auto">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="image">Imágenes</TabsTrigger>
            <TabsTrigger value="video">Videos</TabsTrigger>
            <TabsTrigger value="audio">Audios</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <div className="df-upload-zone p-6 text-center sm:p-8">
        <input
          type="file"
          id={uploadId}
          className="hidden"
          multiple
          accept={acceptTypes}
          onChange={handleFileUpload}
          disabled={uploading}
        />
        <label
          htmlFor={uploadId}
          className={cn(
            'flex cursor-pointer flex-col items-center gap-2',
            uploading && 'pointer-events-none opacity-60'
          )}
        >
          <Upload className="size-8 text-df-muted" />
          <div>
            <p className="text-sm font-medium text-df-fg">
              {uploading
                ? uploadProgress
                : 'Arrastra archivos o haz clic para seleccionar'}
            </p>
            <p className="mt-1 text-xs text-df-muted-fg">{limitHint}</p>
          </div>
        </label>
      </div>

      {filteredAssets.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="size-5" />}
          title="No hay archivos"
          description="Sube tu primer archivo para comenzar."
          className="py-10"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAssets.map((asset) => (
            <Card
              key={asset.id}
              className="group relative overflow-hidden bg-df-surface shadow-none transition-colors hover:border-df-border-hover"
            >
              <div className="relative flex aspect-[4/3] items-center justify-center bg-df-bg">
                {asset.type === 'image' ? (
                  <Image
                    src={asset.url}
                    alt={asset.original_name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="text-df-muted-fg">{getIcon(asset.type)}</div>
                )}
              </div>

              <div className="p-3">
                <p className="truncate text-sm font-medium text-df-fg">
                  {asset.original_name}
                </p>
                <p className="mt-1 text-xs text-df-muted-fg">
                  {formatFileSize(asset.size_bytes)}
                </p>
              </div>

              <div className="absolute right-2 top-2 flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                {onAssetSelect && (
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    onClick={() => onAssetSelect(asset)}
                    className="h-7 px-2 text-xs"
                  >
                    Usar
                  </Button>
                )}
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setDeleteId(asset.id)}
                  aria-label="Eliminar archivo"
                  className="h-7 w-7 text-df-muted hover:text-df-error"
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null)
        }}
        title="Eliminar archivo"
        description="Esta acción no se puede deshacer. El archivo se eliminará del almacenamiento."
        confirmLabel="Eliminar"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  )
}
