import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ExperienceLoader } from '@/components/experience/renderer/loader'

describe('ExperienceLoader', () => {
  it('should render loading message', () => {
    render(<ExperienceLoader />)
    expect(screen.getByText('Cargando experiencia...')).toBeInTheDocument()
  })

  it('should have correct styling classes', () => {
    const { container } = render(<ExperienceLoader />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('w-full', 'h-full', 'flex', 'items-center', 'justify-center', 'bg-zinc-950')
  })

  it('should render animated spinner', () => {
    const { container } = render(<ExperienceLoader />)
    const spinners = container.querySelectorAll('.animate-spin')
    expect(spinners.length).toBeGreaterThan(0)
  })
})
