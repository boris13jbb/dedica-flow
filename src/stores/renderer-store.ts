import { create } from 'zustand'
import type { ExperienceConfig } from '@/types'

interface RendererState {
  // Experience data
  config: ExperienceConfig | null
  
  // Playback state
  isPlaying: boolean
  currentSceneIndex: number
  sceneProgress: number // 0-1
  
  // Control
  canSkip: boolean
  
  // Actions
  setConfig: (config: ExperienceConfig) => void
  play: () => void
  pause: () => void
  restart: () => void
  goToScene: (index: number) => void
  nextScene: () => void
  setSceneProgress: (progress: number) => void
  
  reset: () => void
}

const initialState = {
  config: null,
  isPlaying: false,
  currentSceneIndex: 0,
  sceneProgress: 0,
  canSkip: true,
}

export const useRendererStore = create<RendererState>((set, get) => ({
  ...initialState,

  setConfig: (config) => set({ config }),
  
  play: () => set({ isPlaying: true }),
  
  pause: () => set({ isPlaying: false }),
  
  restart: () => set({ 
    isPlaying: true, 
    currentSceneIndex: 0, 
    sceneProgress: 0 
  }),
  
  goToScene: (index) => {
    const { config } = get()
    if (!config || index < 0 || index >= config.scenes.length) return
    
    set({ 
      currentSceneIndex: index, 
      sceneProgress: 0,
      isPlaying: true
    })
  },
  
  nextScene: () => {
    const { config, currentSceneIndex } = get()
    if (!config) return
    
    const nextIndex = currentSceneIndex + 1
    if (nextIndex < config.scenes.length) {
      set({ 
        currentSceneIndex: nextIndex, 
        sceneProgress: 0 
      })
    } else {
      // End of experience
      set({ isPlaying: false })
    }
  },
  
  setSceneProgress: (progress) => set({ sceneProgress: progress }),
  
  reset: () => set(initialState),
}))
