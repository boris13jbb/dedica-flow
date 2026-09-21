'use client'

import { useEffect, useState } from 'react'
import { useRendererStore } from '@/stores'
import type { MessageSceneConfig } from '@/components/experience/registry'

interface MessageSceneProps {
  config: Record<string, unknown>
  isPlaying: boolean
}

export function MessageScene({ config, isPlaying }: MessageSceneProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [shouldAdvance, setShouldAdvance] = useState(false)
  const { nextScene } = useRendererStore()
  
  const messageConfig = config as unknown as MessageSceneConfig

  useEffect(() => {
    if (isPlaying) {
      // Use setTimeout to avoid setting state directly in effect
      const visTimer = setTimeout(() => setIsVisible(true), 0)
      
      // Auto-advance after duration if animation is not 'word' or 'letter'
      if (messageConfig.animation === 'fade' || messageConfig.animation === 'slide') {
        const advanceTimer = setTimeout(() => {
          setShouldAdvance(true)
        }, messageConfig.duration + 3000) // Show for 3s after animation
        
        return () => {
          clearTimeout(visTimer)
          clearTimeout(advanceTimer)
        }
      }
      
      return () => clearTimeout(visTimer)
    }
  }, [isPlaying, messageConfig.animation, messageConfig.duration])

  useEffect(() => {
    if (shouldAdvance) {
      // Use setTimeout to avoid setting state directly in effect
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => {
          nextScene()
        }, 500)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [shouldAdvance, nextScene])

  const handleClick = () => {
    if (isPlaying) {
      setShouldAdvance(true)
    }
  }

  const fontClass = 
    messageConfig.font === 'serif' ? 'font-serif' :
    messageConfig.font === 'mono' ? 'font-mono' :
    'font-sans'

  const sizeClass = 
    messageConfig.size === 'sm' ? 'text-sm' :
    messageConfig.size === 'base' ? 'text-base' :
    messageConfig.size === 'lg' ? 'text-lg' :
    messageConfig.size === 'xl' ? 'text-xl' :
    messageConfig.size === '2xl' ? 'text-2xl' :
    messageConfig.size === '3xl' ? 'text-3xl' :
    'text-2xl'

  const alignClass =
    messageConfig.align === 'left' ? 'text-left' :
    messageConfig.align === 'right' ? 'text-right' :
    'text-center'

  const maxWidthClass =
    messageConfig.maxWidth === 'sm' ? 'max-w-sm' :
    messageConfig.maxWidth === 'md' ? 'max-w-md' :
    messageConfig.maxWidth === 'lg' ? 'max-w-lg' :
    messageConfig.maxWidth === 'xl' ? 'max-w-xl' :
    messageConfig.maxWidth === '2xl' ? 'max-w-2xl' :
    messageConfig.maxWidth === 'full' ? 'max-w-full' :
    'max-w-2xl'

  const animationClass =
    messageConfig.animation === 'fade' ? 'animate-message-fade' :
    messageConfig.animation === 'slide' ? 'animate-message-slide' :
    messageConfig.animation === 'blur' ? 'animate-message-blur' :
    'animate-message-fade'

  return (
    <div
      className="w-full h-full flex items-center justify-center bg-zinc-950 px-8 cursor-pointer"
      onClick={handleClick}
      style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 500ms' }}
    >
      <div className={`${maxWidthClass} w-full`}>
        <p
          className={`${fontClass} ${sizeClass} ${alignClass} ${animationClass} whitespace-pre-wrap leading-relaxed`}
          style={{ 
            color: messageConfig.color,
            animationDuration: `${messageConfig.duration}ms`,
          }}
        >
          {messageConfig.text}
        </p>
      </div>

      <style jsx>{`
        @keyframes message-fade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes message-slide {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes message-blur {
          from {
            opacity: 0;
            filter: blur(10px);
          }
          to {
            opacity: 1;
            filter: blur(0);
          }
        }
        .animate-message-fade {
          animation: message-fade ease-out;
          animation-fill-mode: forwards;
          opacity: 0;
        }
        .animate-message-slide {
          animation: message-slide ease-out;
          animation-fill-mode: forwards;
          opacity: 0;
        }
        .animate-message-blur {
          animation: message-blur ease-out;
          animation-fill-mode: forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}
