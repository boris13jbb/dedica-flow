'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Images, Link2, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MediaPicker } from '@/components/media/media-picker'
import type { EditorFieldDefinition } from '@/components/experience/registry'
import { applySingleMediaValue, moveUrl, normalizeGalleryUrls } from '@/lib/scene-builder'
import { isLoadablePhotoUrl } from '@/components/experience/scenes/photo-orbit/photo-orbit-utils'
import { cn } from '@/lib/utils'

interface ImageFieldProps {
  field: EditorFieldDefinition
  value: string | null
  projectId: string
  onChange: (value: string | null) => void
}

export function ImageField({ field, value, projectId, onChange }: ImageFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [showUrl, setShowUrl] = useState(false)
  const current = typeof value === 'string' ? value : ''

  return (
    <div className="space-y-2">
      <Label htmlFor={field.key}>{field.label}</Label>
      {current ? (
        <div className="relative overflow-hidden rounded-[var(--radius-md)] border border-df-border bg-df-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current} alt="" className="h-28 w-full object-cover" />
          <button
            type="button"
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"
            aria-label="Quitar imagen"
            onClick={() => onChange(null)}
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <p className="text-xs text-df-muted">Ninguna imagen seleccionada.</p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="primary" onClick={() => setPickerOpen(true)}>
          <Images className="size-3.5" />
          Seleccionar de Biblioteca
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setShowUrl((open) => !open)}>
          <Link2 className="size-3.5" />
          URL externa
        </Button>
      </div>
      {showUrl && (
        <Input
          id={field.key}
          value={current}
          placeholder={field.placeholder ?? 'https://…'}
          onChange={(event) => onChange(applySingleMediaValue(event.target.value))}
        />
      )}
      {field.description && <p className="text-xs text-df-muted-fg">{field.description}</p>}
      <MediaPicker
        projectId={projectId}
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        mode="single"
        selectedUrls={current ? [current] : []}
        onConfirm={(urls) => onChange(applySingleMediaValue(urls[0] ?? null))}
      />
    </div>
  )
}

interface GalleryFieldProps {
  field: EditorFieldDefinition
  value: unknown
  projectId: string
  onChange: (value: string[]) => void
}

export function GalleryField({ field, value, projectId, onChange }: GalleryFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [externalUrl, setExternalUrl] = useState('')
  const [showUrl, setShowUrl] = useState(false)
  const photos = normalizeGalleryUrls(value)

  const addExternal = () => {
    const next = externalUrl.trim()
    if (!next) return
    onChange(normalizeGalleryUrls([...photos, next]))
    setExternalUrl('')
  }

  return (
    <div className="space-y-3" data-testid="gallery-field">
      <div>
        <Label>{field.label}</Label>
        {field.description && (
          <p className="mt-1 text-xs text-df-muted-fg">{field.description}</p>
        )}
      </div>

      {photos.length === 0 ? (
        <p className="text-xs text-df-muted">Todavía no hay fotos en esta órbita.</p>
      ) : (
        <ul className="space-y-2">
          {photos.map((url, index) => {
            const valid = isLoadablePhotoUrl(url)
            return (
              <li
                key={`${url}-${index}`}
                className="flex items-center gap-2 rounded-[var(--radius-md)] border border-df-border bg-df-surface p-2"
              >
                <div className="relative size-12 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-df-bg">
                  {valid ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="flex size-full items-center justify-center text-[10px] text-df-error">
                      N/A
                    </span>
                  )}
                </div>
                <p className={cn('min-w-0 flex-1 truncate text-xs', valid ? 'text-df-muted' : 'text-df-error')}>
                  {valid ? url : 'Este enlace no es una imagen'}
                </p>
                <div className="flex shrink-0">
                  <button
                    type="button"
                    className="rounded p-1 text-df-muted hover:text-df-fg disabled:opacity-30"
                    aria-label="Subir foto"
                    disabled={index === 0}
                    onClick={() => onChange(moveUrl(photos, index, index - 1))}
                  >
                    <ChevronUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    className="rounded p-1 text-df-muted hover:text-df-fg disabled:opacity-30"
                    aria-label="Bajar foto"
                    disabled={index === photos.length - 1}
                    onClick={() => onChange(moveUrl(photos, index, index + 1))}
                  >
                    <ChevronDown className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    className="rounded p-1 text-df-muted hover:text-df-error"
                    aria-label="Quitar foto"
                    onClick={() => onChange(photos.filter((_, itemIndex) => itemIndex !== index))}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="primary"
          onClick={() => setPickerOpen(true)}
          data-testid="open-media-picker"
        >
          <Images className="size-3.5" />
          Seleccionar fotos de Biblioteca
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setShowUrl((open) => !open)}>
          <Link2 className="size-3.5" />
          URL externa
        </Button>
      </div>

      {showUrl && (
        <div className="flex gap-2">
          <Input
            value={externalUrl}
            onChange={(event) => setExternalUrl(event.target.value)}
            placeholder={field.placeholder ?? 'https://…'}
            aria-label="URL externa de imagen"
          />
          <Button type="button" size="sm" variant="secondary" onClick={addExternal}>
            Añadir
          </Button>
        </div>
      )}

      <MediaPicker
        projectId={projectId}
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        mode="multiple"
        selectedUrls={photos}
        onConfirm={onChange}
        title="Seleccionar fotos de Biblioteca"
        description="Puedes elegir varias imágenes. Las que no sean imagen se omitirán en la experiencia publicada."
      />
    </div>
  )
}
