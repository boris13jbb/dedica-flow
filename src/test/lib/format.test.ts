import { describe, expect, it } from 'vitest'
import { formatDuration, formatFileSize } from '@/lib/format'

describe('formatDuration', () => {
  it('formatea minutos y segundos', () => {
    expect(formatDuration(0)).toBe('0:00')
    expect(formatDuration(9)).toBe('0:09')
    expect(formatDuration(125)).toBe('2:05')
  })

  it('devuelve guion si no hay duración válida', () => {
    expect(formatDuration(null)).toBe('—')
    expect(formatDuration(Number.NaN)).toBe('—')
    expect(formatDuration(-1)).toBe('—')
  })
})

describe('formatFileSize', () => {
  it('formatea tamaños conocidos', () => {
    expect(formatFileSize(512)).toBe('512 B')
    expect(formatFileSize(2048)).toBe('2.0 KB')
  })
})
