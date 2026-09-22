'use client'

import { useState } from 'react'
import { useRendererStore } from '@/stores'
import type { IntroSceneConfig } from '@/components/experience/registry'

interface IntroSceneProps {
  config: Record<string, unknown>
  isPlaying: boolean
}

export function IntroScene({ config, isPlaying }: IntroSceneProps) {
  const [exiting, setExiting] = useState(false)
  const [prevPlaying, setPrevPlaying] = useState(isPlaying)
  const { nextScene } = useRendererStore()

  const introConfig = config as unknown as IntroSceneConfig

  // Al pasar a reproducir, reinicia la salida y remonta con key para animar entrada.
  if (isPlaying !== prevPlaying) {
    setPrevPlaying(isPlaying)
    setExiting(false)
  }

  const [particles] = useState(() => {
    return Array.from({ length: 20 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 2,
      opacity: Math.random() * 0.5 + 0.3,
    }))
  })

  const handleStart = () => {
    setExiting(true)
    setTimeout(() => {
      nextScene()
    }, 500)
  }

  return (
    <div
      key={isPlaying ? 'playing' : 'paused'}
      className="relative flex h-full w-full items-center justify-center transition-opacity duration-1000"
      style={{
        backgroundColor: introConfig.backgroundColor || '#0a0a0a',
        opacity: exiting ? 0 : 1,
      }}
    >
      <div className="relative max-w-2xl px-8 text-center">
        {introConfig.particlesEnabled && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {particles.map((particle, i) => (
              <div
                key={i}
                className="absolute h-1 w-1 animate-pulse rounded-full"
                style={{
                  backgroundColor: introConfig.glowColor || '#fbbf24',
                  left: `${particle.left}%`,
                  top: `${particle.top}%`,
                  animationDelay: `${particle.delay}s`,
                  opacity: particle.opacity,
                }}
              />
            ))}
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center gap-6">
          <h1
            className="animate-experience-fade-in text-4xl font-bold md:text-6xl"
            style={{
              color: introConfig.textColor || '#ffffff',
              textShadow: `0 0 30px ${introConfig.glowColor || '#fbbf24'}`,
            }}
          >
            {introConfig.title || 'Para ti'}
          </h1>

          <p
            className="animate-experience-fade-in text-xl md:text-2xl"
            style={{
              color: introConfig.textColor || '#ffffff',
              animationDelay: '0.25s',
              animationFillMode: 'both',
            }}
          >
            {introConfig.subtitle || 'Una experiencia especial'}
          </p>

          <button
            type="button"
            onClick={handleStart}
            className="animate-experience-fade-in rounded-full px-8 py-4 text-lg font-medium transition-all duration-300 hover:scale-110"
            style={{
              backgroundColor: introConfig.glowColor || '#fbbf24',
              color: introConfig.backgroundColor || '#0a0a0a',
              animationDelay: '0.5s',
              animationFillMode: 'both',
              boxShadow: `0 0 30px ${introConfig.glowColor || '#fbbf24'}`,
            }}
          >
            {introConfig.buttonText || 'Comenzar'}
          </button>
        </div>
      </div>
    </div>
  )
}
