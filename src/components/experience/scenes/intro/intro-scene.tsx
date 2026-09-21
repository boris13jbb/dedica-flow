'use client'

import { useEffect, useState } from 'react'
import { useRendererStore } from '@/stores'
import type { IntroSceneConfig } from '@/components/experience/registry'

interface IntroSceneProps {
  config: Record<string, unknown>
  isPlaying: boolean
}

export function IntroScene({ config, isPlaying }: IntroSceneProps) {
  const [isVisible, setIsVisible] = useState(false)
  const { nextScene } = useRendererStore()
  
  const introConfig = config as unknown as IntroSceneConfig

  // Generate particle positions once using useState initializer
  const [particles] = useState(() => {
    return Array.from({ length: 20 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 2,
      opacity: Math.random() * 0.5 + 0.3,
    }))
  })

  useEffect(() => {
    if (isPlaying) {
      // Use setTimeout to avoid setting state directly in effect
      const timer = setTimeout(() => setIsVisible(true), 0)
      return () => clearTimeout(timer)
    }
  }, [isPlaying])

  const handleStart = () => {
    setIsVisible(false)
    setTimeout(() => {
      nextScene()
    }, 500)
  }

  return (
    <div
      className="w-full h-full flex items-center justify-center transition-opacity duration-1000"
      style={{
        backgroundColor: introConfig.backgroundColor,
        opacity: isVisible ? 1 : 0,
      }}
    >
      <div className="text-center max-w-2xl px-8">
        {/* Particles background (simplified) */}
        {introConfig.particlesEnabled && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full animate-pulse"
                style={{
                  backgroundColor: introConfig.glowColor,
                  left: `${particle.left}%`,
                  top: `${particle.top}%`,
                  animationDelay: `${particle.delay}s`,
                  opacity: particle.opacity,
                }}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="relative z-10">
          <h1
            className="text-6xl font-bold mb-4 animate-fade-in"
            style={{ 
              color: introConfig.textColor,
              textShadow: `0 0 30px ${introConfig.glowColor}`,
            }}
          >
            {introConfig.title}
          </h1>
          
          <p
            className="text-2xl mb-12 animate-fade-in"
            style={{ 
              color: introConfig.textColor,
              animationDelay: '0.3s',
              opacity: 0,
              animationFillMode: 'forwards',
            }}
          >
            {introConfig.subtitle}
          </p>
          
          <button
            onClick={handleStart}
            className="px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 hover:scale-110 animate-fade-in"
            style={{
              backgroundColor: introConfig.glowColor,
              color: introConfig.backgroundColor,
              animationDelay: '0.6s',
              opacity: 0,
              animationFillMode: 'forwards',
              boxShadow: `0 0 30px ${introConfig.glowColor}`,
            }}
          >
            {introConfig.buttonText}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  )
}
