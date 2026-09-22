import type { SceneConfig } from '@/types'

/**
 * Normaliza la lista de URLs de fotos desde config (array o texto multilínea).
 */
export function normalizePhotoUrls(photos: unknown): string[] {
  if (Array.isArray(photos)) {
    return photos
      .map((url) => String(url ?? '').trim())
      .filter((url) => url.length > 0)
  }

  if (typeof photos === 'string') {
    return photos
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.length > 0)
  }

  return []
}

export function isEmptyPhotoOrbitConfig(config: Record<string, unknown> | null | undefined): boolean {
  if (!config) return true
  return normalizePhotoUrls(config.photos).length === 0
}

export type PhotoOrbitView =
  | { kind: 'scene'; urls: string[] }
  | { kind: 'editor-empty' }
  | { kind: 'published-skip' }

/**
 * Decide qué mostrar según modo de presentación y fotos disponibles.
 */
export function resolvePhotoOrbitView(
  photos: unknown,
  presentationMode: 'editor' | 'published'
): PhotoOrbitView {
  const urls = normalizePhotoUrls(photos)
  if (urls.length > 0) return { kind: 'scene', urls }
  if (presentationMode === 'editor') return { kind: 'editor-empty' }
  return { kind: 'published-skip' }
}

/**
 * En experiencias publicadas, las órbitas sin fotos se desactivan para que
 * el timeline las omita sin mostrar empty states del editor.
 */
export function prepareScenesForPresentation(
  scenes: SceneConfig[],
  mode: 'editor' | 'published'
): SceneConfig[] {
  if (mode !== 'published') return scenes

  return scenes.map((scene) => {
    if (scene.sceneType !== 'photoOrbit') return scene
    if (!isEmptyPhotoOrbitConfig(scene.config)) return scene
    return { ...scene, enabled: false }
  })
}

export function findFirstEnabledSceneIndex(scenes: SceneConfig[]): number {
  const index = scenes.findIndex((scene) => scene.enabled)
  return index >= 0 ? index : 0
}

export function findNextEnabledSceneIndex(
  scenes: SceneConfig[],
  fromIndex: number
): number | null {
  for (let i = fromIndex + 1; i < scenes.length; i += 1) {
    if (scenes[i]?.enabled) return i
  }
  return null
}
