'use client'

import { useEffect, Suspense, useMemo, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useRendererStore } from '@/stores'
import { SceneRenderer } from './scene-renderer'
import { AudioManager } from '../audio'
import { ExperienceErrorBoundary } from './error-boundary'
import { WebGLFallback } from './webgl-fallback'
import { ExperienceLoader } from './loader'
import { useQualityManager, useSceneTimeline } from '@/hooks'
import { prepareScenesForPresentation } from '../scenes/photo-orbit/photo-orbit-utils'
import type { ExperienceConfig } from '@/types'

interface ExperienceRendererProps {
  config: ExperienceConfig
  autoPlay?: boolean
  quality?: 'auto' | 'low' | 'medium' | 'high'
  /** editor: empty states de edición; published: omitir órbitas sin fotos */
  presentationMode?: 'editor' | 'published'
}

function ExperienceContent({
  config,
  autoPlay = false,
  quality: qualityMode = 'auto',
  presentationMode = 'published',
}: ExperienceRendererProps) {
  const qualitySettings = useQualityManager(qualityMode)
  const { currentSceneIndex, isPlaying, setConfig, play } = useRendererStore(
    useShallow((s) => ({
      currentSceneIndex: s.currentSceneIndex,
      isPlaying: s.isPlaying,
      setConfig: s.setConfig,
      play: s.play,
    }))
  )
  const appliedSigRef = useRef<string | null>(null)

  const runtimeConfig = useMemo<ExperienceConfig>(
    () => ({
      ...config,
      scenes: prepareScenesForPresentation(config.scenes, presentationMode),
    }),
    [config, presentationMode]
  )

  useEffect(() => {
    // Solo aplicar cuando el contenido del config cambia de verdad
    const sig = JSON.stringify({
      projectId: runtimeConfig.projectId,
      slug: runtimeConfig.slug,
      presentationMode,
      scenes: runtimeConfig.scenes.map((s) => ({
        id: s.id,
        position: s.position,
        enabled: s.enabled,
        trigger: s.trigger,
        duration: s.duration,
        config: s.config,
      })),
      audio: runtimeConfig.audio,
    })
    if (appliedSigRef.current === sig) return
    appliedSigRef.current = sig
    setConfig(runtimeConfig)
    if (autoPlay) {
      play()
    }
  }, [runtimeConfig, presentationMode, autoPlay, setConfig, play])

  useSceneTimeline(runtimeConfig)

  const currentScene = runtimeConfig.scenes[currentSceneIndex]
  const enabledScenes = runtimeConfig.scenes.filter((s) => s.enabled)

  if (!currentScene || !currentScene.enabled) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-400">
        <p>No hay escenas habilitadas</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative bg-zinc-950">
      {runtimeConfig.audio?.url && (
        <AudioManager
          config={{
            url: runtimeConfig.audio.url,
            volume: runtimeConfig.audio.volume ?? 0.7,
            loop: runtimeConfig.audio.loop ?? false,
            fadeIn: runtimeConfig.audio.fadeIn ?? 2000,
            fadeOut: runtimeConfig.audio.fadeOut ?? 2000,
          }}
          isPlaying={isPlaying}
        />
      )}

      <SceneRenderer
        scene={currentScene}
        isPlaying={isPlaying}
        quality={qualitySettings.level}
        presentationMode={presentationMode}
      />

      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 bg-black/50 text-white text-xs p-2 rounded space-y-1">
          <p>
            Escena: {currentSceneIndex + 1}/{enabledScenes.length}
          </p>
          <p>Tipo: {currentScene.sceneType}</p>
          <p>Estado: {isPlaying ? 'Playing' : 'Paused'}</p>
          <p>Calidad: {qualitySettings.level}</p>
          <p>Partículas: {Math.round(qualitySettings.particleMultiplier * 100)}%</p>
          {runtimeConfig.audio?.url && <p>Audio: Activado</p>}
        </div>
      )}
    </div>
  )
}

export function ExperienceRenderer(props: ExperienceRendererProps) {
  return (
    <ExperienceErrorBoundary>
      <WebGLFallback>
        <Suspense fallback={<ExperienceLoader />}>
          <ExperienceContent {...props} />
        </Suspense>
      </WebGLFallback>
    </ExperienceErrorBoundary>
  )
}
