'use client'

import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'
import type { NebulaSceneConfig } from '@/components/experience/registry'

interface NebulaParticlesProps {
  config: NebulaSceneConfig
}

function NebulaParticles({ config }: NebulaParticlesProps) {
  const ref = useRef<THREE.Points>(null)
  const [positions] = useState(() => {
    const positions = new Float32Array(config.density * 3)
    const colors = new Float32Array(config.density * 3)
    const primaryRGB = new THREE.Color(config.primaryColor)
    const secondaryRGB = new THREE.Color(config.secondaryColor)
    
    for (let i = 0; i < config.density; i++) {
      const i3 = i * 3
      const radius = Math.random() * 10 + 5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)
      
      // Mix colors
      const mixRatio = Math.random()
      const color = new THREE.Color().lerpColors(primaryRGB, secondaryRGB, mixRatio)
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b
    }
    return { positions, colors }
  })

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += config.speed * delta * 0.5
      ref.current.rotation.x += config.speed * delta * 0.2
      
      // Pulsing effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      ref.current.scale.set(scale * config.scale, scale * config.scale, scale * config.scale)
    }
  })

  return (
    <Points ref={ref} positions={positions.positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={config.scale * 0.5}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={config.opacity}
        blending={THREE.AdditiveBlending}
      />
      <bufferAttribute
        attach="attributes-color"
        args={[positions.colors, 3]}
      />
    </Points>
  )
}

interface NebulaSceneProps {
  config: Record<string, unknown>
  quality: 'auto' | 'low' | 'medium' | 'high'
}

export function NebulaScene({ config, quality }: NebulaSceneProps) {
  const nebulaConfig = config as unknown as NebulaSceneConfig

  // Adjust density based on quality
  const adjustedConfig = {
    ...nebulaConfig,
    density: quality === 'low' 
      ? Math.min(nebulaConfig.density, 50)
      : quality === 'medium'
      ? Math.min(nebulaConfig.density, 100)
      : nebulaConfig.density,
  }

  return (
    <div className="w-full h-full bg-black">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 75 }}
        gl={{ 
          antialias: quality !== 'low',
          powerPreference: 'high-performance',
        }}
      >
        <NebulaParticles config={adjustedConfig} />
        <ambientLight intensity={0.3} />
      </Canvas>
    </div>
  )
}
