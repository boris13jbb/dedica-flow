'use client'

import { useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useRendererStore } from '@/stores'
import type { ExperienceConfig } from '@/types'

/**
 * Avanza automáticamente las escenas con trigger `auto`
 * según enter + hold (+ parte de exit). Las de click/manual
 * las controla cada escena (p. ej. Intro con "Comenzar").
 */
export function useSceneTimeline(config: ExperienceConfig | null) {
  const { currentSceneIndex, isPlaying, nextScene, setSceneProgress } =
    useRendererStore(
      useShallow((s) => ({
        currentSceneIndex: s.currentSceneIndex,
        isPlaying: s.isPlaying,
        nextScene: s.nextScene,
        setSceneProgress: s.setSceneProgress,
      }))
    )
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef<number | null>(null)
  // Firma estable del config para no reiniciar el timer por nueva referencia
  const configKey = config
    ? `${config.projectId}:${config.scenes.map((s) => s.id).join(',')}:${currentSceneIndex}`
    : ''

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    if (!config || !isPlaying) {
      setSceneProgress(0)
      return
    }

    const scene = config.scenes[currentSceneIndex]
    if (!scene?.enabled) return

    if (scene.trigger !== 'auto') {
      setSceneProgress(0)
      return
    }

    const enter = Math.max(0, scene.duration?.enter ?? 1000)
    const hold = Math.max(500, scene.duration?.hold ?? 5000)
    const exit = Math.max(0, scene.duration?.exit ?? 800)
    const total = enter + hold + exit
    const startedAt = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startedAt
      setSceneProgress(Math.min(1, elapsed / total))
      if (elapsed < total) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)

    timerRef.current = setTimeout(() => {
      nextScene()
    }, total)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [configKey, config, currentSceneIndex, isPlaying, nextScene, setSceneProgress])
}
