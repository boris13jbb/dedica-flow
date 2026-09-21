import { create } from 'zustand'
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
      scenes: [...state.scenes, scene],
      isDirty: true,
    })),
  
  removeScene: (sceneId) =>
    set((state) => ({
      scenes: state.scenes.filter((s) => s.id !== sceneId),
      selectedSceneId: state.selectedSceneId === sceneId ? null : state.selectedSceneId,
      isDirty: true,
    })),
  
  reorderScenes: (sceneIds) =>
    set((state) => {
      const sceneMap = new Map(state.scenes.map((s) => [s.id, s]))
      const reordered = sceneIds
        .map((id) => sceneMap.get(id))
        .filter((s): s is Scene => s !== undefined)
        .map((scene, index) => ({ ...scene, position: index }))
      
      return {
        scenes: reordered,
        isDirty: true,
      }
    }),
  
  setDirty: (dirty) => set({ isDirty: dirty }),
  setSaving: (saving) => set({ isSaving: saving }),
  setLastSaved: (date) => set({ lastSaved: date }),
  
  setPlaying: (playing) => set({ isPlaying: playing }),
  setPreviewDevice: (device) => set({ previewDevice: device }),
  setCurrentSceneIndex: (index) => set({ currentSceneIndex: index }),
  setQuality: (quality) => set({ quality }),
  
  reset: () => set(initialState),
}))
