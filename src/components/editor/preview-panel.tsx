'use client'

import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Monitor, Smartphone, Tablet, Play, Pause, RotateCcw } from 'lucide-react'
import { ExperienceRenderer } from '@/components/experience/renderer'
import { useRendererStore } from '@/stores'
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

  // Estabilizar referencia: un objeto nuevo cada render provocaba bucle setConfig (#185)
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

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-50">Preview</h2>

        <div className="flex items-center gap-3">
          {hasScenes && (
            <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1">
              <button
                type="button"
                onClick={restart}
                className="p-2 rounded transition-colors text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800"
                title="Reiniciar"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={isPlaying ? pause : play}
                className="p-2 rounded transition-colors text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800"
                title={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>
            </div>
          )}

          <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1">
            <button
              type="button"
              onClick={() => onDeviceChange('desktop')}
              className={`p-2 rounded transition-colors ${
                device === 'desktop'
                  ? 'bg-zinc-700 text-zinc-50'
                  : 'text-zinc-400 hover:text-zinc-50'
              }`}
              title="Desktop"
            >
              <Monitor className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onDeviceChange('tablet')}
              className={`p-2 rounded transition-colors ${
                device === 'tablet'
                  ? 'bg-zinc-700 text-zinc-50'
                  : 'text-zinc-400 hover:text-zinc-50'
              }`}
              title="Tablet"
            >
              <Tablet className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onDeviceChange('mobile')}
              className={`p-2 rounded transition-colors ${
                device === 'mobile'
                  ? 'bg-zinc-700 text-zinc-50'
                  : 'text-zinc-400 hover:text-zinc-50'
              }`}
              title="Mobile"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-zinc-900/50 p-8 flex items-center justify-center overflow-hidden">
        {!hasScenes ? (
          <div className="text-center text-zinc-400">
            <p className="mb-2">No hay escenas habilitadas</p>
            <p className="text-sm">Añade escenas para ver el preview</p>
          </div>
        ) : (
          <div
            className={`bg-zinc-950 rounded-lg shadow-2xl overflow-hidden transition-all duration-300 ${
              device === 'desktop'
                ? 'w-full h-full'
                : device === 'tablet'
                  ? 'w-[768px] h-[1024px] max-w-full max-h-full'
                  : 'w-[375px] h-[667px] max-w-full max-h-full'
            }`}
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
