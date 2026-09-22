'use client'

import { useMemo, useRef, useState, useTransition } from 'react'
import {
  Music,
  CheckCircle2,
  Volume2,
  Upload,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/icon-button'
import { MediaLibrary } from '@/components/media'
import { updateProjectAudioConfig } from '@/app/admin/projects/[id]/media/actions'
import { mediaConfig } from '@/config'
import { formatFileSize } from '@/lib/format'
import type { AudioConfig } from '@/types'

interface Asset {
  id: string
  type: 'image' | 'audio' | 'video'
  original_name: string
  mime_type: string
  size_bytes: number
  url: string
  created_at: string
}

interface ProjectAudioPanelProps {
  projectId: string
  assets: Asset[]
  initialAudio?: Partial<AudioConfig> | null
  onRefresh?: () => void
}

const AUDIO_MAX_LABEL = formatFileSize(mediaConfig.maxFileSize.audio)

/**
 * Apartado dedicado: subir y asignar la música de fondo de la experiencia.
 * Lógica de negocio intacta; solo presentación DedicaFlow.
 */
export function ProjectAudioPanel({
  projectId,
  assets,
  initialAudio,
  onRefresh,
}: ProjectAudioPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)
  const [assetId, setAssetId] = useState<string | undefined>(
    initialAudio?.assetId
  )
  const [volume, setVolume] = useState(initialAudio?.volume ?? 0.7)
  const [loop, setLoop] = useState(initialAudio?.loop ?? true)
  const [fadeIn, setFadeIn] = useState(initialAudio?.fadeIn ?? 2000)
  const [fadeOut, setFadeOut] = useState(initialAudio?.fadeOut ?? 2000)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const selected = useMemo(
    () => assets.find((a) => a.id === assetId && a.type === 'audio') ?? null,
    [assets, assetId]
  )

  const save = (next?: {
    assetId?: string | null
    volume?: number
    loop?: boolean
    fadeIn?: number
    fadeOut?: number
  }) => {
    const payload = {
      assetId:
        next && 'assetId' in next
          ? (next.assetId as string | null | undefined)
          : assetId,
      volume: next?.volume ?? volume,
      loop: next?.loop ?? loop,
      fadeIn: next?.fadeIn ?? fadeIn,
      fadeOut: next?.fadeOut ?? fadeOut,
    }

    startTransition(async () => {
      try {
        setError(null)
        await updateProjectAudioConfig(projectId, payload)
        setMessage('Audio guardado. Publica el proyecto para que suene en vivo.')
        onRefresh?.()
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'No se pudo guardar el audio'
        )
      }
    })
  }

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      setError('Solo se permiten archivos de audio (MP3, WAV, OGG).')
      return
    }
    if (file.size > mediaConfig.maxFileSize.audio) {
      setError(`El audio supera el máximo de ${AUDIO_MAX_LABEL}.`)
      return
    }

    setUploading(true)
    setError(null)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', projectId)

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(
          (data as { message?: string }).message || 'Error al subir el audio'
        )
      }

      const uploaded = await response.json()
      const newId = uploaded.id as string | undefined
      if (newId) {
        setAssetId(newId)
        await updateProjectAudioConfig(projectId, {
          assetId: newId,
          volume,
          loop,
          fadeIn,
          fadeOut,
        })
        setMessage('Audio subido y asignado a la experiencia.')
      }
      onRefresh?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir el audio')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <section
      id="audio-experiencia"
      aria-labelledby="audio-experiencia-title"
      className="overflow-hidden rounded-[var(--radius-xl)] border border-df-primary/35 bg-gradient-to-b from-df-primary/[0.08] to-df-card"
    >
      <div className="border-b border-df-primary/20 px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-df-primary text-df-primary-fg shadow-[var(--shadow-glow)]">
            <Music className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-df-primary-light">
              Audio de la experiencia
            </p>
            <h2
              id="audio-experiencia-title"
              className="text-xl font-semibold text-df-fg sm:text-2xl"
            >
              Sube la música de fondo
            </h2>
            <p className="mt-1.5 text-sm text-df-muted">
              Este archivo sonará cuando alguien abra el enlace público. Es el
              paso 2 del flujo: Escenas → Audio → Publicar.
            </p>
          </div>
          {selected ? (
            <Badge variant="success" dot>
              Audio activo
            </Badge>
          ) : (
            <Badge variant="warning" dot>
              Sin audio
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={mediaConfig.allowedMimeTypes.audio.join(',')}
            className="hidden"
            disabled={uploading || pending}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleUpload(file)
            }}
          />
          <button
            type="button"
            disabled={uploading || pending}
            onClick={() => fileInputRef.current?.click()}
            className="flex min-h-[160px] w-full flex-col items-center justify-center gap-3 rounded-[var(--radius-xl)] border-2 border-dashed border-df-primary/45 bg-df-bg/70 px-6 py-10 text-center transition-colors hover:border-df-primary hover:bg-df-bg disabled:opacity-60"
          >
            {uploading ? (
              <Spinner className="size-8" label="Subiendo audio" />
            ) : (
              <Upload className="size-8 text-df-primary" />
            )}
            <div>
              <p className="text-base font-semibold text-df-fg">
                {uploading ? 'Subiendo audio…' : 'Haz clic para subir tu audio'}
              </p>
              <p className="mt-1 text-sm text-df-muted">
                MP3, WAV u OGG · máximo {AUDIO_MAX_LABEL}
              </p>
            </div>
          </button>
        </div>

        {selected && (
          <div className="rounded-[var(--radius-lg)] border border-df-border bg-df-surface p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-df-muted-fg">Archivo asignado</p>
                <p className="font-medium text-df-fg">{selected.original_name}</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => {
                  setAssetId(undefined)
                  save({ assetId: null })
                }}
              >
                Quitar audio
              </Button>
            </div>
            <audio
              controls
              className="w-full"
              src={selected.url}
              preload="metadata"
            />
          </div>
        )}

        <div className="grid gap-4 rounded-[var(--radius-lg)] border border-df-border bg-df-surface/50 p-4 sm:grid-cols-2">
          <p className="text-sm font-medium text-df-fg sm:col-span-2">
            Ajustes de reproducción
          </p>

          <label className="block text-sm text-df-muted">
            <span className="mb-2 flex items-center gap-1.5 text-df-fg">
              <Volume2 className="size-4" />
              Volumen ({Math.round(volume * 100)}%)
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              onMouseUp={() => save({ volume })}
              onTouchEnd={() => save({ volume })}
              className="w-full accent-[var(--primary)]"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-df-fg sm:mt-7">
            <input
              type="checkbox"
              checked={loop}
              className="size-4 accent-[var(--primary)]"
              onChange={(e) => {
                const next = e.target.checked
                setLoop(next)
                save({ loop: next })
              }}
            />
            Repetir en bucle
          </label>

          <div className="space-y-2">
            <Label htmlFor="fade-in">Fade in (ms)</Label>
            <Input
              id="fade-in"
              type="number"
              min={0}
              max={10000}
              step={100}
              value={fadeIn}
              onChange={(e) => setFadeIn(Number(e.target.value))}
              onBlur={() => save({ fadeIn })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fade-out">Fade out (ms)</Label>
            <Input
              id="fade-out"
              type="number"
              min={0}
              max={10000}
              step={100}
              value={fadeOut}
              onChange={(e) => setFadeOut(Number(e.target.value))}
              onBlur={() => save({ fadeOut })}
            />
          </div>
        </div>

        {(message || error) && (
          <div
            role={error ? 'alert' : 'status'}
            className={[
              'flex items-start gap-2 rounded-[var(--radius-md)] px-3 py-2.5 text-sm',
              error
                ? 'bg-df-error/10 text-red-300'
                : 'bg-df-success/10 text-emerald-300',
            ].join(' ')}
          >
            {error ? (
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
            ) : (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            )}
            <span>{error || message}</span>
          </div>
        )}

        <div>
          <h3 className="mb-1 text-sm font-semibold text-df-fg">
            O elige un audio ya subido
          </h3>
          <p className="mb-3 text-xs text-df-muted">
            Pulsa <strong className="text-df-fg">Usar</strong> en la tarjeta del
            archivo.
          </p>
          <MediaLibrary
            projectId={projectId}
            assets={assets}
            filterType="audio"
            onRefresh={onRefresh}
            onAssetSelect={(asset) => {
              if (asset.type !== 'audio') return
              setAssetId(asset.id)
              save({ assetId: asset.id })
            }}
          />
        </div>
      </div>
    </section>
  )
}
