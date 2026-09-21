'use client'

import { useEffect, Suspense } from 'react'
import { useRendererStore } from '@/stores'
import { SceneRenderer } from './scene-renderer'
import { AudioManager } from '../audio'
import { ExperienceErrorBoundary } from './error-boundary'
import { WebGLFallback } from './webgl-fallback'
import { ExperienceLoader } from './loader'
import { useQualityManager } from '@/hooks'
import type { ExperienceConfig } from '@/types'

interface ExperienceRendererProps {
  config: ExperienceConfig
  autoPlay?: boolean
  quality?: 'auto' | 'low' | 'medium' | 'high'
}

function ExperienceContent({ 
  config, 
  autoPlay = false,
  quality: qualityMode = 'auto' 
}: ExperienceRendererProps) {
  const qualitySettings = useQualityManager(qualityMode)
  const {
    currentSceneIndex,
    isPlaying,
    setConfig,
    play,
  } = useRendererStore()

  useEffect(() => {
    setConfig(config)
    if (autoPlay) {
      play()
    }
  }, [config, autoPlay, setConfig, play])

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
      {/* Audio Manager */}
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

      {/* Scene Renderer */}
      <SceneRenderer
        scene={currentScene}
        isPlaying={isPlaying}
        quality={qualitySettings.level}
      />
      
      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 bg-black/50 text-white text-xs p-2 rounded space-y-1">
          <p>Escena: {currentSceneIndex + 1}/{enabledScenes.length}</p>
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
