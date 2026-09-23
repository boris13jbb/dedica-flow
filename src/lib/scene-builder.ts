import { getSceneDefinition } from '@/components/experience/registry'
import type { Scene, SceneType } from '@/types'

/** Copia independiente: evita que original y duplicado compartan el mismo objeto. */
export function deepCloneValue<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value
  }
  return structuredClone(value)
}

export function buildSceneKey(type: SceneType, now = Date.now()): string {
  return `${type}-${now}`
}

export function buildNewScenePayload(type: SceneType, position: number, now = Date.now()) {
  const definition = getSceneDefinition(type)
  if (!definition) {
    throw new Error(`Tipo de escena no válido: ${type}`)
  }

  return {
    scene_key: buildSceneKey(type, now),
    scene_type: type,
    name: definition.name,
    position,
    duration_ms: 5000,
    trigger_mode: 'auto' as const,
    enabled: true,
    config: deepCloneValue(definition.defaultConfig) as Record<string, unknown>,
  }
}

export function insertSceneAfter<T extends { id: string; position: number }>(
  scenes: T[],
  afterId: string,
  incoming: T
): T[] {
  const index = scenes.findIndex((scene) => scene.id === afterId)
  const insertAt = index >= 0 ? index + 1 : scenes.length
  const next = [...scenes]
  next.splice(insertAt, 0, incoming)
  return next.map((scene, position) => ({ ...scene, position }))
}

export function remapScenePositions<T extends { position: number }>(scenes: T[]): T[] {
  return scenes.map((scene, position) => ({ ...scene, position }))
}

export function removeSceneAndSelectNeighbor<T extends { id: string; position: number }>(
  scenes: T[],
  deletedId: string,
  selectedId: string | null
): { scenes: T[]; selectedId: string | null } {
  const deletedIndex = scenes.findIndex((scene) => scene.id === deletedId)
  const remaining = remapScenePositions(scenes.filter((scene) => scene.id !== deletedId))

  if (selectedId !== deletedId) {
    return { scenes: remaining, selectedId }
  }

  const neighbor = remaining[deletedIndex] ?? remaining[deletedIndex - 1] ?? null
  return { scenes: remaining, selectedId: neighbor?.id ?? null }
}

export function reorderScenesByIds<T extends { id: string; position: number }>(
  scenes: T[],
  orderedIds: string[]
): T[] {
  const map = new Map(scenes.map((scene) => [scene.id, scene]))
  return orderedIds
    .map((id) => map.get(id))
    .filter((scene): scene is T => scene !== undefined)
    .map((scene, position) => ({ ...scene, position }))
}

export function cloneSceneForDuplicate(
  scene: Pick<Scene, 'scene_key' | 'scene_type' | 'name' | 'position' | 'duration_ms' | 'trigger_mode' | 'enabled' | 'config'>,
  now = Date.now()
) {
  return {
    scene_key: `${scene.scene_key}-copy-${now}`,
    scene_type: scene.scene_type,
    name: `${scene.name} (copia)`,
    position: scene.position + 1,
    duration_ms: scene.duration_ms,
    trigger_mode: scene.trigger_mode,
    enabled: scene.enabled,
    config: deepCloneValue(scene.config),
  }
}

export function normalizeGalleryUrls(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((url) => String(url ?? '').trim()).filter(Boolean)
  }
  if (typeof value === 'string') {
    return value
      .split(/[\n,]+/)
      .map((url) => url.trim())
      .filter(Boolean)
  }
  return []
}

export function mergeUniqueUrls(existing: string[], incoming: string[], max?: number): string[] {
  const next = [...existing]
  for (const url of incoming) {
    const trimmed = url.trim()
    if (!trimmed || next.includes(trimmed)) continue
    next.push(trimmed)
  }
  return typeof max === 'number' ? next.slice(0, max) : next
}

export function moveUrl(urls: string[], from: number, to: number): string[] {
  if (from < 0 || to < 0 || from >= urls.length || to >= urls.length || from === to) {
    return urls
  }
  const next = [...urls]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export function applySingleMediaValue(url: string | null): string | null {
  const trimmed = url?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}
