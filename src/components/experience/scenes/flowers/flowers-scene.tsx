'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import type { FlowersSceneConfig } from '@/components/experience/registry'

interface FlowerProps {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  textureUrl: string | null
}

function Flower({ position, rotation, scale, textureUrl }: FlowerProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  // Always call useLoader (React hooks must be unconditional)
  let texture: THREE.Texture | null = null
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    texture = textureUrl ? useLoader(THREE.TextureLoader, textureUrl) : null
  } catch {
    texture = null
  }

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.01
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime + position[0]) * 0.001
    }
  })

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent
        side={THREE.DoubleSide}
        opacity={0.9}
        color={textureUrl ? '#ffffff' : '#ffeb3b'}
      />
    </mesh>
  )
}

interface FlowersSystemProps {
  config: FlowersSceneConfig
}

function FlowersSystem({ config }: FlowersSystemProps) {
  const groupRef = useRef<THREE.Group>(null)

  const flowers = useMemo(() => {
    const items: Array<{ position: [number, number, number]; rotation: [number, number, number] }> = []
    
    // Create a seeded random generator for consistency
    const random = (seed: number) => {
      const x = Math.sin(seed) * 10000
      return x - Math.floor(x)
    }
    
    for (let i = 0; i < config.amount; i++) {
      let position: [number, number, number]
      const angle = (i / config.amount) * Math.PI * 2

      switch (config.mode) {
        case 'bouquet':
          position = [
            (random(i * 3) - 0.5) * config.spread,
            (random(i * 3 + 1) - 0.5) * config.spread,
            (random(i * 3 + 2) - 0.5) * config.spread,
          ]
          break
        case 'rain':
          position = [
            (random(i * 3) - 0.5) * config.spread * 2,
            random(i * 3 + 1) * config.spread * 2,
            (random(i * 3 + 2) - 0.5) * config.spread,
          ]
          break
        case 'spiral':
          position = [
            Math.cos(angle) * config.spread * (i / config.amount),
            (i / config.amount) * config.spread,
            Math.sin(angle) * config.spread * (i / config.amount),
          ]
          break
        case 'orbit':
          position = [
            Math.cos(angle) * config.spread,
            0,
            Math.sin(angle) * config.spread,
          ]
          break
        case 'tunnel':
          position = [
            Math.cos(angle) * config.spread,
            Math.sin(angle) * config.spread,
            (i / config.amount) * config.spread * 2 - config.spread,
          ]
          break
        default:
          position = [0, 0, 0]
      }

      items.push({
        position,
        rotation: [
          random(i * 5) * Math.PI,
          random(i * 5 + 1) * Math.PI,
          random(i * 5 + 2) * Math.PI,
        ],
      })
    }
    return items
  }, [config.mode, config.amount, config.spread])

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += config.speed * config.rotation * delta * 0.2

      if (config.mode === 'rain') {
        groupRef.current.position.y -= config.speed * delta * 2
        if (groupRef.current.position.y < -config.spread * 2) {
          groupRef.current.position.y = config.spread
        }
      }
    }
  })

  return (
    <group ref={groupRef}>
      {flowers.map((flower, i) => (
        <Flower
          key={i}
          position={flower.position}
          rotation={flower.rotation}
          scale={config.scale}
          textureUrl={config.flowerImage}
        />
      ))}
    </group>
  )
}

interface FlowersSceneProps {
  config: Record<string, unknown>
  quality: 'auto' | 'low' | 'medium' | 'high'
}

export function FlowersScene({ config, quality }: FlowersSceneProps) {
  const flowersConfig = config as unknown as FlowersSceneConfig

  // Adjust amount based on quality
  const adjustedConfig = {
    ...flowersConfig,
    amount: quality === 'low' 
      ? Math.min(flowersConfig.amount, 20)
      : quality === 'medium'
      ? Math.min(flowersConfig.amount, 50)
      : flowersConfig.amount,
  }

  return (
    <div 
      className="w-full h-full"
      style={{ backgroundColor: adjustedConfig.backgroundColor }}
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        gl={{ 
          antialias: quality !== 'low',
          powerPreference: 'high-performance',
        }}
      >
        <FlowersSystem config={adjustedConfig} />
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
      </Canvas>
    </div>
  )
}
