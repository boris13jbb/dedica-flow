'use client'

import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useRendererStore } from '@/stores'
import type { PhotoOrbitSceneConfig } from '@/components/experience/registry'
import { ExperienceErrorBoundary } from '@/components/experience/renderer/error-boundary'
import { PhotoCardErrorBoundary } from './photo-card-error-boundary'
import { PhotoOrbitEmptyState } from './photo-orbit-empty-state'
import { resolvePhotoOrbitView } from './photo-orbit-utils'

interface PhotoCardProps {
  imageUrl: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  borderRadius: number
}

function PhotoCard({ imageUrl, position, rotation, scale, borderRadius }: PhotoCardProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const texture = useLoader(THREE.TextureLoader, imageUrl)

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={[scale, scale, scale]}>
      <planeGeometry args={[1.5, 1]} />
      <meshStandardMaterial
        map={texture}
        side={THREE.DoubleSide}
        roughness={0.1}
        metalness={0.1}
      />
      {borderRadius > 0 && (
        <Html transform occlude>
          <div
            style={{
              width: '150px',
              height: '100px',
              borderRadius: `${borderRadius}px`,
              overflow: 'hidden',
              pointerEvents: 'none',
            }}
          />
        </Html>
      )}
    </mesh>
  )
}

interface PhotoOrbitSystemProps {
  config: PhotoOrbitSceneConfig
  urls: string[]
}

function PhotoOrbitSystem({ config, urls }: PhotoOrbitSystemProps) {
  const groupRef = useRef<THREE.Group>(null)

  const photos = useMemo(() => {
    return urls.map((url, i) => {
      const angle = (i / urls.length) * Math.PI * 2
      const radius = config.radius
      const verticalOffset = Math.sin(angle * 2) * config.spacing

      return {
        url,
        position: [
          Math.cos(angle) * radius,
          verticalOffset,
          Math.sin(angle) * radius,
        ] as [number, number, number],
        rotation: [0, -angle + Math.PI / 2, 0] as [number, number, number],
      }
    })
  }, [urls, config.radius, config.spacing])

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += config.speed * delta * 0.5

      groupRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          child.rotation.y += config.rotation * delta * 0.3
          child.position.y += Math.sin(state.clock.elapsedTime + i) * 0.001
        }
      })
    }
  })

  return (
    <group ref={groupRef}>
      {photos.map((photo, i) => (
        <PhotoCardErrorBoundary key={`${photo.url}-${i}`}>
          <PhotoCard
            imageUrl={photo.url}
            position={photo.position}
            rotation={photo.rotation}
            scale={config.cardScale}
            borderRadius={config.borderRadius}
          />
        </PhotoCardErrorBoundary>
      ))}
    </group>
  )
}

function PublishedPhotoOrbitFallback() {
  const nextScene = useRendererStore((s) => s.nextScene)

  useEffect(() => {
    nextScene()
  }, [nextScene])

  return <div className="h-full w-full bg-zinc-950" aria-hidden data-testid="photo-orbit-skipped" />
}

interface PhotoOrbitSceneProps {
  config: Record<string, unknown>
  quality: 'auto' | 'low' | 'medium' | 'high'
  /** editor: empty state útil; published: omitir sin mensajes técnicos */
  presentationMode?: 'editor' | 'published'
}

export function PhotoOrbitScene({
  config,
  quality,
  presentationMode = 'published',
}: PhotoOrbitSceneProps) {
  const photoConfig = config as unknown as PhotoOrbitSceneConfig
  const view = useMemo(
    () => resolvePhotoOrbitView(photoConfig.photos, presentationMode),
    [photoConfig.photos, presentationMode]
  )
  const nextScene = useRendererStore((s) => s.nextScene)

  // Red de seguridad: si una órbita vacía llega al público, avanzar sin UI de editor.
  useEffect(() => {
    if (view.kind !== 'published-skip') return
    nextScene()
  }, [view.kind, nextScene])

  if (view.kind === 'editor-empty') {
    return <PhotoOrbitEmptyState />
  }

  if (view.kind === 'editor-invalid') {
    return <PhotoOrbitEmptyState variant="invalid" />
  }

  if (view.kind === 'published-skip') {
    return <div className="h-full w-full bg-zinc-950" aria-hidden data-testid="photo-orbit-skipped" />
  }

  const loadFallback =
    presentationMode === 'published' ? (
      <PublishedPhotoOrbitFallback />
    ) : (
      <PhotoOrbitEmptyState variant="invalid" />
    )

  return (
    <div
      className="h-full w-full"
      style={{ backgroundColor: photoConfig.backgroundColor }}
      data-testid="photo-orbit-scene"
    >
      <ExperienceErrorBoundary fallback={loadFallback}>
        <Canvas
          camera={{ position: [0, 0, 15], fov: 60 }}
          gl={{
            antialias: quality !== 'low',
            powerPreference: 'high-performance',
          }}
        >
          <PhotoOrbitSystem config={photoConfig} urls={view.urls} />
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <pointLight position={[-10, -10, -10]} intensity={0.3} />
        </Canvas>
      </ExperienceErrorBoundary>
    </div>
  )
}
