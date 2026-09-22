'use client'

import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Monitor, Smartphone, Tablet, Play, Pause, RotateCcw } from 'lucide-react'
import { ExperienceRenderer } from '@/components/experience/renderer'
import { useRendererStore } from '@/stores'
import { IconButton } from '@/components/ui/icon-button'
import { cn } from '@/lib/utils'
import type { Scene } from '@/types'
import type { ExperienceConfig } from '@/types'

interface PreviewPanelProps {
  device: 'desktop' | 'tablet' | 'mobile'
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void
  projectName: string
  projectSlug: string
  scenes: Scene[]
}

export function PreviewPanel({
  device,
  onDeviceChange,
  projectName,
  projectSlug,
  scenes,
}: PreviewPanelProps) {
  const { isPlaying, play, pause, restart } = useRendererStore(
    useShallow((s) => ({
      isPlaying: s.isPlaying,
      play: s.play,
      pause: s.pause,
      restart: s.restart,
    }))
  )

  const experienceConfig: ExperienceConfig = useMemo(
    () => ({
      projectId: scenes[0]?.project_id || '',
      name: projectName,
      slug: projectSlug,
      scenes: scenes
        .filter((s) => s.enabled)
        .sort((a, b) => a.position - b.position)
        .map((scene) => ({
          id: scene.id,
          sceneKey: scene.scene_key,
          sceneType: scene.scene_type as never,
          name: scene.name,
          position: scene.position,
          duration: {
            enter: 1000,
            hold: scene.duration_ms,
            exit: 1000,
          },
          trigger: scene.trigger_mode as 'auto' | 'click' | 'manual',
          enabled: scene.enabled,
          config: scene.config as Record<string, unknown>,
        })),
    }),
    [scenes, projectName, projectSlug]
  )

  const hasScenes = scenes.length > 0 && scenes.some((s) => s.enabled)

  const deviceBtn = (id: typeof device, label: string, Icon: typeof Monitor) => (
    <IconButton
      type="button"
      label={label}
      size="sm"
      variant={device === id ? 'secondary' : 'ghost'}
      onClick={() => onDeviceChange(id)}
      className={cn(device === id && 'bg-df-card text-df-fg')}
    >
      <Icon />
    </IconButton>
  )

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-df-border px-3 py-2.5 sm:px-4">
        <h2 className="text-sm font-semibold text-df-fg sm:text-base">Vista previa</h2>

        <div className="flex items-center gap-2">
          {hasScenes && (
            <div className="flex items-center gap-0.5 rounded-[var(--radius-lg)] border border-df-border bg-df-surface p-0.5">
              <IconButton
                type="button"
                label="Reiniciar"
                size="sm"
                variant="ghost"
                onClick={restart}
              >
                <RotateCcw />
              </IconButton>
              <IconButton
                type="button"
                label={isPlaying ? 'Pausar' : 'Reproducir'}
                size="sm"
                variant="ghost"
                onClick={isPlaying ? pause : play}
              >
                {isPlaying ? <Pause /> : <Play />}
              </IconButton>
            </div>
          )}

          <div className="flex items-center gap-0.5 rounded-[var(--radius-lg)] border border-df-border bg-df-surface p-0.5">
            {deviceBtn('desktop', 'Escritorio', Monitor)}
            {deviceBtn('tablet', 'Tablet', Tablet)}
            {deviceBtn('mobile', 'Móvil', Smartphone)}
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden bg-black p-3 sm:p-6">
        {!hasScenes ? (
          <div className="text-center text-df-muted">
            <p className="mb-2">No hay escenas habilitadas</p>
            <p className="text-sm text-df-muted-fg">Añade o activa escenas para ver el preview</p>
          </div>
        ) : (
          <div
            className={cn(
              'overflow-hidden rounded-[var(--radius-lg)] bg-df-bg shadow-[var(--shadow-elevated)] transition-all duration-300',
              device === 'desktop' && 'h-full w-full',
              device === 'tablet' && 'h-[1024px] max-h-full w-[768px] max-w-full',
              device === 'mobile' && 'h-[667px] max-h-full w-[375px] max-w-full'
            )}
          >
            <ExperienceRenderer
              config={experienceConfig}
              autoPlay={false}
              quality="medium"
            />
          </div>
        )}
      </div>
    </div>
  )
}
