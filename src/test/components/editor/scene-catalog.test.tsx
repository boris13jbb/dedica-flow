import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SceneCatalog } from '@/components/editor/scene-catalog'
import { getAllSceneDefinitions } from '@/components/experience/registry'

describe('SceneCatalog', () => {
  it('lista todos los tipos del registry', () => {
    render(
      <SceneCatalog open onOpenChange={() => undefined} onSelectType={() => undefined} />
    )

    for (const definition of getAllSceneDefinitions()) {
      expect(screen.getByTestId(`scene-catalog-${definition.type}`)).toBeInTheDocument()
      expect(screen.getByText(definition.name)).toBeInTheDocument()
    }
  })

  it('elige un tipo al hacer click', async () => {
    const user = userEvent.setup()
    const onSelectType = vi.fn()
    render(
      <SceneCatalog open onOpenChange={() => undefined} onSelectType={onSelectType} />
    )

    await user.click(screen.getByTestId('scene-catalog-photoOrbit'))
    expect(onSelectType).toHaveBeenCalledWith('photoOrbit')
  })
})
