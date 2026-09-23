import { beforeEach, describe, expect, it } from 'vitest'
import { useRendererStore } from '@/stores/renderer-store'
import { prepareScenesForPresentation } from '@/components/experience/scenes/photo-orbit/photo-orbit-utils'
import type { ExperienceConfig, SceneConfig } from '@/types'

function scene(
  partial: Partial<SceneConfig> & Pick<SceneConfig, 'id' | 'sceneType' | 'enabled' | 'config'>
): SceneConfig {
  return {
    sceneKey: partial.id,
    name: partial.id,
    position: partial.position ?? 0,
    duration: { enter: 0, hold: 500, exit: 0 },
    trigger: 'auto',
    ...partial,
  }
}

describe('renderer-store scene skipping', () => {
  beforeEach(() => {
    useRendererStore.getState().reset()
  })

  it('en flujo publicado omite photoOrbit vacía y continúa a la siguiente', () => {
    const raw: ExperienceConfig = {
      projectId: 'p1',
      name: 'Demo',
      slug: 'demo',
      scenes: [
        scene({ id: 'intro', sceneType: 'intro', enabled: true, config: {}, position: 0 }),
        scene({
          id: 'photos',
          sceneType: 'photoOrbit',
          enabled: true,
          config: { photos: [] },
          position: 1,
        }),
        scene({
          id: 'message',
          sceneType: 'message',
          enabled: true,
          config: { text: 'ok' },
          position: 2,
        }),
      ],
    }

    const published = {
      ...raw,
      scenes: prepareScenesForPresentation(raw.scenes, 'published'),
    }

    useRendererStore.getState().setConfig(published)
    expect(useRendererStore.getState().currentSceneIndex).toBe(0)

    useRendererStore.getState().nextScene()
    expect(useRendererStore.getState().currentSceneIndex).toBe(2)
    expect(published.scenes[useRendererStore.getState().currentSceneIndex]?.sceneType).toBe(
      'message'
    )
  })

  it('en flujo publicado omite photoOrbit con álbum inválido y continúa', () => {
    const raw: ExperienceConfig = {
      projectId: 'p1',
      name: 'Demo',
      slug: 'demo',
      scenes: [
        scene({ id: 'intro', sceneType: 'intro', enabled: true, config: {}, position: 0 }),
        scene({
          id: 'photos',
          sceneType: 'photoOrbit',
          enabled: true,
          config: { photos: ['https://photos.app.goo.gl/heuVAFRz2xWhJF1R6'] },
          position: 1,
        }),
        scene({
          id: 'galaxy',
          sceneType: 'galaxy',
          enabled: true,
          config: {},
          position: 2,
        }),
      ],
    }

    const published = {
      ...raw,
      scenes: prepareScenesForPresentation(raw.scenes, 'published'),
    }

    expect(published.scenes[1]?.enabled).toBe(false)
    useRendererStore.getState().setConfig(published)
    useRendererStore.getState().nextScene()
    expect(published.scenes[useRendererStore.getState().currentSceneIndex]?.sceneType).toBe(
      'galaxy'
    )
  })
})
