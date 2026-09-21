import { create } from 'zustand'
import { describe, it, expect, beforeEach } from 'vitest'

interface EditorState {
  currentSceneId: string | null
  selectedFieldId: string | null
  isDirty: boolean
  lastSaved: number | null
  setCurrentScene: (id: string | null) => void
  setSelectedField: (id: string | null) => void
  markDirty: () => void
  markClean: () => void
}

// Create a test instance of the store
const createTestStore = () => 
  create<EditorState>()((set) => ({
    currentSceneId: null,
    selectedFieldId: null,
    isDirty: false,
    lastSaved: null,

    setCurrentScene: (id: string | null) => set({ currentSceneId: id }),
    setSelectedField: (id: string | null) => set({ selectedFieldId: id }),
    markDirty: () => set({ isDirty: true }),
    markClean: () => set({ isDirty: false, lastSaved: Date.now() }),
  }))

describe('EditorStore', () => {
  let store: ReturnType<typeof createTestStore>

  beforeEach(() => {
    store = createTestStore()
  })

  it('should initialize with correct default values', () => {
    const state = store.getState()
    expect(state.currentSceneId).toBeNull()
    expect(state.selectedFieldId).toBeNull()
    expect(state.isDirty).toBe(false)
    expect(state.lastSaved).toBeNull()
  })

  it('should set current scene', () => {
    const state = store.getState()
    state.setCurrentScene('scene-1')
    expect(store.getState().currentSceneId).toBe('scene-1')
  })

  it('should set selected field', () => {
    const state = store.getState()
    state.setSelectedField('field-1')
    expect(store.getState().selectedFieldId).toBe('field-1')
  })

  it('should mark as dirty', () => {
    const state = store.getState()
    state.markDirty()
    expect(store.getState().isDirty).toBe(true)
  })

  it('should mark as clean and update lastSaved', () => {
    const state = store.getState()
    const beforeSave = Date.now()
    state.markClean()
    const afterState = store.getState()
    
    expect(afterState.isDirty).toBe(false)
    expect(afterState.lastSaved).toBeGreaterThanOrEqual(beforeSave)
  })
})
