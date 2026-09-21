import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WebGLFallback } from '@/components/experience/renderer/webgl-fallback'

// Mock useDeviceCapabilities hook
vi.mock('@/hooks', () => ({
  useDeviceCapabilities: vi.fn(() => ({
    hasWebGL: true,
    dpr: 1,
    isMobile: false,
    prefersReducedMotion: false,
    memoryGB: 4,
  })),
  useQualityManager: vi.fn(() => ({
    level: 'medium',
    particleMultiplier: 0.6,
    enableBloom: false,
    enableShadows: false,
    antialias: true,
    pixelRatio: 1,
  })),
}))

describe('WebGLFallback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render children when WebGL is available', () => {
    const { getByText } = render(
      <WebGLFallback>
        <div>Test Content</div>
      </WebGLFallback>
    )
    
    expect(getByText('Test Content')).toBeInTheDocument()
  })

  it('should show fallback message when WebGL is not available', async () => {
    const { useDeviceCapabilities } = await import('@/hooks')
    vi.mocked(useDeviceCapabilities).mockReturnValue({
      hasWebGL: false,
      dpr: 1,
      isMobile: false,
      prefersReducedMotion: false,
      memoryGB: 4,
    })

    const { getByText, queryByText } = render(
      <WebGLFallback>
        <div>Test Content</div>
      </WebGLFallback>
    )
    
    // Should show fallback message
    expect(getByText('WebGL no disponible')).toBeInTheDocument()
    // Should not show children
    expect(queryByText('Test Content')).not.toBeInTheDocument()
  })
})
