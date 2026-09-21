import { z } from 'zod'
import type { SceneType } from '@/types'

// Base schema for all scenes
export const baseSceneSchema = z.object({
  enter: z.number().min(0).default(1000),
  hold: z.number().min(0).default(5000),
  exit: z.number().min(0).default(1000),
})

// Field types for dynamic editor
export type EditorFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'range'
  | 'color'
  | 'toggle'
  | 'select'
  | 'image'
  | 'gallery'
  | 'audio'

export interface EditorFieldDefinition {
  key: string
  label: string
  type: EditorFieldType
  defaultValue?: unknown
  placeholder?: string
  min?: number
  max?: number
  step?: number
  options?: { label: string; value: string }[]
  description?: string
}

export interface SceneDefinition<TConfig = Record<string, unknown>> {
  type: SceneType
  name: string
  description: string
  icon: string
  category: string
  schema: z.ZodSchema<TConfig>
  defaultConfig: TConfig
  fields: EditorFieldDefinition[]
}

// Intro Scene
export const introSceneSchema = z.object({
  title: z.string().default('Para ti'),
  subtitle: z.string().default('Una experiencia especial'),
  buttonText: z.string().default('Comenzar'),
  backgroundColor: z.string().default('#0a0a0a'),
  textColor: z.string().default('#ffffff'),
  glowColor: z.string().default('#fbbf24'),
  particlesEnabled: z.boolean().default(true),
})

export type IntroSceneConfig = z.infer<typeof introSceneSchema>

export const introSceneDefinition: SceneDefinition<IntroSceneConfig> = {
  type: 'intro',
  name: 'Introducción',
  description: 'Pantalla de bienvenida con botón de inicio',
  icon: 'Play',
  category: 'content',
  schema: introSceneSchema,
  defaultConfig: introSceneSchema.parse({}),
  fields: [
    {
      key: 'title',
      label: 'Título',
      type: 'text',
      placeholder: 'Para ti',
    },
    {
      key: 'subtitle',
      label: 'Subtítulo',
      type: 'text',
      placeholder: 'Una experiencia especial',
    },
    {
      key: 'buttonText',
      label: 'Texto del botón',
      type: 'text',
      placeholder: 'Comenzar',
    },
    {
      key: 'backgroundColor',
      label: 'Color de fondo',
      type: 'color',
    },
    {
      key: 'textColor',
      label: 'Color del texto',
      type: 'color',
    },
    {
      key: 'glowColor',
      label: 'Color del brillo',
      type: 'color',
    },
    {
      key: 'particlesEnabled',
      label: 'Habilitar partículas',
      type: 'toggle',
    },
  ],
}

// Galaxy Scene
export const galaxySceneSchema = z.object({
  starCount: z.number().min(100).max(10000).default(3000),
  starSize: z.number().min(0.5).max(10).default(2.5),
  starColor: z.string().default('#ffffff'),
  depth: z.number().min(10).max(200).default(100),
  speed: z.number().min(0).max(2).default(0.2),
  rotationSpeed: z.number().min(0).max(1).default(0.1),
  cameraZ: z.number().min(10).max(100).default(50),
  bloomStrength: z.number().min(0).max(3).default(1.5),
  backgroundColor: z.string().default('#000000'),
})

export type GalaxySceneConfig = z.infer<typeof galaxySceneSchema>

export const galaxySceneDefinition: SceneDefinition<GalaxySceneConfig> = {
  type: 'galaxy',
  name: 'Galaxia',
  description: 'Campo estelar en 3D con partículas brillantes',
  icon: 'Sparkles',
  category: '3d',
  schema: galaxySceneSchema,
  defaultConfig: galaxySceneSchema.parse({}),
  fields: [
    {
      key: 'starCount',
      label: 'Cantidad de estrellas',
      type: 'range',
      min: 100,
      max: 10000,
      step: 100,
    },
    {
      key: 'starSize',
      label: 'Tamaño de estrellas',
      type: 'range',
      min: 0.5,
      max: 10,
      step: 0.5,
    },
    {
      key: 'starColor',
      label: 'Color de estrellas',
      type: 'color',
    },
    {
      key: 'depth',
      label: 'Profundidad',
      type: 'range',
      min: 10,
      max: 200,
      step: 10,
    },
    {
      key: 'speed',
      label: 'Velocidad',
      type: 'range',
      min: 0,
      max: 2,
      step: 0.1,
    },
    {
      key: 'rotationSpeed',
      label: 'Velocidad de rotación',
      type: 'range',
      min: 0,
      max: 1,
      step: 0.05,
    },
    {
      key: 'cameraZ',
      label: 'Distancia de cámara',
      type: 'range',
      min: 10,
      max: 100,
      step: 5,
    },
    {
      key: 'bloomStrength',
      label: 'Intensidad de brillo',
      type: 'range',
      min: 0,
      max: 3,
      step: 0.1,
    },
    {
      key: 'backgroundColor',
      label: 'Color de fondo',
      type: 'color',
    },
  ],
}

// Message Scene
export const messageSceneSchema = z.object({
  text: z.string().default('Tu mensaje especial aquí'),
  font: z.enum(['sans', 'serif', 'mono']).default('sans'),
  size: z.enum(['sm', 'base', 'lg', 'xl', '2xl', '3xl']).default('2xl'),
  color: z.string().default('#ffffff'),
  align: z.enum(['left', 'center', 'right']).default('center'),
  animation: z.enum(['fade', 'word', 'letter', 'slide', 'blur', 'glow']).default('fade'),
  duration: z.number().min(500).max(5000).default(1500),
  maxWidth: z.enum(['sm', 'md', 'lg', 'xl', '2xl', 'full']).default('2xl'),
})

