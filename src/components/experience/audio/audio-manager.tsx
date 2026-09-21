'use client'

import { useEffect, useRef, useState } from 'react'

interface AudioConfig {
  url: string | null
  volume: number
  loop: boolean
  fadeIn: number
  fadeOut: number
}

interface AudioManagerProps {
  config: AudioConfig
  isPlaying: boolean
  onEnd?: () => void
}

export function AudioManager({ config, isPlaying, onEnd }: AudioManagerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Create audio element
  useEffect(() => {
    if (!config.url) return

    const audio = new Audio(config.url)
    audio.loop = config.loop
    audio.volume = 0 // Start at 0 for fade in
    audioRef.current = audio

    audio.addEventListener('canplaythrough', () => {
      setIsReady(true)
    })

    audio.addEventListener('ended', () => {
      if (onEnd) onEnd()
    })

    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e)
      // Experience continues even if audio fails
    })

    return () => {
      audio.pause()
      audio.src = ''
      audioRef.current = null
      setIsReady(false)
    }
  }, [config.url, config.loop, onEnd])

  // Handle play/pause with fade
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !isReady) return

    // Clear any existing fade interval
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current)
      fadeIntervalRef.current = null
    }

    if (isPlaying && hasInteracted) {
      // Fade in
      audio.play().catch((error) => {
        console.error('Play error:', error)
        // Don't block the experience
      })

      let currentVolume = 0
      const targetVolume = config.volume
      const fadeSteps = config.fadeIn / 50 // 50ms intervals
      const volumeIncrement = targetVolume / fadeSteps

      fadeIntervalRef.current = setInterval(() => {
        currentVolume = Math.min(currentVolume + volumeIncrement, targetVolume)
        if (audio) audio.volume = currentVolume

        if (currentVolume >= targetVolume && fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current)
          fadeIntervalRef.current = null
        }
      }, 50)
    } else if (!isPlaying && audio.volume > 0) {
      // Fade out
      let currentVolume = audio.volume
      const fadeSteps = config.fadeOut / 50
      const volumeDecrement = currentVolume / fadeSteps

      fadeIntervalRef.current = setInterval(() => {
        currentVolume = Math.max(currentVolume - volumeDecrement, 0)
        if (audio) audio.volume = currentVolume

        if (currentVolume <= 0) {
          if (audio) audio.pause()
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current)
            fadeIntervalRef.current = null
          }
        }
      }, 50)
    }

    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current)
        fadeIntervalRef.current = null
      }
    }
  }, [isPlaying, isReady, hasInteracted, config.volume, config.fadeIn, config.fadeOut])

  // Enable audio on first user interaction
  useEffect(() => {
    const enableAudio = () => {
      setHasInteracted(true)
      document.removeEventListener('click', enableAudio)
      document.removeEventListener('keydown', enableAudio)
      document.removeEventListener('touchstart', enableAudio)
    }

    document.addEventListener('click', enableAudio)
    document.addEventListener('keydown', enableAudio)
    document.addEventListener('touchstart', enableAudio)

    return () => {
      document.removeEventListener('click', enableAudio)
      document.removeEventListener('keydown', enableAudio)
      document.removeEventListener('touchstart', enableAudio)
    }
  }, [])

  // No visual output - audio only
  return null
}
