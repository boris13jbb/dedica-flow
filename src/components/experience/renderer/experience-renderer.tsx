'use client'

import { useEffect, Suspense, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useRendererStore } from '@/stores'
import { SceneRenderer } from './scene-renderer'
import { AudioManager } from '../audio'
import { ExperienceErrorBoundary } from './error-boundary'
import { WebGLFallback } from './webgl-fallback'
import { ExperienceLoader } from './loader'
import { useQualityManager, useSceneTimeline } from '@/hooks'
import type { ExperienceConfig } from '@/types'

interface ExperienceRendererProps {
  config: ExperienceConfig
  autoPlay?: boolean
  quality?: 'auto' | 'low' | 'medium' | 'high'
}

function ExperienceContent({
  config,
  autoPlay = false,
  quality: qualityMode = 'auto',
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

  useEffect(() => {
    // Solo aplicar cuando el contenido del config cambia de verdad
    const sig = JSON.stringify({
      projectId: config.projectId,
      slug: config.slug,
      scenes: config.scenes.map((s) => ({
        id: s.id,
        position: s.position,
        enabled: s.enabled,
        trigger: s.trigger,
        duration: s.duration,
        config: s.config,
      })),
      audio: config.audio,
    })
    if (appliedSigRef.current === sig) return
    appliedSigRef.current = sig
    setConfig(config)
    if (autoPlay) {
      play()
    }
  }, [config, autoPlay, setConfig, play])

  useSceneTimeline(config)

  const currentScene = config.scenes[currentSceneIndex]
  const enabledScenes = config.scenes.filter((s) => s.enabled)

  if (!currentScene || !currentScene.enabled) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-400">
        <p>No hay escenas habilitadas</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative bg-zinc-950">
      {config.audio?.url && (
        <AudioManager
          config={{
            url: config.audio.url,
            volume: config.audio.volume ?? 0.7,
            loop: config.audio.loop ?? false,
            fadeIn: config.audio.fadeIn ?? 2000,
            fadeOut: config.audio.fadeOut ?? 2000,
          }}
          isPlaying={isPlaying}
        />
      )}

      <SceneRenderer
        scene={currentScene}
        isPlaying={isPlaying}
        quality={qualitySettings.level}
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
          {config.audio?.url && <p>Audio: Activado</p>}
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
