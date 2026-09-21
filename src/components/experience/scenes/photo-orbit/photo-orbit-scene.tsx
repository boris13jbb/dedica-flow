'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { PhotoOrbitSceneConfig } from '@/components/experience/registry'

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
}

function PhotoOrbitSystem({ config }: PhotoOrbitSystemProps) {
  const groupRef = useRef<THREE.Group>(null)

  const photos = useMemo(() => {
    // Parse photos from textarea (one URL per line)
    const urls = Array.isArray(config.photos) 
      ? config.photos 
      : String(config.photos || '').split('\n').filter((url) => url.trim())

    if (urls.length === 0) {
      return []
    }

    return urls.map((url, i) => {
      const angle = (i / urls.length) * Math.PI * 2
      const radius = config.radius
      const verticalOffset = Math.sin(angle * 2) * config.spacing

      return {
        url: url.trim(),
        position: [
          Math.cos(angle) * radius,
          verticalOffset,
          Math.sin(angle) * radius,
        ] as [number, number, number],
        rotation: [
          0,
          -angle + Math.PI / 2,
          0,
        ] as [number, number, number],
      }
    })
  }, [config.photos, config.radius, config.spacing])

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += config.speed * delta * 0.5

      // Individual card rotation
      groupRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          child.rotation.y += config.rotation * delta * 0.3
          child.position.y += Math.sin(state.clock.elapsedTime + i) * 0.001
        }
      })
    }
  })

  if (photos.length === 0) {
    return (
      <Html center>
        <div style={{ color: 'white', fontSize: '14px', textAlign: 'center' }}>
          <p>No hay fotos</p>
          <p style={{ fontSize: '12px', opacity: 0.7 }}>Agrega URLs en el inspector</p>
        </div>
      </Html>
    )
  }

  return (
    <group ref={groupRef}>
      {photos.map((photo, i) => (
        <PhotoCard
          key={i}
          imageUrl={photo.url}
          position={photo.position}
          rotation={photo.rotation}
          scale={config.cardScale}
          borderRadius={config.borderRadius}
        />
      ))}
    </group>
  )
}

interface PhotoOrbitSceneProps {
  config: Record<string, unknown>
  quality: 'auto' | 'low' | 'medium' | 'high'
}

export function PhotoOrbitScene({ config, quality }: PhotoOrbitSceneProps) {
  const photoConfig = config as unknown as PhotoOrbitSceneConfig

  return (
    <div 
      className="w-full h-full"
      style={{ backgroundColor: photoConfig.backgroundColor }}
    >
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        gl={{ 
          antialias: quality !== 'low',
          powerPreference: 'high-performance',
        }}
      >
        <PhotoOrbitSystem config={photoConfig} />
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
      </Canvas>
    </div>
  )
}
