'use client'

import { getSceneDefinition } from '@/components/experience/registry'
import type { EditorFieldDefinition } from '@/components/experience/registry'
import type { SceneType } from '@/types'
import {
  TextField,
  TextAreaField,
  NumberField,
  RangeField,
  ColorField,
  ToggleField,
  SelectField,
} from './fields'
import { GalleryField, ImageField } from './media-fields'

interface SceneInspectorProps {
  sceneType: SceneType
  config: Record<string, unknown>
  projectId: string
  onChange: (config: Record<string, unknown>) => void
}

export function SceneInspector({ sceneType, config, projectId, onChange }: SceneInspectorProps) {
  const definition = getSceneDefinition(sceneType)

  if (!definition) {
    return (
      <div className="p-4 text-center text-df-muted">
        Tipo de escena no válido
      </div>
    )
  }

  const handleFieldChange = (key: string, value: unknown) => {
    onChange({
      ...config,
      [key]: value,
    })
  }

  const renderField = (field: EditorFieldDefinition) => {
    const value = config[field.key] ?? field.defaultValue

    switch (field.type) {
      case 'text':
        return (
          <TextField
            key={field.key}
            field={field}
            value={value as string}
            onChange={(v) => handleFieldChange(field.key, v)}
          />
        )
      
      case 'textarea':
        return (
          <TextAreaField
            key={field.key}
            field={field}
            value={value as string}
            onChange={(v) => handleFieldChange(field.key, v)}
          />
        )
      
      case 'number':
        return (
          <NumberField
            key={field.key}
            field={field}
            value={value as number}
            onChange={(v) => handleFieldChange(field.key, v)}
          />
        )
      
      case 'range':
        return (
          <RangeField
            key={field.key}
            field={field}
            value={value as number}
            onChange={(v) => handleFieldChange(field.key, v)}
          />
        )
      
      case 'color':
        return (
          <ColorField
            key={field.key}
            field={field}
            value={value as string}
            onChange={(v) => handleFieldChange(field.key, v)}
          />
        )
      
      case 'toggle':
        return (
          <ToggleField
            key={field.key}
            field={field}
            value={value as boolean}
            onChange={(v) => handleFieldChange(field.key, v)}
          />
        )
      
      case 'select':
        return (
          <SelectField
            key={field.key}
            field={field}
            value={value as string}
            onChange={(v) => handleFieldChange(field.key, v)}
          />
        )

      case 'image':
        return (
          <ImageField
            key={field.key}
            field={field}
            projectId={projectId}
            value={(value as string | null) ?? null}
            onChange={(v) => handleFieldChange(field.key, v)}
          />
        )

      case 'gallery':
        return (
          <GalleryField
            key={field.key}
            field={field}
            projectId={projectId}
            value={value}
            onChange={(v) => handleFieldChange(field.key, v)}
          />
        )
      
      default:
        return (
          <div key={field.key} className="text-xs text-df-muted-fg">
            Campo tipo &quot;{field.type}&quot; no implementado
          </div>
        )
    }
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="mb-1 text-lg font-medium text-df-fg">
          {definition.name}
        </h3>
        <p className="text-sm text-df-muted">{definition.description}</p>
      </div>

      <div className="space-y-4">
        {definition.fields.map(renderField)}
      </div>
    </div>
  )
}
