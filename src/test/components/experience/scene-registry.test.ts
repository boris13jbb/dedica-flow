import { sceneRegistry } from '@/components/experience/registry/scene-registry'
import { describe, it, expect } from 'vitest'
import type { SceneType } from '@/types'

describe('SceneRegistry', () => {
  it('should have all required scene types', () => {
    const requiredScenes: SceneType[] = ['intro', 'galaxy', 'message', 'finale', 'nebula', 'flowers', 'photoOrbit']
    
    requiredScenes.forEach(sceneType => {
      expect(sceneRegistry.has(sceneType)).toBe(true)
    })
  })

  it('should have valid scene definitions', () => {
    sceneRegistry.forEach((definition, key) => {
      expect(definition).toHaveProperty('type')
      expect(definition).toHaveProperty('name')
      expect(definition).toHaveProperty('description')
      expect(definition).toHaveProperty('icon')
      expect(definition).toHaveProperty('defaultConfig')
      expect(definition).toHaveProperty('fields')
      
      expect(definition.type).toBe(key)
      expect(Array.isArray(definition.fields)).toBe(true)
    })
  })

  it('should have editor fields with correct structure', () => {
    sceneRegistry.forEach((definition) => {
      definition.fields.forEach(field => {
        expect(field).toHaveProperty('key')
        expect(field).toHaveProperty('label')
        expect(field).toHaveProperty('type')
        
        expect(typeof field.key).toBe('string')
        expect(typeof field.label).toBe('string')
        expect(['text', 'number', 'color', 'toggle', 'select', 'range', 'textarea', 'image', 'gallery', 'audio']).toContain(field.type)
      })
    })
  })

  it('should have unique scene types', () => {
    const types = Array.from(sceneRegistry.keys())
    const uniqueTypes = new Set(types)
    expect(types.length).toBe(uniqueTypes.size)
  })

  it('should have intro scene with correct config', () => {
    const intro = sceneRegistry.get('intro')
    expect(intro).toBeDefined()
    expect(intro?.defaultConfig).toHaveProperty('title')
    expect(intro?.defaultConfig).toHaveProperty('subtitle')
  })

  it('should have galaxy scene with correct config', () => {
    const galaxy = sceneRegistry.get('galaxy')
    expect(galaxy).toBeDefined()
    expect(galaxy?.defaultConfig).toHaveProperty('starCount')
    expect(galaxy?.defaultConfig).toHaveProperty('rotationSpeed')
  })
})
