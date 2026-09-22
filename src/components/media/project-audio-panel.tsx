'use client'

import { useMemo, useRef, useState, useTransition } from 'react'
import {
  Music,
  CheckCircle2,
  Volume2,
  Loader2,
  Upload,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MediaLibrary } from '@/components/media'
import { updateProjectAudioConfig } from '@/app/admin/projects/[id]/media/actions'
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

/**
 * Apartado dedicado: subir y asignar la música de fondo de la experiencia.
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
        console.error(err)
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
        throw new Error(data.message || 'Error al subir el audio')
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
      console.error(err)
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
      className="overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-400/[0.07] to-zinc-950"
    >
      <div className="border-b border-amber-500/20 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-zinc-950">
            <Music className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-amber-300/90">
              Apartado de audio
            </p>
            <h2
              id="audio-experiencia-title"
              className="text-xl font-semibold text-zinc-50"
            >
              Insertar música de la experiencia
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Sube un MP3, WAV u OGG. Este archivo sonará de fondo cuando alguien
              abra el enlace público.
            </p>
          </div>
          {selected ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300 ring-1 ring-emerald-500/30">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Audio activo
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-400 ring-1 ring-zinc-700">
              Sin audio
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        {/* Zona de subida dedicada */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/*"
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
            className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-amber-400/40 bg-zinc-950/60 px-6 py-10 text-center transition hover:border-amber-400/70 hover:bg-zinc-950 disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
            ) : (
              <Upload className="h-8 w-8 text-amber-400" />
            )}
            <div>
              <p className="text-base font-semibold text-zinc-50">
                {uploading
                  ? 'Subiendo audio…'
                  : 'Haz clic para subir tu audio'}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                MP3, WAV u OGG · máximo 50 MB
              </p>
            </div>
          </button>
        </div>

        {selected && (
          <div className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-zinc-500">Archivo asignado</p>
                <p className="font-medium text-zinc-100">
                  {selected.original_name}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-zinc-600"
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

        <div className="grid gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:grid-cols-2">
          <p className="sm:col-span-2 text-sm font-medium text-zinc-300">
            Ajustes de reproducción
          </p>

          <label className="block text-sm text-zinc-300">
            <span className="mb-2 flex items-center gap-1.5">
              <Volume2 className="h-4 w-4" />
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
              className="w-full accent-amber-400"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-zinc-300 sm:mt-7">
            <input
              type="checkbox"
              checked={loop}
              className="accent-amber-400"
              onChange={(e) => {
                const next = e.target.checked
                setLoop(next)
                save({ loop: next })
              }}
            />
            Repetir en bucle
          </label>

          <label className="block text-sm text-zinc-300">
            Fade in (ms)
            <input
              type="number"
              min={0}
              max={10000}
              step={100}
              value={fadeIn}
              onChange={(e) => setFadeIn(Number(e.target.value))}
              onBlur={() => save({ fadeIn })}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
            />
          </label>

          <label className="block text-sm text-zinc-300">
            Fade out (ms)
            <input
              type="number"
              min={0}
              max={10000}
              step={100}
              value={fadeOut}
              onChange={(e) => setFadeOut(Number(e.target.value))}
              onBlur={() => save({ fadeOut })}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
            />
          </label>
        </div>

        {(message || error) && (
          <div
            className={[
              'flex items-start gap-2 rounded-lg px-3 py-2 text-sm',
              error
                ? 'bg-red-500/10 text-red-300'
                : 'bg-emerald-500/10 text-emerald-300',
            ].join(' ')}
          >
            {error ? (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>{error || message}</span>
          </div>
        )}

        <div>
          <h3 className="mb-1 text-sm font-semibold text-zinc-200">
            O elige un audio ya subido
          </h3>
          <p className="mb-3 text-xs text-zinc-500">
            Pulsa <strong className="text-zinc-300">Usar</strong> en la tarjeta
            del archivo.
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
