'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { EditorFieldDefinition } from '@/components/experience/registry'

interface TextFieldProps {
  field: EditorFieldDefinition
  value: string
  onChange: (value: string) => void
}

export function TextField({ field, value, onChange }: TextFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.key} className="text-zinc-200">
        {field.label}
      </Label>
      <Input
        id={field.key}
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className="bg-zinc-800 border-zinc-700 text-zinc-50 placeholder:text-zinc-500"
      />
      {field.description && (
        <p className="text-xs text-zinc-500">{field.description}</p>
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
  return (
    <div className="space-y-2">
      <Label htmlFor={field.key} className="text-zinc-200">
        {field.label}
      </Label>
      <textarea
        id={field.key}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={4}
        className="flex w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
      {field.description && (
        <p className="text-xs text-zinc-500">{field.description}</p>
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
      <Label htmlFor={field.key} className="text-zinc-200">
        {field.label}
      </Label>
      <Input
        id={field.key}
        type="number"
        value={value || 0}
        onChange={(e) => onChange(Number(e.target.value))}
        min={field.min}
        max={field.max}
        step={field.step}
        className="bg-zinc-800 border-zinc-700 text-zinc-50"
      />
      {field.description && (
        <p className="text-xs text-zinc-500">{field.description}</p>
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
        <Label htmlFor={field.key} className="text-zinc-200">
          {field.label}
        </Label>
        <span className="text-sm text-zinc-400">{value}</span>
      </div>
      <input
        id={field.key}
        type="range"
        value={value || 0}
        onChange={(e) => onChange(Number(e.target.value))}
        min={field.min}
        max={field.max}
        step={field.step}
        className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-zinc-50"
      />
      {field.description && (
        <p className="text-xs text-zinc-500">{field.description}</p>
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
  return (
    <div className="space-y-2">
      <Label htmlFor={field.key} className="text-zinc-200">
        {field.label}
      </Label>
      <div className="flex items-center gap-2">
        <input
          id={field.key}
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-20 rounded border border-zinc-700 bg-zinc-800 cursor-pointer"
        />
        <Input
          type="text"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="bg-zinc-800 border-zinc-700 text-zinc-50 font-mono text-sm"
        />
      </div>
      {field.description && (
        <p className="text-xs text-zinc-500">{field.description}</p>
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
        <Label htmlFor={field.key} className="text-zinc-200">
          {field.label}
        </Label>
        {field.description && (
          <p className="text-xs text-zinc-500">{field.description}</p>
        )}
      </div>
      <button
        id={field.key}
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? 'bg-zinc-50' : 'bg-zinc-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-zinc-900 transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
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
      <Label htmlFor={field.key} className="text-zinc-200">
        {field.label}
      </Label>
      <select
        id={field.key}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 focus-visible:ring-offset-2"
      >
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {field.description && (
        <p className="text-xs text-zinc-500">{field.description}</p>
      )}
    </div>
  )
}
