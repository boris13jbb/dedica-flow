import { beforeEach, describe, expect, it } from 'vitest'
import { useEditorStore } from '@/stores/editor-store'
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

describe('useEditorStore scene builder', () => {
  beforeEach(() => {
    useEditorStore.getState().reset()
  })

  it('añade una escena y la selecciona', () => {
    useEditorStore.getState().setScenes([makeScene({ id: 'a', position: 0 })])
    useEditorStore.getState().addScene(makeScene({ id: 'b', name: 'Nueva', position: 1 }))

    const state = useEditorStore.getState()
    expect(state.scenes).toHaveLength(2)
    expect(state.selectedSceneId).toBe('b')
    expect(state.isDirty).toBe(true)
  })

  it('duplica insertando después y selecciona la copia', () => {
    useEditorStore.getState().setScenes([
      makeScene({ id: 'a', position: 0 }),
      makeScene({ id: 'b', position: 1 }),
      makeScene({ id: 'c', position: 2 }),
    ])
    useEditorStore.getState().selectScene('b')
    useEditorStore
      .getState()
      .insertSceneAfter('b', makeScene({ id: 'b-copy', name: 'B (copia)', position: 2 }))

    const state = useEditorStore.getState()
    expect(state.scenes.map((scene) => scene.id)).toEqual(['a', 'b', 'b-copy', 'c'])
    expect(state.scenes.map((scene) => scene.position)).toEqual([0, 1, 2, 3])
    expect(state.selectedSceneId).toBe('b-copy')
  })

  it('reordena y marca dirty para persistir el orden', () => {
    useEditorStore.getState().setScenes([
      makeScene({ id: 'a', position: 0 }),
      makeScene({ id: 'b', position: 1 }),
      makeScene({ id: 'c', position: 2 }),
    ])
    useEditorStore.getState().reorderScenes(['c', 'a', 'b'])

    const state = useEditorStore.getState()
    expect(state.scenes.map((scene) => scene.id)).toEqual(['c', 'a', 'b'])
    expect(state.scenes.map((scene) => scene.position)).toEqual([0, 1, 2])
    expect(state.isDirty).toBe(true)
  })

  it('activa y desactiva sin perder la escena', () => {
    useEditorStore.getState().setScenes([makeScene({ id: 'a', enabled: true })])
    useEditorStore.getState().updateScene('a', { enabled: false })
    expect(useEditorStore.getState().scenes[0]?.enabled).toBe(false)
    useEditorStore.getState().updateScene('a', { enabled: true })
    expect(useEditorStore.getState().scenes[0]?.enabled).toBe(true)
  })

  it('elimina y selecciona una vecina, sin índices inválidos', () => {
    useEditorStore.getState().setScenes([
      makeScene({ id: 'a', position: 0 }),
      makeScene({ id: 'b', position: 1 }),
      makeScene({ id: 'c', position: 2 }),
    ])
    useEditorStore.getState().selectScene('c')
    useEditorStore.getState().removeScene('c')

    const state = useEditorStore.getState()
    expect(state.scenes.map((scene) => scene.id)).toEqual(['a', 'b'])
    expect(state.selectedSceneId).toBe('b')
    expect(state.scenes.every((scene, index) => scene.position === index)).toBe(true)
  })
})
