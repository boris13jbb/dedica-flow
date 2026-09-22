'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { FlowersSceneConfig } from '@/components/experience/registry'

interface Point {
  x: number
  y: number
}

interface Particle {
  startX: number
  startY: number
  targetIndex: number
  size: number
}

function rad(degrees: number) {
  return (degrees * Math.PI) / 180
}

function seededRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

/**
 * Genera el trazo completo del sunburst (geometría sagrada dorada)
 * con la misma lógica turtle del diseño original.
 */
function buildSunburstPoints(): Point[] {
  const points: Point[] = []
  let x = 0
  let y = 0
  let heading = 0

  points.push({ x, y })

  const left = (angle: number) => {
    heading += angle
  }

  const circle = (radius: number, extent: number) => {
    const theta = rad(heading)
    const cx = x - radius * Math.sin(theta)
    const cy = y + radius * Math.cos(theta)
    const startAngle = rad(heading - 90)
    const totalAngle = rad(extent)
    const steps = 40

    for (let k = 1; k <= steps; k++) {
      const a = startAngle + totalAngle * (k / steps)
      x = cx + radius * Math.cos(a)
      y = cy + radius * Math.sin(a)
      points.push({ x, y })
    }

    heading += extent
  }

  for (let i = 0; i < 12; i++) {
    for (let j = 0; j < 20; j++) {
      circle(120 - j * 4, 90)
      left(90)
      circle(120 - j * 4, 90)
      left(90)
    }
    left(30)
  }

  return points
}

const SUNBURST_POINTS = buildSunburstPoints()

/** Fracciones del tiempo total: puntos → convergencia → trazo dorado */
const PHASE_SCATTER_END = 0.18
const PHASE_GATHER_END = 0.38

function buildParticles(count: number, path: Point[]): Particle[] {
  const particles: Particle[] = []
  const step = Math.max(1, Math.floor(path.length / count))

  for (let i = 0; i < count; i++) {
    const r = seededRandom(i * 7.13)
    const angle = seededRandom(i * 3.17) * Math.PI * 2
    const dist = 90 + r * 220
    particles.push({
      startX: Math.cos(angle) * dist,
      startY: Math.sin(angle) * dist,
      targetIndex: Math.min(path.length - 1, i * step),
      size: 1.2 + seededRandom(i * 9.91) * 4.5,
    })
  }
  return particles
}

interface SacredSunburstProps {
  config: FlowersSceneConfig
  isPlaying?: boolean
}

/**
 * 1) Puntos blancos dispersos
 * 2) Convergen hacia la silueta de la flor
 * 3) Se transforman en el trazo dorado paso a paso
 */
export function SacredSunburst({ config, isPlaying = true }: SacredSunburstProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  const particleCount = Math.min(
    420,
    Math.max(180, Math.round((config.amount || 110) * 3.2))
  )

  const particles = useMemo(
    () => buildParticles(particleCount, SUNBURST_POINTS),
    [particleCount]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const bg = config.backgroundColor || '#000000'
    const durationMs = Math.max(
      16000,
      Math.min(28000, Math.round(22000 / Math.max(config.speed || 0.5, 0.45)))
    )
    const scaleMul = Math.max(0.5, Math.min(config.scale || 1, 2))
    const path = SUNBURST_POINTS

    const drawFrame = (t: number) => {
      const dpr = window.devicePixelRatio || 1
      const cssW = canvas.clientWidth
      const cssH = canvas.clientHeight
      if (cssW < 1 || cssH < 1) return

      canvas.width = Math.floor(cssW * dpr)
      canvas.height = Math.floor(cssH * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      ctx.fillStyle = bg
      ctx.fillRect(0, 0, cssW, cssH)

      const centerX = cssW / 2
      const centerY = cssH / 2
      const scale = (Math.min(cssW, cssH) / 380) * scaleMul
      const toX = (x: number) => centerX + x * scale
      const toY = (y: number) => centerY - y * scale

      // --- Fase 1–2: puntos blancos (dispersos → convergen) ---
      let gather = 0
      if (t <= PHASE_SCATTER_END) {
        gather = 0
      } else if (t < PHASE_GATHER_END) {
        const u = (t - PHASE_SCATTER_END) / (PHASE_GATHER_END - PHASE_SCATTER_END)
        gather = 1 - Math.pow(1 - u, 2)
      } else {
        gather = 1
      }

      // Opacidad de puntos: se desvanecen mientras nace el oro
      const drawPhase =
        t <= PHASE_GATHER_END
          ? 0
          : (t - PHASE_GATHER_END) / (1 - PHASE_GATHER_END)
      const dotsAlpha = Math.max(0, 1 - drawPhase * 1.35)

      if (dotsAlpha > 0.02) {
        ctx.save()
        ctx.globalAlpha = dotsAlpha
        ctx.shadowColor = 'rgba(255,255,255,0.55)'
        ctx.shadowBlur = 4
        for (const p of particles) {
          const target = path[p.targetIndex]
          const x = p.startX + (target.x - p.startX) * gather
          const y = p.startY + (target.y - p.startY) * gather
          const r = p.size * (1 - gather * 0.35)
          ctx.beginPath()
          ctx.arc(toX(x), toY(y), Math.max(0.6, r), 0, Math.PI * 2)
          ctx.fillStyle = '#ffffff'
          ctx.fill()
        }
        ctx.restore()
      }

      // --- Fase 3: trazo dorado paso a paso ---
      if (drawPhase > 0) {
        const easedDraw = 1 - Math.pow(1 - Math.min(1, drawPhase), 1.25)
        const count = Math.max(
          2,
          Math.floor(1 + easedDraw * (path.length - 1))
        )

        ctx.beginPath()
        ctx.moveTo(toX(path[0].x), toY(path[0].y))
        for (let i = 1; i < count; i++) {
          ctx.lineTo(toX(path[i].x), toY(path[i].y))
        }

        ctx.strokeStyle = '#FFD700'
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.shadowColor = '#FFD700'
        ctx.shadowBlur = 6
        ctx.stroke()

        if (count < path.length) {
          const tip = path[count - 1]
          ctx.beginPath()
          ctx.arc(toX(tip.x), toY(tip.y), 3.5, 0, Math.PI * 2)
          ctx.fillStyle = '#FFF8DC'
          ctx.shadowBlur = 14
          ctx.fill()
        }
      }
    }

    let start: number | null = null

    const tick = (now: number) => {
      if (!isPlaying) {
        progressRef.current = 1
        drawFrame(1)
        return
      }

      if (start === null) start = now
      const elapsed = now - start
      const t = Math.min(1, elapsed / durationMs)
      progressRef.current = t
      drawFrame(t)

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        drawFrame(1)
      }
    }

    const onResize = () => drawFrame(progressRef.current)

    progressRef.current = isPlaying ? 0 : 1
    window.addEventListener('resize', onResize)
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', onResize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [
    config.backgroundColor,
    config.scale,
    config.speed,
    isPlaying,
    particles,
  ])

  return (
    <canvas
      ref={canvasRef}
      className="block h-full w-full"
      style={{ backgroundColor: config.backgroundColor || '#000000' }}
      aria-label="Puntos blancos transformándose en flor dorada"
    />
  )
}
