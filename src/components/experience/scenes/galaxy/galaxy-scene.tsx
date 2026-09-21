'use client'

import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'
import type { GalaxySceneConfig } from '@/components/experience/registry'

interface StarsProps {
  config: GalaxySceneConfig
}

function Stars({ config }: StarsProps) {
  const ref = useRef<THREE.Points>(null)
  const [positions] = useState(() => {
    const positions = new Float32Array(config.starCount * 3)
    for (let i = 0; i < config.starCount; i++) {
      const i3 = i * 3
      const radius = Math.random() * config.depth
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi) - config.depth / 2
    }
    return positions
  })

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += config.rotationSpeed * delta
      ref.current.position.z += config.speed * delta
      
      // Reset position for infinite loop effect
      if (ref.current.position.z > config.depth / 2) {
        ref.current.position.z = -config.depth / 2
      }
    }
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={config.starColor}
        size={config.starSize}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  )
}

interface GalaxySceneProps {
  config: Record<string, unknown>
  quality: 'auto' | 'low' | 'medium' | 'high'
}

export function GalaxyScene({ config, quality }: GalaxySceneProps) {
  const galaxyConfig = config as unknown as GalaxySceneConfig
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Use setTimeout to avoid setting state directly in effect
    const timer = setTimeout(() => setIsLoaded(true), 0)
    return () => clearTimeout(timer)
  }, [])

  // Adjust star count based on quality
  const adjustedConfig = {
    ...galaxyConfig,
    starCount: quality === 'low' 
      ? Math.min(galaxyConfig.starCount, 1000)
      : quality === 'medium'
      ? Math.min(galaxyConfig.starCount, 2000)
      : galaxyConfig.starCount,
  }

  return (
    <div 
      className="w-full h-full transition-opacity duration-1000"
      style={{ 
        backgroundColor: galaxyConfig.backgroundColor,
        opacity: isLoaded ? 1 : 0,
      }}
    >
      <Canvas
        camera={{ 
          position: [0, 0, galaxyConfig.cameraZ], 
          fov: 75 
        }}
        gl={{ 
          antialias: quality !== 'low',
          powerPreference: 'high-performance',
        }}
      >
        <Stars config={adjustedConfig} />
        
        {/* Ambient light for subtle illumination */}
        <ambientLight intensity={0.5} />
        
        {/* Bloom effect would go here with post-processing */}
      </Canvas>

      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
