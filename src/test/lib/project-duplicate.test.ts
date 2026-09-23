import { describe, expect, it } from 'vitest'
import {
  allocateUniqueSlug,
  buildProjectDuplicateDraft,
  suggestCopyName,
  suggestCopySlug,
  type DuplicableProject,
} from '@/lib/project-duplicate'

function sourceProject(): DuplicableProject {
  return {
    id: 'orig-1',
    name: 'Mayrita',
    slug: 'mayrita',
    description: 'Dedicatoria',
    template_id: 'tpl-1',
    cover_asset_id: 'cover-1',
    status: 'published',
    draft_config: {
      audio: { assetId: 'audio-1', volume: 0.8 },
    },
    scenes: [
      {
        scene_key: 'intro',
        scene_type: 'intro',
        name: 'Intro',
        position: 0,
        duration_ms: 4000,
        trigger_mode: 'click',
        enabled: true,
        config: { title: 'Hola' },
      },
      {
        scene_key: 'orbit',
        scene_type: 'photoOrbit',
        name: 'Fotos',
        position: 1,
        duration_ms: 6000,
        trigger_mode: 'auto',
        enabled: false,
        config: { photos: ['https://cdn.example/a.jpg'] },
      },
    ],
  }
}

describe('project-duplicate', () => {
  it('prellena nombre y slug de copia', () => {
    expect(suggestCopyName('Mayrita')).toBe('Copia de Mayrita')
    expect(suggestCopySlug('mayrita')).toBe('mayrita-copia')
  })

  it('genera un slug único sin pisar el original', () => {
    const slug = allocateUniqueSlug('mayrita', new Set(['mayrita', 'mayrita-2']))
    expect(slug).toBe('mayrita-3')
    expect(slug).not.toBe('mayrita')
  })

  it('clona proyecto sin ids, sin publicar y sin historial', () => {
    const draft = buildProjectDuplicateDraft(sourceProject(), {
      name: 'Copia de Mayrita',
      slug: 'mayrita-copia',
    })

    expect(draft.status).toBe('draft')
    expect(draft.slug).toBe('mayrita-copia')
    expect(draft.slug).not.toBe('mayrita')
    expect(draft.name).toBe('Copia de Mayrita')
    expect(draft.scenes).toHaveLength(2)
    expect(draft.scenes[0]).not.toHaveProperty('id')
    expect(draft.scenes.map((scene) => scene.position)).toEqual([0, 1])
    expect(draft.scenes[1]?.config).toEqual({ photos: ['https://cdn.example/a.jpg'] })
    expect(draft.draft_config).toEqual({
      audio: { assetId: 'audio-1', volume: 0.8 },
    })
    expect(draft.draft_config).not.toBe(sourceProject().draft_config)
    expect(draft).not.toHaveProperty('publications')
    expect(draft.status).not.toBe('published')
  })

  it('mantiene configuración y deja el original intacto', () => {
    const original = sourceProject()
    const draft = buildProjectDuplicateDraft(original, {
      name: 'Copia de Mayrita',
      slug: 'mayrita-copia',
    })

    const firstConfig = draft.scenes[0]?.config as { title: string }
    firstConfig.title = 'Cambiado'

    expect(original.scenes[0]?.config).toEqual({ title: 'Hola' })
    expect(original.status).toBe('published')
    expect(original.slug).toBe('mayrita')
  })
})
