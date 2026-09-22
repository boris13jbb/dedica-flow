'use client'

import { useRouter } from 'next/navigation'
import { ImageIcon } from 'lucide-react'
import { MediaLibrary } from '@/components/media'
import { ProjectAudioPanel } from '@/components/media/project-audio-panel'
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

export function MediaPageClient({
  projectId,
  assets,
  initialAudio,
}: {
  projectId: string
  assets: Asset[]
  initialAudio?: Partial<AudioConfig> | null
}) {
  const router = useRouter()
  const refresh = () => router.refresh()

  const imageCount = assets.filter((a) => a.type === 'image').length
  const audioCount = assets.filter((a) => a.type === 'audio').length
  const videoCount = assets.filter((a) => a.type === 'video').length

  return (
    <div className="space-y-10">
      {/* SECCIÓN A — Audio (destacada) */}
      <ProjectAudioPanel
        projectId={projectId}
        assets={assets}
        initialAudio={initialAudio}
        onRefresh={refresh}
      />

      {/* SECCIÓN B — Biblioteca general */}
      <section
        aria-labelledby="biblioteca-title"
        className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40"
      >
        <div className="border-b border-zinc-800 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
              <ImageIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-sky-300/80">
                Apartado de medios
              </p>
              <h2
                id="biblioteca-title"
                className="text-xl font-semibold text-zinc-50"
              >
                Biblioteca de imágenes y archivos
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Aquí subes fotos y videos para las escenas. El audio de fondo se
                gestiona en el apartado de arriba.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
              {imageCount} imágenes
            </span>
            <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
              {audioCount} audios
            </span>
            <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
              {videoCount} videos
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <MediaLibrary
            projectId={projectId}
            assets={assets}
            onRefresh={refresh}
          />
        </div>
      </section>
    </div>
  )
}
