'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { EditorFieldDefinition } from '@/components/experience/registry'

interface TextFieldProps {
  field: EditorFieldDefinition
  value: string
  onChange: (value: string) => void
}

/**
 * Estado local para que el cursor no se pierda si el padre
 * re-renderiza el preview o sincroniza el store.
 */
export function TextField({ field, value, onChange }: TextFieldProps) {
  const external = typeof value === 'string' ? value : value == null ? '' : String(value)
  const [local, setLocal] = useState(external)
  const [prevExternal, setPrevExternal] = useState(external)

  // Sincroniza valor externo sin useEffect (evita set-state-in-effect).
  if (external !== prevExternal) {
    setPrevExternal(external)
    setLocal(external)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={field.key}>{field.label}</Label>
      <Input
        id={field.key}
        type="text"
        value={local}
        onChange={(e) => {
          const next = e.target.value
          setLocal(next)
          onChange(next)
        }}
        placeholder={field.placeholder}
        autoComplete="off"
      />
      {field.description && (
        <p className="text-xs text-df-muted-fg">{field.description}</p>
      )}
    </div>
  )
}

interface TextAreaFieldProps {
  field: EditorFieldDefinition
  value: string
  onChange: (value: string) => void
}

export function TextAreaField({ field, value, onChange }: TextAreaFieldProps) {
  const external = typeof value === 'string' ? value : value == null ? '' : String(value)
  const [local, setLocal] = useState(external)
  const [prevExternal, setPrevExternal] = useState(external)

  if (external !== prevExternal) {
    setPrevExternal(external)
    setLocal(external)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={field.key}>{field.label}</Label>
      <Textarea
        id={field.key}
        value={local}
        onChange={(e) => {
          const next = e.target.value
          setLocal(next)
          onChange(next)
        }}
        placeholder={field.placeholder}
        rows={4}
        autoComplete="off"
      />
      {field.description && (
        <p className="text-xs text-df-muted-fg">{field.description}</p>
      )}
    </div>
  )
}

interface NumberFieldProps {
  field: EditorFieldDefinition
  value: number
  onChange: (value: number) => void
}

export function NumberField({ field, value, onChange }: NumberFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.key}>{field.label}</Label>
      <Input
        id={field.key}
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        min={field.min}
        max={field.max}
        step={field.step}
      />
      {field.description && (
        <p className="text-xs text-df-muted-fg">{field.description}</p>
      )}
    </div>
  )
}

interface RangeFieldProps {
  field: EditorFieldDefinition
  value: number
  onChange: (value: number) => void
}

export function RangeField({ field, value, onChange }: RangeFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={field.key}>{field.label}</Label>
        <span className="text-sm text-df-muted">{value}</span>
      </div>
      <input
        id={field.key}
        type="range"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        min={field.min}
        max={field.max}
        step={field.step}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-df-border accent-[var(--gold)]"
      />
      {field.description && (
        <p className="text-xs text-df-muted-fg">{field.description}</p>
      )}
    </div>
  )
}

interface ColorFieldProps {
  field: EditorFieldDefinition
  value: string
  onChange: (value: string) => void
}

export function ColorField({ field, value, onChange }: ColorFieldProps) {
  const color = value || '#000000'

  return (
    <div className="space-y-2">
      <Label htmlFor={field.key}>{field.label}</Label>
      <div className="flex items-center gap-2">
        <input
          id={field.key}
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-20 cursor-pointer rounded-[var(--radius-md)] border border-df-border bg-df-surface"
        />
        <Input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-sm"
        />
      </div>
      {field.description && (
        <p className="text-xs text-df-muted-fg">{field.description}</p>
      )}
    </div>
  )
}

interface ToggleFieldProps {
  field: EditorFieldDefinition
  value: boolean
  onChange: (value: boolean) => void
}

export function ToggleField({ field, value, onChange }: ToggleFieldProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="space-y-0.5">
        <Label htmlFor={field.key}>{field.label}</Label>
        {field.description && (
          <p className="text-xs text-df-muted-fg">{field.description}</p>
        )}
      </div>
      <Switch
        id={field.key}
        checked={value}
        onCheckedChange={onChange}
        label={field.label}
      />
    </div>
  )
}

interface SelectFieldProps {
  field: EditorFieldDefinition
  value: string
  onChange: (value: string) => void
}

export function SelectField({ field, value, onChange }: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.key}>{field.label}</Label>
      <select
        id={field.key}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-10 w-full rounded-[var(--radius-md)] border border-df-border bg-df-surface px-3 py-2 text-sm text-df-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-df-primary"
      >
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {field.description && (
        <p className="text-xs text-df-muted-fg">{field.description}</p>
      )}
    </div>
  )
}
