'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Upload, Trash2, Image as ImageIcon, Music, Film } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

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
}

export function MediaLibrary({
  projectId,
  assets,
  onAssetSelect,
  onRefresh,
  filterType = 'all',
}: MediaLibraryProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>('')

  const filteredAssets =
    filterType === 'all' ? assets : assets.filter((a) => a.type === filterType)

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
          throw new Error(error.message || 'Error al subir archivo')
        }
      }

      setUploadProgress('¡Completado!')
      setTimeout(() => {
        setUploadProgress('')
        onRefresh?.()
      }, 1000)
    } catch (error) {
      console.error('Error uploading:', error)
      alert(error instanceof Error ? error.message : 'Error al subir archivo')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (assetId: string) => {
    if (!confirm('¿Estás seguro de eliminar este archivo?')) return

    try {
      const response = await fetch(`/api/media/${assetId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al eliminar archivo')
      }

      onRefresh?.()
    } catch (error) {
      console.error('Error deleting:', error)
      alert(error instanceof Error ? error.message : 'Error al eliminar archivo')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4" />
      case 'audio':
        return <Music className="w-4 h-4" />
      case 'video':
        return <Film className="w-4 h-4" />
      default:
        return null
    }
  }

  const acceptTypes =
    filterType === 'image'
      ? 'image/jpeg,image/jpg,image/png,image/gif,image/webp'
      : filterType === 'audio'
      ? 'audio/mpeg,audio/mp3,audio/wav,audio/ogg'
      : filterType === 'video'
      ? 'video/mp4,video/webm'
      : 'image/*,audio/*,video/*'

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center hover:border-zinc-600 transition-colors">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          multiple
          accept={acceptTypes}
          onChange={handleFileUpload}
          disabled={uploading}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          <Upload className="w-8 h-8 text-zinc-400" />
          <div>
            <p className="text-sm font-medium text-zinc-300">
              {uploading ? uploadProgress : 'Haz clic para subir archivos'}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {filterType === 'all' && 'Imágenes, audio o video'}
              {filterType === 'image' && 'JPG, PNG, GIF, WEBP hasta 50MB'}
              {filterType === 'audio' && 'MP3, WAV, OGG hasta 50MB'}
              {filterType === 'video' && 'MP4, WEBM hasta 50MB'}
            </p>
          </div>
        </label>
      </div>

      {/* Assets grid */}
      {filteredAssets.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          <p>No hay archivos</p>
          <p className="text-sm mt-1">Sube tu primer archivo para comenzar</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => (
            <Card
              key={asset.id}
              className="group relative overflow-hidden bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              {/* Preview */}
              <div className="aspect-video bg-zinc-950 flex items-center justify-center relative">
                {asset.type === 'image' ? (
                  <Image
                    src={asset.url}
                    alt={asset.original_name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="text-zinc-600">{getIcon(asset.type)}</div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-xs font-medium text-zinc-300 truncate">
                  {asset.original_name}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {formatFileSize(asset.size_bytes)}
                </p>
              </div>

              {/* Actions */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                {onAssetSelect && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => onAssetSelect(asset)}
                    className="h-7 px-2 bg-amber-600/90 hover:bg-amber-500 text-zinc-950"
                  >
                    Usar
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDelete(asset.id)}
                  className="h-7 w-7 p-0 bg-zinc-900/90 hover:bg-red-900"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
