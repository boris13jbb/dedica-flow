import { create } from 'zustand'
import {
  insertSceneAfter,
  remapScenePositions,
  removeSceneAndSelectNeighbor,
  reorderScenesByIds,
} from '@/lib/scene-builder'
import type { Project, Scene } from '@/types'

interface EditorState {
  // Project data
  project: Project | null
  scenes: Scene[]
  
  // Editor state
  selectedSceneId: string | null
  isDirty: boolean
  isSaving: boolean
  lastSaved: Date | null
  
  // Preview state
  isPlaying: boolean
  previewDevice: 'desktop' | 'tablet' | 'mobile'
  currentSceneIndex: number
  quality: 'auto' | 'low' | 'medium' | 'high'
  
  // Actions
  setProject: (project: Project) => void
  setScenes: (scenes: Scene[]) => void
  selectScene: (sceneId: string | null) => void
  
  updateScene: (sceneId: string, updates: Partial<Scene>) => void
  addScene: (scene: Scene) => void
  insertSceneAfter: (afterId: string, scene: Scene) => void
  removeScene: (sceneId: string) => void
  reorderScenes: (sceneIds: string[]) => void
  
  setDirty: (dirty: boolean) => void
  setSaving: (saving: boolean) => void
  setLastSaved: (date: Date) => void
  
  setPlaying: (playing: boolean) => void
  setPreviewDevice: (device: 'desktop' | 'tablet' | 'mobile') => void
  setCurrentSceneIndex: (index: number) => void
  setQuality: (quality: 'auto' | 'low' | 'medium' | 'high') => void
  
  reset: () => void
}

const initialState = {
  project: null,
  scenes: [],
  selectedSceneId: null,
  isDirty: false,
  isSaving: false,
  lastSaved: null,
  isPlaying: false,
  previewDevice: 'desktop' as const,
  currentSceneIndex: 0,
  quality: 'auto' as const,
}

export const useEditorStore = create<EditorState>((set) => ({
  ...initialState,

  setProject: (project) => set({ project }),
  
  setScenes: (scenes) => set({ scenes }),
  
  selectScene: (sceneId) => set({ selectedSceneId: sceneId }),
  
  updateScene: (sceneId, updates) =>
    set((state) => ({
      scenes: state.scenes.map((scene) =>
        scene.id === sceneId ? { ...scene, ...updates } : scene
      ),
      isDirty: true,
    })),
  
  addScene: (scene) =>
    set((state) => ({
      scenes: remapScenePositions([...state.scenes, scene]),
      selectedSceneId: scene.id,
      isDirty: true,
    })),

  insertSceneAfter: (afterId, scene) =>
    set((state) => ({
      scenes: insertSceneAfter(state.scenes, afterId, scene),
      selectedSceneId: scene.id,
      isDirty: true,
    })),
  
  removeScene: (sceneId) =>
    set((state) => {
      const next = removeSceneAndSelectNeighbor(
        state.scenes,
        sceneId,
        state.selectedSceneId
      )
      return {
        scenes: next.scenes,
        selectedSceneId: next.selectedId,
        isDirty: true,
      }
    }),
  
  reorderScenes: (sceneIds) =>
    set((state) => ({
      scenes: reorderScenesByIds(state.scenes, sceneIds),
      isDirty: true,
    })),
  
  setDirty: (dirty) => set({ isDirty: dirty }),
  setSaving: (saving) => set({ isSaving: saving }),
  setLastSaved: (date) => set({ lastSaved: date }),
  
  setPlaying: (playing) => set({ isPlaying: playing }),
  setPreviewDevice: (device) => set({ previewDevice: device }),
  setCurrentSceneIndex: (index) => set({ currentSceneIndex: index }),
  setQuality: (quality) => set({ quality }),
  
  reset: () => set(initialState),
}))
