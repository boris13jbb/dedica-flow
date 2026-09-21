'use client'

import { useEffect } from 'react'
import { useRendererStore } from '@/stores'
import { SceneRenderer } from './scene-renderer'
import type { ExperienceConfig } from '@/types'

interface ExperienceRendererProps {
  config: ExperienceConfig
  autoPlay?: boolean
  quality?: 'auto' | 'low' | 'medium' | 'high'
}

export function ExperienceRenderer({ 
  config, 
  autoPlay = false,
  quality = 'auto' 
}: ExperienceRendererProps) {
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
      <SceneRenderer
        scene={currentScene}
        isPlaying={isPlaying}
        quality={quality}
      />
      
      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 bg-black/50 text-white text-xs p-2 rounded">
          <p>Escena: {currentSceneIndex + 1}/{enabledScenes.length}</p>
          <p>Tipo: {currentScene.sceneType}</p>
          <p>Estado: {isPlaying ? 'Playing' : 'Paused'}</p>
        </div>
      )}
    </div>
  )
}