export type MessageSceneConfig = z.infer<typeof messageSceneSchema>

export const messageSceneDefinition: SceneDefinition<MessageSceneConfig> = {
  type: 'message',
  name: 'Mensaje',
  description: 'Texto principal con animación',
  icon: 'MessageSquare',
  category: 'content',
  schema: messageSceneSchema,
  defaultConfig: messageSceneSchema.parse({}),
  fields: [
    {
      key: 'text',
      label: 'Mensaje',
      type: 'textarea',
      placeholder: 'Escribe tu mensaje aquí...',
    },
    {
      key: 'font',
      label: 'Fuente',
      type: 'select',
      options: [
        { label: 'Sans-serif', value: 'sans' },
        { label: 'Serif', value: 'serif' },
        { label: 'Monospace', value: 'mono' },
      ],
    },
    {
      key: 'size',
      label: 'Tamaño',
      type: 'select',
      options: [
        { label: 'Pequeño', value: 'sm' },
        { label: 'Base', value: 'base' },
        { label: 'Grande', value: 'lg' },
        { label: 'Extra grande', value: 'xl' },
        { label: '2X grande', value: '2xl' },
        { label: '3X grande', value: '3xl' },
      ],
    },
    {
      key: 'color',
      label: 'Color',
      type: 'color',
    },
    {
      key: 'align',
      label: 'Alineación',
      type: 'select',
      options: [
        { label: 'Izquierda', value: 'left' },
        { label: 'Centro', value: 'center' },
        { label: 'Derecha', value: 'right' },
      ],
    },
    {
      key: 'animation',
      label: 'Animación',
      type: 'select',
      options: [
        { label: 'Fade', value: 'fade' },
        { label: 'Por palabra', value: 'word' },
        { label: 'Por letra', value: 'letter' },
        { label: 'Deslizar', value: 'slide' },
        { label: 'Blur', value: 'blur' },
        { label: 'Brillo', value: 'glow' },
      ],
    },
    {
      key: 'duration',
      label: 'Duración de animación (ms)',
      type: 'range',
      min: 500,
      max: 5000,
      step: 100,
    },
    {
      key: 'maxWidth',
      label: 'Ancho máximo',
      type: 'select',
      options: [
        { label: 'Pequeño', value: 'sm' },
        { label: 'Mediano', value: 'md' },
        { label: 'Grande', value: 'lg' },
        { label: 'Extra grande', value: 'xl' },
        { label: '2X grande', value: '2xl' },
        { label: 'Completo', value: 'full' },
      ],
    },
  ],
}

// Finale Scene
export const finaleSceneSchema = z.object({
  message: z.string().default('Gracias por acompañarme en este viaje'),
  signature: z.string().default('Con cariño'),
  date: z.string().default(''),
  repeatButton: z.string().default('Ver de nuevo'),
  background: z.enum(['stars', 'gradient', 'solid']).default('stars'),
  animation: z.enum(['fade', 'zoom', 'slide']).default('fade'),
})

export type FinaleSceneConfig = z.infer<typeof finaleSceneSchema>

export const finaleSceneDefinition: SceneDefinition<FinaleSceneConfig> = {
  type: 'finale',
  name: 'Final',
  description: 'Cierre con opción de repetir',
  icon: 'Flag',
  category: 'content',
  schema: finaleSceneSchema,
  defaultConfig: finaleSceneSchema.parse({}),
  fields: [
    {
      key: 'message',
      label: 'Mensaje de cierre',
      type: 'textarea',
      placeholder: 'Gracias por acompañarme...',
    },
    {
      key: 'signature',
      label: 'Firma',
      type: 'text',
      placeholder: 'Con cariño',
    },
    {
      key: 'date',
      label: 'Fecha (opcional)',
      type: 'text',
      placeholder: 'Septiembre 2026',
    },
    {
      key: 'repeatButton',
      label: 'Texto del botón',
      type: 'text',
      placeholder: 'Ver de nuevo',
    },
    {
      key: 'background',
      label: 'Fondo',
      type: 'select',
      options: [
        { label: 'Estrellas', value: 'stars' },
        { label: 'Gradiente', value: 'gradient' },
        { label: 'Sólido', value: 'solid' },
      ],
    },
    {
      key: 'animation',
      label: 'Animación de entrada',
      type: 'select',
      options: [
        { label: 'Fade', value: 'fade' },
        { label: 'Zoom', value: 'zoom' },
        { label: 'Deslizar', value: 'slide' },
      ],
    },
  ],
}

// Scene Registry
export const sceneRegistry = new Map<SceneType, SceneDefinition>([
  ['intro', introSceneDefinition],
  ['galaxy', galaxySceneDefinition],
  ['message', messageSceneDefinition],
  ['finale', finaleSceneDefinition],
])

export function getSceneDefinition(type: SceneType): SceneDefinition | undefined {
  return sceneRegistry.get(type)
}

export function getAllSceneDefinitions(): SceneDefinition[] {
  return Array.from(sceneRegistry.values())
}

export function validateSceneConfig(type: SceneType, config: unknown): boolean {
  const definition = getSceneDefinition(type)
  if (!definition) return false
  
  try {
    definition.schema.parse(config)
    return true
  } catch {
    return false
  }
}
