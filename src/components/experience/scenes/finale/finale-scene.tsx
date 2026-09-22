'use client'

import { useState } from 'react'
import { useRendererStore } from '@/stores'
import type { FinaleSceneConfig } from '@/components/experience/registry'

interface FinaleSceneProps {
  config: Record<string, unknown>
  isPlaying: boolean
}

export function FinaleScene({ config, isPlaying }: FinaleSceneProps) {
  const [exiting, setExiting] = useState(false)
  const [prevPlaying, setPrevPlaying] = useState(isPlaying)
  const { restart } = useRendererStore()

  const finaleConfig = config as unknown as FinaleSceneConfig

  if (isPlaying !== prevPlaying) {
    setPrevPlaying(isPlaying)
    setExiting(false)
  }

  const [particles] = useState(() => {
    return Array.from({ length: 50 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      opacity: Math.random() * 0.7 + 0.3,
    }))
  })

  const handleRepeat = () => {
    setExiting(true)
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
      key={isPlaying ? 'playing' : 'paused'}
      className="relative flex h-full w-full items-center justify-center bg-zinc-950"
      style={{ opacity: exiting ? 0 : 1, transition: 'opacity 1000ms' }}
    >
      {finaleConfig.background === 'stars' && (
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((particle, i) => (
            <div
              key={i}
              className="absolute h-1 w-1 animate-pulse rounded-full bg-white"
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

      <div className={`relative z-10 max-w-2xl px-8 text-center ${animationClass}`}>
        <p className="mb-6 text-3xl leading-relaxed text-white">
          {finaleConfig.message || 'Gracias por acompañarme'}
        </p>

        {finaleConfig.signature && (
          <p className="mb-2 text-xl text-zinc-300">{finaleConfig.signature}</p>
        )}

        {finaleConfig.date && (
          <p className="mb-12 text-sm text-zinc-500">{finaleConfig.date}</p>
        )}

        <button
          type="button"
          onClick={handleRepeat}
          className="mt-8 rounded-full bg-white px-6 py-3 font-medium text-zinc-900 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-white/50"
        >
          {finaleConfig.repeatButton || 'Ver de nuevo'}
        </button>
      </div>
    </div>
  )
}
