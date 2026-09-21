'use client'

import { useEffect, useState } from 'react'
import { useRendererStore } from '@/stores'
import type { FinaleSceneConfig } from '@/components/experience/registry'

interface FinaleSceneProps {
  config: Record<string, unknown>
  isPlaying: boolean
}

export function FinaleScene({ config, isPlaying }: FinaleSceneProps) {
  const [isVisible, setIsVisible] = useState(false)
  const { restart } = useRendererStore()
  
  const finaleConfig = config as unknown as FinaleSceneConfig

  // Generate particle positions once using useState initializer
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
      // Use setTimeout to avoid setting state directly in effect
      const timer = setTimeout(() => setIsVisible(true), 0)
      return () => clearTimeout(timer)
    }
  }, [isPlaying])

  const handleRepeat = () => {
    setIsVisible(false)
    setTimeout(() => {
      restart()
    }, 500)
  }

  const animationClass =
    finaleConfig.animation === 'zoom' ? 'animate-finale-zoom' :
    finaleConfig.animation === 'slide' ? 'animate-finale-slide' :
    'animate-finale-fade'

  return (
    <div
      className="w-full h-full flex items-center justify-center bg-zinc-950"
      style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 1000ms' }}
    >
      {/* Background */}
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

      {/* Content */}
      <div className={`text-center max-w-2xl px-8 relative z-10 ${animationClass}`}>
        <p className="text-3xl text-white mb-6 leading-relaxed">
          {finaleConfig.message}
        </p>
        
        {finaleConfig.signature && (
          <p className="text-xl text-zinc-300 mb-2">
            {finaleConfig.signature}
          </p>
        )}
        
        {finaleConfig.date && (
          <p className="text-sm text-zinc-500 mb-12">
            {finaleConfig.date}
          </p>
        )}
        
        <button
          onClick={handleRepeat}
          className="mt-8 px-6 py-3 bg-white text-zinc-900 rounded-full font-medium transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-white/50"
        >
          {finaleConfig.repeatButton}
        </button>
      </div>

      <style jsx>{`
        @keyframes finale-fade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes finale-zoom {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes finale-slide {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-finale-fade {
          animation: finale-fade 1.5s ease-out;
        }
        .animate-finale-zoom {
          animation: finale-zoom 1.5s ease-out;
        }
        .animate-finale-slide {
          animation: finale-slide 1.5s ease-out;
        }
      `}</style>
    </div>
  )
}
