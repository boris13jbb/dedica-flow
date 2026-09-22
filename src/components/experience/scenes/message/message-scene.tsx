'use client'

import { useEffect, useState } from 'react'
import { useRendererStore } from '@/stores'
import type { MessageSceneConfig } from '@/components/experience/registry'

interface MessageSceneProps {
  config: Record<string, unknown>
  isPlaying: boolean
}

export function MessageScene({ config, isPlaying }: MessageSceneProps) {
  const [exiting, setExiting] = useState(false)
  const [shouldAdvance, setShouldAdvance] = useState(false)
  const [prevPlaying, setPrevPlaying] = useState(isPlaying)
  const { nextScene } = useRendererStore()

  const messageConfig = config as unknown as MessageSceneConfig

  if (isPlaying !== prevPlaying) {
    setPrevPlaying(isPlaying)
    setExiting(false)
    setShouldAdvance(false)
  }

  useEffect(() => {
    if (!isPlaying) return
    if (messageConfig.animation !== 'fade' && messageConfig.animation !== 'slide') {
      return
    }

    const advanceTimer = setTimeout(() => {
      setShouldAdvance(true)
    }, (messageConfig.duration || 1500) + 3000)

    return () => clearTimeout(advanceTimer)
  }, [isPlaying, messageConfig.animation, messageConfig.duration])

  useEffect(() => {
    if (!shouldAdvance) return

    const exitTimer = setTimeout(() => setExiting(true), 0)
    const nextTimer = setTimeout(() => nextScene(), 500)

    return () => {
      clearTimeout(exitTimer)
      clearTimeout(nextTimer)
    }
  }, [shouldAdvance, nextScene])

  const handleClick = () => {
    if (isPlaying) {
      setShouldAdvance(true)
    }
  }

  const fontClass =
    messageConfig.font === 'serif'
      ? 'font-serif'
      : messageConfig.font === 'mono'
        ? 'font-mono'
        : 'font-sans'

  const sizeClass =
    messageConfig.size === 'sm'
      ? 'text-sm'
      : messageConfig.size === 'base'
        ? 'text-base'
        : messageConfig.size === 'lg'
          ? 'text-lg'
          : messageConfig.size === 'xl'
            ? 'text-xl'
            : messageConfig.size === '2xl'
              ? 'text-2xl'
              : messageConfig.size === '3xl'
                ? 'text-3xl'
                : 'text-2xl'

  const alignClass =
    messageConfig.align === 'left'
      ? 'text-left'
      : messageConfig.align === 'right'
        ? 'text-right'
        : 'text-center'

  const maxWidthClass =
    messageConfig.maxWidth === 'sm'
      ? 'max-w-sm'
      : messageConfig.maxWidth === 'md'
        ? 'max-w-md'
        : messageConfig.maxWidth === 'lg'
          ? 'max-w-lg'
          : messageConfig.maxWidth === 'xl'
            ? 'max-w-xl'
            : messageConfig.maxWidth === '2xl'
              ? 'max-w-2xl'
              : messageConfig.maxWidth === 'full'
                ? 'max-w-full'
                : 'max-w-2xl'

  const animationClass =
    messageConfig.animation === 'fade'
      ? 'animate-message-fade'
      : messageConfig.animation === 'slide'
        ? 'animate-message-slide'
        : messageConfig.animation === 'blur'
          ? 'animate-message-blur'
          : 'animate-message-fade'

  return (
    <div
      key={isPlaying ? 'playing' : 'paused'}
      className="flex h-full w-full cursor-pointer items-center justify-center bg-zinc-950 px-8"
      onClick={handleClick}
      style={{ opacity: exiting ? 0 : 1, transition: 'opacity 500ms' }}
    >
      <div className={`${maxWidthClass} w-full`}>
        <p
          className={`${fontClass} ${sizeClass} ${alignClass} ${animationClass} whitespace-pre-wrap leading-relaxed`}
          style={{
            color: messageConfig.color || '#ffffff',
            animationDuration: `${messageConfig.duration || 1500}ms`,
          }}
        >
          {messageConfig.text || 'Tu mensaje especial aquí'}
        </p>
      </div>
    </div>
  )
}
