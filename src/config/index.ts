// App configuration
export const appConfig = {
  name: 'DedicaStudio',
  description: 'Plataforma para crear experiencias web audiovisuales e interactivas',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  version: '0.1.0',
} as const

// Experience configuration
export const experienceConfig = {
  defaultQuality: 'auto' as const,
  minFPS: 30,
  targetFPS: 60,
  qualities: ['low', 'medium', 'high', 'auto'] as const,
  maxParticles: {
    low: 500,
    medium: 2000,
    high: 5000,
  },
} as const

// Media configuration
export const mediaConfig = {
  maxFileSize: {
    image: 10 * 1024 * 1024, // 10MB
    audio: 20 * 1024 * 1024, // 20MB
    video: 100 * 1024 * 1024, // 100MB
  },
  allowedMimeTypes: {
    image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
    video: ['video/mp4', 'video/webm'],
  },
} as const

// Routes
export const routes = {
  public: {
    experience: (slug: string) => `/p/${slug}`,
  },
  auth: {
    login: '/login',
  },
  admin: {
    dashboard: '/admin',
    projects: {
      list: '/admin/projects',
      new: '/admin/projects/new',
      edit: (id: string) => `/admin/projects/${id}/edit`,
      preview: (id: string) => `/admin/projects/${id}/preview`,
    },
    templates: '/admin/templates',
    settings: '/admin/settings',
  },
} as const
