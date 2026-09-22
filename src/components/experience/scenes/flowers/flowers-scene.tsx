'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import type { FlowersSceneConfig } from '@/components/experience/registry'
import { SacredSunburst } from './sacred-sunburst'

const FORM_DURATION = 2.6

interface FlowerItem {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  kind: 'seed' | 'petal'
  color: string
  appearAt: number
}

function buildGenericItems(config: FlowersSceneConfig): FlowerItem[] {
  const items: FlowerItem[] = []
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
      case 'orbit':
        position = [Math.cos(angle) * config.spread, 0, Math.sin(angle) * config.spread]
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
      scale: config.scale,
      kind: 'seed',
      color: '#fbbf24',
      appearAt: (i / Math.max(config.amount, 1)) * 0.7,
    })
  }

  return items
}

function visibilityFor(item: FlowerItem, elapsed: number) {
  const formProgress = Math.min(1, elapsed / FORM_DURATION)
  if (formProgress >= item.appearAt) return 1
  return Math.max(0, (formProgress - item.appearAt + 0.1) / 0.1)
}

function TexturedFlower({
  item,
  textureUrl,
}: {
  item: FlowerItem
  textureUrl: string
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const texture = useLoader(THREE.TextureLoader, textureUrl)

  useFrame((state) => {
    if (!meshRef.current) return
    const visible = visibilityFor(item, state.clock.elapsedTime)
    const breathe = 1 + Math.sin(state.clock.elapsedTime * 1.4 + item.position[0] * 2) * 0.025
    meshRef.current.scale.setScalar(item.scale * visible * breathe)
    meshRef.current.visible = visible > 0.01
  })

  return (
    <mesh ref={meshRef} position={item.position} rotation={item.rotation} scale={0}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} transparent opacity={0.95} side={THREE.DoubleSide} />
    </mesh>
  )
}

function SolidFlower({ item }: { item: FlowerItem }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    const visible = visibilityFor(item, state.clock.elapsedTime)
    const breathe = 1 + Math.sin(state.clock.elapsedTime * 1.4 + item.position[0] * 2) * 0.025
    meshRef.current.scale.setScalar(item.scale * visible * breathe)
    meshRef.current.visible = visible > 0.01
  })

  return (
    <mesh ref={meshRef} position={item.position} scale={0}>
      <circleGeometry args={[0.5, 16]} />
      <meshBasicMaterial color={item.color} transparent opacity={0.98} side={THREE.DoubleSide} />
    </mesh>
  )
}

function FlowersSystem({ config }: { config: FlowersSceneConfig }) {
  const groupRef = useRef<THREE.Group>(null)
  const flowers = useMemo(() => buildGenericItems(config), [config])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y += config.speed * config.rotation * delta * 0.2
    if (config.mode === 'rain') {
      groupRef.current.position.y -= config.speed * delta * 2
      if (groupRef.current.position.y < -config.spread * 2) {
        groupRef.current.position.y = config.spread
      }
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {flowers.map((flower, i) =>
        config.flowerImage ? (
          <TexturedFlower key={i} item={flower} textureUrl={config.flowerImage} />
        ) : (
          <SolidFlower key={i} item={flower} />
        )
      )}
    </group>
  )
}

interface FlowersSceneProps {
  config: Record<string, unknown>
  quality: 'auto' | 'low' | 'medium' | 'high'
  isPlaying?: boolean
}

export function FlowersScene({ config, quality, isPlaying = true }: FlowersSceneProps) {
  const flowersConfig = config as unknown as FlowersSceneConfig
  const mode = (flowersConfig.mode || 'sunflower') as FlowersSceneConfig['mode']
  const isSunflower = mode === 'sunflower' || mode === 'spiral'

  const amountCap = quality === 'low' ? 70 : quality === 'medium' ? 110 : 150
  const adjustedConfig: FlowersSceneConfig = {
    ...flowersConfig,
    mode,
    amount: Math.min(Math.max(flowersConfig.amount || 40, 12), amountCap),
    spread: flowersConfig.spread || 5,
    scale: flowersConfig.scale || 1,
    speed: flowersConfig.speed ?? 0.35,
    rotation: flowersConfig.rotation ?? 0.7,
    flowerImage: isSunflower ? null : (flowersConfig.flowerImage ?? null),
    backgroundColor: flowersConfig.backgroundColor || '#000000',
  }

  if (isSunflower) {
    return (
      <div className="h-full w-full" style={{ backgroundColor: adjustedConfig.backgroundColor }}>
        <SacredSunburst config={adjustedConfig} isPlaying={isPlaying} />
      </div>
    )
  }

  return (
    <div className="h-full w-full" style={{ backgroundColor: adjustedConfig.backgroundColor }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        gl={{
          antialias: quality !== 'low',
          powerPreference: 'high-performance',
        }}
      >
        <FlowersSystem config={adjustedConfig} />
        <ambientLight intensity={1} />
      </Canvas>
    </div>
  )
}
