import { describe, expect, it } from 'vitest'
import {
  applySingleMediaValue,
  buildNewScenePayload,
  cloneSceneForDuplicate,
  deepCloneValue,
  insertSceneAfter,
  mergeUniqueUrls,
  moveUrl,
  normalizeGalleryUrls,
  removeSceneAndSelectNeighbor,
  reorderScenesByIds,
} from '@/lib/scene-builder'
import type { Scene } from '@/types'

function makeScene(partial: Partial<Scene> & Pick<Scene, 'id'>): Scene {
  return {
    project_id: 'project-1',
    scene_key: partial.scene_key ?? partial.id,
    scene_type: 'message',
    name: 'Escena',
    position: 0,
    duration_ms: 5000,
    trigger_mode: 'auto',
    enabled: true,
    config: { text: 'hola' },
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...partial,
  }
}

describe('scene-builder', () => {
  it('crea una escena con configuración inicial del registry', () => {
    const payload = buildNewScenePayload('photoOrbit', 3, 1700000000000)

    expect(payload.scene_type).toBe('photoOrbit')
    expect(payload.name).toBe('Órbita de Fotos')
    expect(payload.position).toBe(3)
    expect(payload.enabled).toBe(true)
    expect(payload.scene_key).toBe('photoOrbit-1700000000000')
    expect(payload.config).toEqual(
      expect.objectContaining({
        photos: [],
        radius: expect.any(Number),
      })
    )
  })

  it('duplica una escena con id/key nuevos y copia independiente', () => {
    const original = makeScene({
      id: 'scene-4',
      scene_key: 'orbit-a',
      scene_type: 'photoOrbit',
      name: 'Fotos',
      position: 3,
      config: { photos: ['https://cdn.example/a.jpg'] },
    })

    const copy = cloneSceneForDuplicate(original, 99)

    expect(copy.scene_key).toBe('orbit-a-copy-99')
    expect(copy.scene_type).toBe('photoOrbit')
    expect(copy.config).toEqual({ photos: ['https://cdn.example/a.jpg'] })
    expect(copy.config).not.toBe(original.config)

    const clonedConfig = copy.config as { photos: string[] }
    clonedConfig.photos.push('https://cdn.example/b.jpg')
    expect(original.config).toEqual({ photos: ['https://cdn.example/a.jpg'] })
  })

  it('inserta la copia justo después y recorre posiciones', () => {
    const scenes = [
      makeScene({ id: 'a', position: 0 }),
      makeScene({ id: 'b', position: 1 }),
      makeScene({ id: 'c', position: 2 }),
      makeScene({ id: 'd', position: 3 }),
    ]
    const copy = makeScene({ id: 'b-copy', name: 'B (copia)', position: 2 })

    const next = insertSceneAfter(scenes, 'b', copy)

    expect(next.map((scene) => scene.id)).toEqual(['a', 'b', 'b-copy', 'c', 'd'])
    expect(next.map((scene) => scene.position)).toEqual([0, 1, 2, 3, 4])
  })

  it('reordena por ids y persiste el nuevo position', () => {
    const scenes = [
      makeScene({ id: 'a', position: 0 }),
      makeScene({ id: 'b', position: 1 }),
      makeScene({ id: 'c', position: 2 }),
    ]

    const next = reorderScenesByIds(scenes, ['c', 'a', 'b'])

    expect(next.map((scene) => scene.id)).toEqual(['c', 'a', 'b'])
    expect(next.map((scene) => scene.position)).toEqual([0, 1, 2])
  })

  it('elimina y selecciona una escena vecina válida', () => {
    const scenes = [
      makeScene({ id: 'a', position: 0 }),
      makeScene({ id: 'b', position: 1 }),
      makeScene({ id: 'c', position: 2 }),
    ]

    const middle = removeSceneAndSelectNeighbor(scenes, 'b', 'b')
    expect(middle.selectedId).toBe('c')
    expect(middle.scenes.map((scene) => scene.id)).toEqual(['a', 'c'])
    expect(middle.scenes.map((scene) => scene.position)).toEqual([0, 1])

    const last = removeSceneAndSelectNeighbor(scenes, 'c', 'c')
    expect(last.selectedId).toBe('b')
  })

  it('no comparte objetos mutables al clonar', () => {
    const original = { nested: { value: 1 } }
    const copy = deepCloneValue(original)
    copy.nested.value = 2
    expect(original.nested.value).toBe(1)
  })

  it('normaliza galerías y aplica selección de media', () => {
    expect(normalizeGalleryUrls('a.jpg\nb.jpg')).toEqual(['a.jpg', 'b.jpg'])
    expect(mergeUniqueUrls(['a'], ['a', 'b'], 2)).toEqual(['a', 'b'])
    expect(moveUrl(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b'])
    expect(applySingleMediaValue('  ')).toBeNull()
    expect(applySingleMediaValue('https://cdn.example/x.jpg')).toBe(
      'https://cdn.example/x.jpg'
    )
  })
})
