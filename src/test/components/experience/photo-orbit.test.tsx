import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PhotoOrbitEmptyState } from '@/components/experience/scenes/photo-orbit/photo-orbit-empty-state'
import {
  findNextEnabledSceneIndex,
  isEmptyPhotoOrbitConfig,
  normalizePhotoUrls,
  prepareScenesForPresentation,
  resolvePhotoOrbitView,
} from '@/components/experience/scenes/photo-orbit/photo-orbit-utils'
import type { SceneConfig } from '@/types'

function makeScene(
  partial: Partial<SceneConfig> & Pick<SceneConfig, 'id' | 'sceneType' | 'enabled' | 'config'>
): SceneConfig {
  return {
    sceneKey: partial.sceneKey ?? partial.id,
    name: partial.name ?? partial.id,
    position: partial.position ?? 0,
    duration: partial.duration ?? { enter: 0, hold: 1000, exit: 0 },
    trigger: partial.trigger ?? 'auto',
    ...partial,
  }
}

describe('photo-orbit utils', () => {
  it('normaliza fotos desde array y texto multilínea', () => {
    expect(normalizePhotoUrls([' https://a.jpg ', '', 'https://b.jpg'])).toEqual([
      'https://a.jpg',
      'https://b.jpg',
    ])
    expect(normalizePhotoUrls('https://a.jpg\n\nhttps://b.jpg\n')).toEqual([
      'https://a.jpg',
      'https://b.jpg',
    ])
    expect(normalizePhotoUrls(null)).toEqual([])
  })

  it('detecta órbita vacía y órbita con fotos', () => {
    expect(isEmptyPhotoOrbitConfig({ photos: [] })).toBe(true)
    expect(isEmptyPhotoOrbitConfig({ photos: ['https://a.jpg'] })).toBe(false)
  })

  it('con fotos resuelve vista de escena normal', () => {
    expect(resolvePhotoOrbitView(['https://a.jpg'], 'published')).toEqual({
      kind: 'scene',
      urls: ['https://a.jpg'],
    })
    expect(resolvePhotoOrbitView(['https://a.jpg'], 'editor')).toEqual({
      kind: 'scene',
      urls: ['https://a.jpg'],
    })
  })

  it('sin fotos en editor pide empty state administrativo', () => {
    expect(resolvePhotoOrbitView([], 'editor')).toEqual({ kind: 'editor-empty' })
  })

  it('sin fotos en published omite sin copy de inspector', () => {
    expect(resolvePhotoOrbitView([], 'published')).toEqual({ kind: 'published-skip' })
    expect(resolvePhotoOrbitView('', 'published')).toEqual({ kind: 'published-skip' })
  })

  it('en modo editor conserva escenas photoOrbit vacías habilitadas', () => {
    const scenes = [
      makeScene({
        id: 'photos',
        sceneType: 'photoOrbit',
        enabled: true,
        config: { photos: [] },
      }),
    ]

    const prepared = prepareScenesForPresentation(scenes, 'editor')
    expect(prepared[0]?.enabled).toBe(true)
  })

  it('en modo published desactiva photoOrbit sin fotos y no toca las que sí tienen', () => {
    const scenes = [
      makeScene({
        id: 'empty',
        sceneType: 'photoOrbit',
        enabled: true,
        config: { photos: [] },
      }),
      makeScene({
        id: 'filled',
        sceneType: 'photoOrbit',
        enabled: true,
        config: { photos: ['https://a.jpg'] },
      }),
      makeScene({
        id: 'message',
        sceneType: 'message',
        enabled: true,
        config: { text: 'hola' },
      }),
    ]

    const prepared = prepareScenesForPresentation(scenes, 'published')
    expect(prepared[0]?.enabled).toBe(false)
    expect(prepared[1]?.enabled).toBe(true)
    expect(prepared[2]?.enabled).toBe(true)
  })

  it('salta a la siguiente escena habilitada tras una órbita vacía desactivada', () => {
    const scenes = [
      makeScene({
        id: 'flowers',
        sceneType: 'flowers',
        enabled: true,
        config: {},
        position: 0,
      }),
      makeScene({
        id: 'empty-photos',
        sceneType: 'photoOrbit',
        enabled: false,
        config: { photos: [] },
        position: 1,
      }),
      makeScene({
        id: 'message',
        sceneType: 'message',
        enabled: true,
        config: { text: 'siguiente' },
        position: 2,
      }),
    ]

    expect(findNextEnabledSceneIndex(scenes, 0)).toBe(2)
  })
})

describe('PhotoOrbitEmptyState (editor)', () => {
  it('muestra instrucción útil del inspector', () => {
    render(<PhotoOrbitEmptyState />)
    expect(screen.getByTestId('photo-orbit-empty-state')).toBeInTheDocument()
    expect(screen.getByText('No hay fotos')).toBeInTheDocument()
    expect(screen.getByText('Agrega fotografías desde el inspector')).toBeInTheDocument()
    expect(screen.queryByText(/Agrega URLs en el inspector/i)).not.toBeInTheDocument()
  })
})
