import type { Database } from './database.types'

// Workspace types
export type Workspace = Database['public']['Tables']['workspaces']['Row']
export type WorkspaceInsert = Database['public']['Tables']['workspaces']['Insert']
export type WorkspaceMember = Database['public']['Tables']['workspace_members']['Row']
export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer'

// Project types
export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']
export type ProjectStatus = 'draft' | 'published' | 'archived'

// Scene types
export type Scene = Database['public']['Tables']['scenes']['Row']
export type SceneInsert = Database['public']['Tables']['scenes']['Insert']
export type SceneUpdate = Database['public']['Tables']['scenes']['Update']
export type SceneType = 
  | 'intro'
  | 'galaxy'
  | 'nebula'
  | 'flowers'
  | 'photoOrbit'
  | 'message'
  | 'finale'

export type TriggerMode = 'auto' | 'click' | 'manual'

// Asset types
export type Asset = Database['public']['Tables']['assets']['Row']
export type AssetInsert = Database['public']['Tables']['assets']['Insert']
export type AssetType = 'image' | 'audio' | 'video'

// Template types
export type Template = Database['public']['Tables']['templates']['Row']
export type TemplateInsert = Database['public']['Tables']['templates']['Insert']

// Publication types
export type Publication = Database['public']['Tables']['publications']['Row']
export type PublicationInsert = Database['public']['Tables']['publications']['Insert']
export type PublicationStatus = 'active' | 'inactive' | 'superseded'

// Experience types
export interface ExperienceConfig {
  projectId: string
  name: string
  slug: string
  scenes: SceneConfig[]
  audio?: AudioConfig
  metadata?: ExperienceMetadata
}

export interface SceneConfig {
  id: string
  sceneKey: string
  sceneType: SceneType
  name: string
  position: number
  duration: {
    enter: number
    hold: number
    exit: number
  }
  trigger: TriggerMode
  enabled: boolean
  config: Record<string, unknown>
}

export interface AudioConfig {
  assetId?: string
  volume: number
  loop: boolean
  fadeIn: number
  fadeOut: number
}

export interface ExperienceMetadata {
  title?: string
  description?: string
  ogImage?: string
  noIndex: boolean
}

// Quality types
export type QualityLevel = 'auto' | 'low' | 'medium' | 'high'

export interface QualitySettings {
  level: QualityLevel
  pixelRatio: number
  particleCount: number
  enableBloom: boolean
  enablePostprocessing: boolean
  shadowQuality: 'none' | 'low' | 'high'
}
