'use client'

import { useEffect, useState } from 'react'
import { useRendererStore } from '@/stores'
import type { FinaleSceneConfig } from '@/components/experience/registry'

interface FinaleSceneProps {
  config: Record<string, unknown>
  isPlaying: boolean
}

export function FinaleScene({ config, isPlaying }: FinaleSceneProps) {
  const [isVisible, setIsVisible] = useState(true)
  const { restart } = useRendererStore()

  const finaleConfig = config as unknown as FinaleSceneConfig

  const [particles] = useState(() => {
    return Array.from({ length: 50 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      opacity: Math.random() * 0.7 + 0.3,
    }))
  })

  useEffect(() => {
    if (isPlaying) {
      setIsVisible(false)
      const timer = setTimeout(() => setIsVisible(true), 30)
      return () => clearTimeout(timer)
    }
    setIsVisible(true)
  }, [isPlaying])

  const handleRepeat = () => {
    setIsVisible(false)
    setTimeout(() => {
      restart()
    }, 500)
  }

  const animationClass =
    finaleConfig.animation === 'zoom'
      ? 'animate-finale-zoom'
      : finaleConfig.animation === 'slide'
        ? 'animate-finale-slide'
        : 'animate-finale-fade'

  return (
    <div
      className="w-full h-full flex items-center justify-center bg-zinc-950 relative"
      style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 1000ms' }}
    >
      {finaleConfig.background === 'stars' && (
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((particle, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                opacity: particle.opacity,
              }}
            />
          ))}
        </div>
      )}
      {finaleConfig.background === 'gradient' && (
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
          }}
        />
      )}

      <div className={`text-center max-w-2xl px-8 relative z-10 ${animationClass}`}>
        <p className="text-3xl text-white mb-6 leading-relaxed">
          {finaleConfig.message || 'Gracias por acompañarme'}
        </p>

        {finaleConfig.signature && (
          <p className="text-xl text-zinc-300 mb-2">{finaleConfig.signature}</p>
        )}

        {finaleConfig.date && (
          <p className="text-sm text-zinc-500 mb-12">{finaleConfig.date}</p>
        )}

        <button
          type="button"
          onClick={handleRepeat}
          className="mt-8 px-6 py-3 bg-white text-zinc-900 rounded-full font-medium transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-white/50"
        >
          {finaleConfig.repeatButton || 'Ver de nuevo'}
        </button>
      </div>
    </div>
  )
}
