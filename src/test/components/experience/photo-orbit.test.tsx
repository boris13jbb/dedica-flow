import { Component, type ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PhotoCardErrorBoundary } from '@/components/experience/scenes/photo-orbit/photo-card-error-boundary'
import { PhotoOrbitEmptyState } from '@/components/experience/scenes/photo-orbit/photo-orbit-empty-state'
import {
  findNextEnabledSceneIndex,
  isEmptyPhotoOrbitConfig,
  isLoadablePhotoUrl,
  normalizePhotoUrls,
  prepareScenesForPresentation,
  resolvePhotoOrbitView,
} from '@/components/experience/scenes/photo-orbit/photo-orbit-utils'
import type { SceneConfig } from '@/types'

function ThrowingTexture({ message }: { message: string }) {
  throw new Error(message)
}

class CaptureRenderError extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return <div>experiencia-caida</div>
    }
    return this.props.children
  }
}

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

  it('acepta imágenes directas y assets de biblioteca/CDN sin exigir extensión', () => {
    expect(isLoadablePhotoUrl('https://cdn.example.com/foto.jpg')).toBe(true)
    expect(isLoadablePhotoUrl('https://cdn.example.com/foto.png')).toBe(true)
    expect(isLoadablePhotoUrl('https://cdn.example.com/foto.webp')).toBe(true)
    expect(
      isLoadablePhotoUrl(
        'https://xyz.supabase.co/storage/v1/object/public/media/IDPhoto_20240801_200936.jpg'
      )
    ).toBe(true)
    expect(
      isLoadablePhotoUrl(
        'https://xyz.supabase.co/storage/v1/object/sign/media/abc123?token=signed-token'
      )
    ).toBe(true)
  })

  it('rechaza páginas y archivos que claramente no son textura', () => {
    expect(isLoadablePhotoUrl('https://photos.app.goo.gl/heuVAFRz2xWhJF1R6')).toBe(false)
    expect(isLoadablePhotoUrl('https://photos.google.com/share/abc')).toBe(false)
    expect(isLoadablePhotoUrl('https://example.com/album.html')).toBe(false)
    expect(isLoadablePhotoUrl('https://cdn.example.com/audio.mp3')).toBe(false)
    expect(isLoadablePhotoUrl('not-a-url')).toBe(false)
    expect(isLoadablePhotoUrl('https://lh3.googleusercontent.com/foto.jpg')).toBe(true)
  })

  it('un álbum de Google Photos se considera órbita vacía para published-skip', () => {
    expect(
      isEmptyPhotoOrbitConfig({ photos: ['https://photos.app.goo.gl/heuVAFRz2xWhJF1R6'] })
    ).toBe(true)
  })

  it('con fotos resuelve vista de escena normal', () => {
    expect(resolvePhotoOrbitView(['https://a.jpg'], 'published')).toEqual({
      kind: 'scene',
      urls: ['https://a.jpg'],
    })
    expect(resolvePhotoOrbitView(['https://a.png'], 'published')).toEqual({
      kind: 'scene',
      urls: ['https://a.png'],
    })
    expect(resolvePhotoOrbitView(['https://a.webp'], 'editor')).toEqual({
      kind: 'scene',
      urls: ['https://a.webp'],
    })
  })

  it('sin fotos en editor pide empty state administrativo', () => {
    expect(resolvePhotoOrbitView([], 'editor')).toEqual({ kind: 'editor-empty' })
  })

  it('sin fotos en published omite sin copy de inspector', () => {
    expect(resolvePhotoOrbitView([], 'published')).toEqual({ kind: 'published-skip' })
    expect(resolvePhotoOrbitView('', 'published')).toEqual({ kind: 'published-skip' })
  })

  it('álbum de Google Photos en published se omite; en editor avisa', () => {
    const album = ['https://photos.app.goo.gl/heuVAFRz2xWhJF1R6']
    expect(resolvePhotoOrbitView(album, 'published')).toEqual({ kind: 'published-skip' })
    expect(resolvePhotoOrbitView(album, 'editor')).toEqual({ kind: 'editor-invalid' })
  })

  it('mezcla álbum y foto directa y solo usa la foto cargable', () => {
    expect(
      resolvePhotoOrbitView(
        [
          'https://photos.app.goo.gl/heuVAFRz2xWhJF1R6',
          'https://example.com/page.html',
          'https://cdn.example.com/a.jpg',
        ],
        'published'
      )
    ).toEqual({ kind: 'scene', urls: ['https://cdn.example.com/a.jpg'] })
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

  it('en modo published desactiva photoOrbit con álbum de Google Photos', () => {
    const scenes = [
      makeScene({
        id: 'album',
        sceneType: 'photoOrbit',
        enabled: true,
        config: { photos: ['https://photos.app.goo.gl/heuVAFRz2xWhJF1R6'] },
      }),
    ]

    const prepared = prepareScenesForPresentation(scenes, 'published')
    expect(prepared[0]?.enabled).toBe(false)
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

  it('explica que un álbum de Google Photos no es una imagen', () => {
    render(<PhotoOrbitEmptyState variant="invalid" />)
    expect(screen.getByTestId('photo-orbit-empty-state')).toHaveAttribute(
      'data-variant',
      'invalid'
    )
    expect(screen.getByText('Este enlace no es una imagen')).toBeInTheDocument()
    expect(screen.getByText(/álbumes de Google Photos/i)).toBeInTheDocument()
  })
})

describe('aislamiento de error de textura', () => {
  it('un fallo de textura no tumba al resto de la experiencia', () => {
    render(
      <CaptureRenderError>
        <div>
          <PhotoCardErrorBoundary>
            <ThrowingTexture message="Could not load https://cdn.example.com/roto.jpg" />
          </PhotoCardErrorBoundary>
          <span>orbita-hermana</span>
        </div>
      </CaptureRenderError>
    )

    expect(screen.getByText('orbita-hermana')).toBeInTheDocument()
    expect(screen.queryByText('experiencia-caida')).not.toBeInTheDocument()
  })
})
