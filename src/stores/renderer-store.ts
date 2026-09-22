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

  setConfig: (config) => {
    const prev = get().config
    // Evita bucles cuando el padre pasa un objeto nuevo con el mismo contenido
    if (prev && configSignature(prev) === configSignature(config)) {
      return
    }

    // Si solo cambió el contenido editable (textos/config), no reiniciar la escena
    // ni el progreso: reiniciar robaba el foco de los inputs del inspector.
    if (prev && structureSignature(prev) === structureSignature(config)) {
      set({ config })
      return
    }

    set({
      config,
      currentSceneIndex: 0,
      sceneProgress: 0,
      isPlaying: false,
    })
  },
  
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
  
  setSceneProgress: (progress) => {
    const rounded = Math.round(progress * 1000) / 1000
    if (get().sceneProgress === rounded) return
    set({ sceneProgress: rounded })
  },
  
  reset: () => set(initialState),
}))

function configSignature(config: ExperienceConfig): string {
  return JSON.stringify({
    projectId: config.projectId,
    slug: config.slug,
    scenes: config.scenes.map((s) => ({
      id: s.id,
      position: s.position,
      enabled: s.enabled,
      trigger: s.trigger,
      duration: s.duration,
      config: s.config,
    })),
    audio: config.audio,
  })
}

/** Identidad estructural: sin configs editables (textos, colores, etc.). */
function structureSignature(config: ExperienceConfig): string {
  return JSON.stringify({
    projectId: config.projectId,
    slug: config.slug,
    scenes: config.scenes.map((s) => ({
      id: s.id,
      position: s.position,
      enabled: s.enabled,
      trigger: s.trigger,
      duration: s.duration,
      sceneType: s.sceneType,
    })),
  })
}
