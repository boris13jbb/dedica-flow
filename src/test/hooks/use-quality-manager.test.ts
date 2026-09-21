import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useDeviceCapabilities, useQualityManager } from '@/hooks'

describe('useDeviceCapabilities', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should detect WebGL support', async () => {
    const { result } = renderHook(() => useDeviceCapabilities())
    
    await act(async () => {
      vi.runAllTimers()
    })
    
    expect(result.current).toHaveProperty('hasWebGL')
    expect(typeof result.current.hasWebGL).toBe('boolean')
  })

  it('should detect device pixel ratio', async () => {
    const { result } = renderHook(() => useDeviceCapabilities())
    
    await act(async () => {
      vi.runAllTimers()
    })
    
    expect(result.current.dpr).toBeGreaterThan(0)
  })

  it('should detect mobile devices', async () => {
    const { result } = renderHook(() => useDeviceCapabilities())
    
    await act(async () => {
      vi.runAllTimers()
    })
    
    expect(typeof result.current.isMobile).toBe('boolean')
  })

  it('should detect prefers-reduced-motion', async () => {
    const { result } = renderHook(() => useDeviceCapabilities())
    
    await act(async () => {
      vi.runAllTimers()
    })
    
    expect(typeof result.current.prefersReducedMotion).toBe('boolean')
  })
})

describe('useQualityManager', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should return quality settings with low mode', async () => {
    const { result } = renderHook(() => useQualityManager('low'))
    
    await act(async () => {
      vi.runAllTimers()
    })
    
    expect(result.current.level).toBe('low')
    expect(result.current.particleMultiplier).toBe(0.3)
    expect(result.current.enableBloom).toBe(false)
  })

  it('should return quality settings with medium mode', async () => {
    const { result } = renderHook(() => useQualityManager('medium'))
    
    await act(async () => {
      vi.runAllTimers()
    })
    
    expect(result.current.level).toBe('medium')
    expect(result.current.particleMultiplier).toBe(0.6)
    expect(result.current.antialias).toBe(true)
  })

  it('should return quality settings with high mode', async () => {
    const { result } = renderHook(() => useQualityManager('high'))
    
    await act(async () => {
      vi.runAllTimers()
    })
    
    expect(result.current.level).toBe('high')
    expect(result.current.particleMultiplier).toBe(1)
    expect(result.current.enableBloom).toBe(true)
    expect(result.current.enableShadows).toBe(true)
  })

  it('should adjust quality automatically in auto mode', async () => {
    const { result } = renderHook(() => useQualityManager('auto'))
    
    await act(async () => {
      vi.runAllTimers()
    })
    
    expect(result.current.level).toMatch(/^(low|medium|high)$/)
  })
})
