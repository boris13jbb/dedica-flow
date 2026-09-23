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

const PAGE_ONLY_HOSTS = new Set([
  'photos.app.goo.gl',
  'photos.google.com',
  'www.photos.google.com',
  'goo.gl',
  'g.co',
  'youtube.com',
  'www.youtube.com',
  'youtu.be',
])

/** Extensiones que nunca son textura de foto. No exigir .jpg/.png para aceptar. */
const NON_IMAGE_EXTENSIONS = new Set([
  'html',
  'htm',
  'php',
  'asp',
  'aspx',
  'pdf',
  'txt',
  'csv',
  'json',
  'xml',
  'js',
  'css',
  'mp3',
  'wav',
  'ogg',
  'mp4',
  'webm',
  'mov',
  'zip',
])

function pathnameExtension(pathname: string): string | null {
  const last = pathname.split('/').pop() ?? ''
  const dot = last.lastIndexOf('.')
  if (dot <= 0 || dot === last.length - 1) return null
  return last.slice(dot + 1).toLowerCase()
}

/**
 * Rechaza valores que claramente no son una imagen.
 * Acepta CDN/firmadas sin extensión (.jpg no es obligatorio).
 */
export function isLoadablePhotoUrl(url: string): boolean {
  const value = url.trim()
  if (!value) return false

  if (value.startsWith('data:image/')) return true
  if (value.startsWith('blob:')) return true

  try {
    const parsed = new URL(value)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false

    const host = parsed.hostname.toLowerCase()
    if (PAGE_ONLY_HOSTS.has(host) || host.endsWith('.app.goo.gl')) return false

    const extension = pathnameExtension(parsed.pathname)
    if (extension && NON_IMAGE_EXTENSIONS.has(extension)) return false

    return true
  } catch {
    return false
  }
}

export function filterLoadablePhotoUrls(urls: string[]): string[] {
  return urls.filter(isLoadablePhotoUrl)
}

export function isEmptyPhotoOrbitConfig(config: Record<string, unknown> | null | undefined): boolean {
  if (!config) return true
  return filterLoadablePhotoUrls(normalizePhotoUrls(config.photos)).length === 0
}

export type PhotoOrbitView =
  | { kind: 'scene'; urls: string[] }
  | { kind: 'editor-empty' }
  | { kind: 'editor-invalid' }
  | { kind: 'published-skip' }

/**
 * Decide qué mostrar según modo de presentación y fotos cargables.
 * Álbumes (photos.app.goo.gl) se tratan como vacíos en publicado.
 */
export function resolvePhotoOrbitView(
  photos: unknown,
  presentationMode: 'editor' | 'published'
): PhotoOrbitView {
  const raw = normalizePhotoUrls(photos)
  const urls = filterLoadablePhotoUrls(raw)
  if (urls.length > 0) return { kind: 'scene', urls }
  if (presentationMode === 'editor') {
    return raw.length > 0 ? { kind: 'editor-invalid' } : { kind: 'editor-empty' }
  }
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
