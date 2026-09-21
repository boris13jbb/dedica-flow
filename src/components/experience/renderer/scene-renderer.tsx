'use client'

import { IntroScene } from '../scenes/intro/intro-scene'
import { GalaxyScene } from '../scenes/galaxy/galaxy-scene'
import { MessageScene } from '../scenes/message/message-scene'
import { FinaleScene } from '../scenes/finale/finale-scene'
import type { SceneConfig } from '@/types'

interface SceneRendererProps {
  scene: SceneConfig
  isPlaying: boolean
  quality: 'auto' | 'low' | 'medium' | 'high'
}

export function SceneRenderer({ scene, isPlaying, quality }: SceneRendererProps) {
  const config = scene.config

  switch (scene.sceneType) {
    case 'intro':
      return <IntroScene config={config} isPlaying={isPlaying} />
    
    case 'galaxy':
      return <GalaxyScene config={config} isPlaying={isPlaying} quality={quality} />
    
    case 'message':
      return <MessageScene config={config} isPlaying={isPlaying} />
    
    case 'finale':
      return <FinaleScene config={config} isPlaying={isPlaying} />
    
    default:
      return (
        <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-400">
          <div className="text-center">
            <p className="mb-2">Tipo de escena no implementado</p>
            <p className="text-sm">{scene.sceneType}</p>
          </div>
        </div>
      )
  }
}
