import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MediaPicker } from '@/components/media/media-picker'
import { GalleryField } from '@/components/editor/media-fields'

const assets = [
  {
    id: 'img-1',
    type: 'image' as const,
    original_name: 'atardecer.jpg',
    mime_type: 'image/jpeg',
    size_bytes: 1200,
    url: 'https://cdn.example/atardecer.jpg',
    created_at: '2026-01-01T00:00:00.000Z',
    storage_path: 'a.jpg',
    bucket: 'project-assets',
    workspace_id: 'ws',
    project_id: 'p1',
    width: 100,
    height: 100,
    duration_ms: null,
    metadata: {},
  },
  {
    id: 'img-2',
    type: 'image' as const,
    original_name: 'playa.jpg',
    mime_type: 'image/jpeg',
    size_bytes: 1400,
    url: 'https://cdn.example/playa.jpg',
    created_at: '2026-01-01T00:00:00.000Z',
    storage_path: 'b.jpg',
    bucket: 'project-assets',
    workspace_id: 'ws',
    project_id: 'p1',
    width: 100,
    height: 100,
    duration_ms: null,
    metadata: {},
  },
]

vi.mock('@/app/admin/projects/[id]/media/actions', () => ({
  getProjectAssets: vi.fn(async () => assets),
}))

vi.mock('next/image', () => ({
  default: (props: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={props.alt} src={props.src} />
  ),
}))

describe('MediaPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lista assets de la biblioteca', async () => {
    render(
      <MediaPicker
        projectId="p1"
        open
        onOpenChange={() => undefined}
        mode="single"
        selectedUrls={[]}
        onConfirm={() => undefined}
      />
    )

    expect(await screen.findByText('atardecer.jpg')).toBeInTheDocument()
    expect(screen.getByText('playa.jpg')).toBeInTheDocument()
  })

  it('permite selección única', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <MediaPicker
        projectId="p1"
        open
        onOpenChange={() => undefined}
        mode="single"
        selectedUrls={[]}
        onConfirm={onConfirm}
      />
    )

    await screen.findByText('atardecer.jpg')
    await user.click(screen.getByTestId('media-select-img-1'))
    await user.click(screen.getByTestId('media-select-img-2'))
    await user.click(screen.getByTestId('media-picker-confirm'))

    expect(onConfirm).toHaveBeenCalledWith(['https://cdn.example/playa.jpg'])
  })

  it('permite selección múltiple', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <MediaPicker
        projectId="p1"
        open
        onOpenChange={() => undefined}
        mode="multiple"
        selectedUrls={[]}
        onConfirm={onConfirm}
      />
    )

    await screen.findByText('atardecer.jpg')
    await user.click(screen.getByTestId('media-select-img-1'))
    await user.click(screen.getByTestId('media-select-img-2'))
    await user.click(screen.getByTestId('media-picker-confirm'))

    expect(onConfirm).toHaveBeenCalledWith([
      'https://cdn.example/atardecer.jpg',
      'https://cdn.example/playa.jpg',
    ])
  })

  it('cancelar no altera la escena', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onOpenChange = vi.fn()
    render(
      <MediaPicker
        projectId="p1"
        open
        onOpenChange={onOpenChange}
        mode="multiple"
        selectedUrls={['https://cdn.example/original.jpg']}
        onConfirm={onConfirm}
      />
    )

    await screen.findByText('atardecer.jpg')
    await user.click(screen.getByTestId('media-select-img-1'))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onConfirm).not.toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

describe('GalleryField Photo Orbit', () => {
  it('confirma assets de Biblioteca en la configuración', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <GalleryField
        field={{
          key: 'photos',
          label: 'Fotos de la órbita',
          type: 'gallery',
        }}
        value={[]}
        projectId="p1"
        onChange={onChange}
      />
    )

    await user.click(screen.getByTestId('open-media-picker'))
    await screen.findByText('atardecer.jpg')
    await user.click(screen.getByTestId('media-select-img-1'))
    await user.click(screen.getByTestId('media-picker-confirm'))

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(['https://cdn.example/atardecer.jpg'])
    })
  })
})
