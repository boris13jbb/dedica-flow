'use client'

import { useState, useEffect } from 'react'

interface DeviceCapabilities {
  hasWebGL: boolean
  dpr: number
  isMobile: boolean
  prefersReducedMotion: boolean
  memoryGB: number | null
}

export function useDeviceCapabilities(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    hasWebGL: true,
    dpr: 1,
    isMobile: false,
    prefersReducedMotion: false,
    memoryGB: null,
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      // Check WebGL support
      const canvas = document.createElement('canvas')
      const hasWebGL = !!(
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      )

      // Get device pixel ratio
      const dpr = window.devicePixelRatio || 1

      // Detect mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth < 768

      // Check prefers-reduced-motion
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      // Estimate device memory (if available)
      const nav = navigator as Navigator & { deviceMemory?: number }
      const memoryGB = nav.deviceMemory || null

      setCapabilities({
        hasWebGL,
        dpr,
        isMobile,
        prefersReducedMotion,
        memoryGB,
      })
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  return capabilities
}

interface QualitySettings {
  level: 'low' | 'medium' | 'high'
  particleMultiplier: number
  enableBloom: boolean
  enableShadows: boolean
  antialias: boolean
  pixelRatio: number
}

export function useQualityManager(
  mode: 'auto' | 'low' | 'medium' | 'high' = 'auto'
): QualitySettings {
  const capabilities = useDeviceCapabilities()
  const [quality, setQuality] = useState<QualitySettings>({
    level: 'medium',
    particleMultiplier: 1,
    enableBloom: true,
    enableShadows: true,
    antialias: true,
    pixelRatio: 1,
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mode !== 'auto') {
        // Manual mode
        setQuality(getQualityPreset(mode))
        return
      }

      // Auto mode - determine quality based on device
      let level: 'low' | 'medium' | 'high' = 'medium'

      // Check memory
      if (capabilities.memoryGB !== null) {
        if (capabilities.memoryGB < 2) {
          level = 'low'
        } else if (capabilities.memoryGB < 4) {
          level = 'medium'
        } else {
          level = 'high'
        }
      }

      // Adjust for mobile
      if (capabilities.isMobile) {
        level = level === 'high' ? 'medium' : 'low'
      }

      // Adjust for high DPR
      if (capabilities.dpr > 2) {
        level = level === 'high' ? 'medium' : 'low'
      }

      // Adjust for no WebGL
      if (!capabilities.hasWebGL) {
        level = 'low'
      }

      setQuality(getQualityPreset(level))
    }, 0)

    return () => clearTimeout(timer)
  }, [mode, capabilities])

  return quality
}

function getQualityPreset(level: 'low' | 'medium' | 'high'): QualitySettings {
  const dpr =
    typeof window !== 'undefined' && typeof window.devicePixelRatio === 'number'
      ? window.devicePixelRatio
      : 1

  switch (level) {
    case 'low':
      return {
        level: 'low',
        particleMultiplier: 0.3,
        enableBloom: false,
        enableShadows: false,
        antialias: false,
        pixelRatio: Math.min(dpr, 1),
      }
    case 'medium':
      return {
        level: 'medium',
        particleMultiplier: 0.6,
        enableBloom: false,
        enableShadows: false,
        antialias: true,
        pixelRatio: Math.min(dpr, 1.5),
      }
    case 'high':
      return {
        level: 'high',
        particleMultiplier: 1,
        enableBloom: true,
        enableShadows: true,
        antialias: true,
        pixelRatio: Math.min(dpr, 2),
      }
  }
}
