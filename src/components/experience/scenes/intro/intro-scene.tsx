'use client'

import { useEffect, useState } from 'react'
import { useRendererStore } from '@/stores'
import type { IntroSceneConfig } from '@/components/experience/registry'

interface IntroSceneProps {
  config: Record<string, unknown>
  isPlaying: boolean
}

export function IntroScene({ config, isPlaying }: IntroSceneProps) {
  const [isVisible, setIsVisible] = useState(true)
  const { nextScene } = useRendererStore()

  const introConfig = config as unknown as IntroSceneConfig

  const [particles] = useState(() => {
    return Array.from({ length: 20 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 2,
      opacity: Math.random() * 0.5 + 0.3,
    }))
  })

  useEffect(() => {
    // En preview pausado permanece visible; al reproducir anima la entrada.
    if (isPlaying) {
      setIsVisible(false)
      const timer = setTimeout(() => setIsVisible(true), 30)
      return () => clearTimeout(timer)
    }
    setIsVisible(true)
  }, [isPlaying])

  const handleStart = () => {
    setIsVisible(false)
    setTimeout(() => {
      nextScene()
    }, 500)
  }

  return (
    <div
      className="w-full h-full flex items-center justify-center transition-opacity duration-1000 relative"
      style={{
        backgroundColor: introConfig.backgroundColor || '#0a0a0a',
        opacity: isVisible ? 1 : 0,
      }}
    >
      <div className="text-center max-w-2xl px-8 relative">
        {introConfig.particlesEnabled && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full animate-pulse"
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
            className="text-4xl md:text-6xl font-bold animate-experience-fade-in"
            style={{
              color: introConfig.textColor || '#ffffff',
              textShadow: `0 0 30px ${introConfig.glowColor || '#fbbf24'}`,
            }}
          >
            {introConfig.title || 'Para ti'}
          </h1>

          <p
            className="text-xl md:text-2xl animate-experience-fade-in"
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
            className="px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 hover:scale-110 animate-experience-fade-in"
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
