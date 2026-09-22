'use client'

import { useRouter } from 'next/navigation'
import { ImageIcon } from 'lucide-react'
import { MediaLibrary } from '@/components/media'
import { ProjectAudioPanel } from '@/components/media/project-audio-panel'
import { Badge } from '@/components/ui/badge'
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
    <div className="space-y-8">
      <ProjectAudioPanel
        projectId={projectId}
        assets={assets}
        initialAudio={initialAudio}
        onRefresh={refresh}
      />

      <section
        aria-labelledby="biblioteca-title"
        className="overflow-hidden rounded-[var(--radius-xl)] border border-df-border bg-df-card"
      >
        <div className="border-b border-df-border px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-df-info/15 text-df-info">
              <ImageIcon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-df-info/80">
                Biblioteca de medios
              </p>
              <h2 id="biblioteca-title" className="text-xl font-semibold text-df-fg">
                Imágenes, videos y audios
              </h2>
              <p className="mt-1 text-sm text-df-muted">
                Sube fotos y videos para las escenas. El audio de fondo se gestiona arriba.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="default">{imageCount} imágenes</Badge>
            <Badge variant="default">{audioCount} audios</Badge>
            <Badge variant="default">{videoCount} videos</Badge>
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
