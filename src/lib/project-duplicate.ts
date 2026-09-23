import { normalizeSlug } from '@/lib/slug'
import { deepCloneValue } from '@/lib/scene-builder'
import type { Json, ProjectStatus } from '@/types'

export interface DuplicableScene {
  scene_key: string
  scene_type: string
  name: string
  position: number
  duration_ms: number
  trigger_mode: string
  enabled: boolean
  config: Json
}

export interface DuplicableProject {
  id: string
  name: string
  slug: string
  description: string | null
  template_id: string | null
  cover_asset_id: string | null
  draft_config: Json
  status: ProjectStatus
  scenes: DuplicableScene[]
}

export function suggestCopyName(name: string): string {
  const trimmed = name.trim() || 'Experiencia'
  if (trimmed.toLowerCase().startsWith('copia de ')) {
    return trimmed
  }
  return `Copia de ${trimmed}`
}

export function suggestCopySlug(slug: string): string {
  const base = normalizeSlug(`${slug}-copia`)
  return base || `copia-${Date.now().toString(36)}`
}

export function allocateUniqueSlug(base: string, taken: Set<string>): string {
  const normalized = normalizeSlug(base) || `proyecto-${Date.now().toString(36)}`
  if (!taken.has(normalized)) return normalized

  for (let attempt = 2; attempt <= 20; attempt += 1) {
    const candidate = `${normalized.slice(0, 50)}-${attempt}`
    if (!taken.has(candidate)) return candidate
  }

  return `${normalized.slice(0, 40)}-${Date.now().toString(36)}`
}

/**
 * Construye el payload de un proyecto clonado.
 * No incluye id, slug original, publicaciones ni timestamps.
 */
export function buildProjectDuplicateDraft(
  source: DuplicableProject,
  options: { name: string; slug: string }
) {
  return {
    name: options.name.trim() || suggestCopyName(source.name),
    slug: options.slug,
    description: source.description,
    template_id: source.template_id,
    cover_asset_id: source.cover_asset_id,
    status: 'draft' as const,
    draft_config: deepCloneValue(source.draft_config),
    scenes: source.scenes
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((scene, index) => ({
        scene_key: scene.scene_key,
        scene_type: scene.scene_type,
        name: scene.name,
        position: scene.position ?? index,
        duration_ms: scene.duration_ms,
        trigger_mode: scene.trigger_mode,
        enabled: scene.enabled,
        config: deepCloneValue(scene.config),
      })),
  }
}
