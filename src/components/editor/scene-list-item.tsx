'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Eye, EyeOff, Copy, Trash2, SlidersHorizontal } from 'lucide-react'
import type { Scene } from '@/types'
import { getSceneDefinition } from '@/components/experience/registry'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface SceneListItemProps {
  scene: Scene
  isSelected: boolean
  onSelect: () => void
  onToggleEnabled: () => void
  onDuplicate: () => void
  onDelete: () => void
}

export function SceneListItem({
  scene,
  isSelected,
  onSelect,
  onToggleEnabled,
  onDuplicate,
  onDelete,
}: SceneListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const definition = getSceneDefinition(scene.scene_type as never)
  const order = scene.position + 1

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative z-[1] flex items-start gap-2 rounded-[var(--radius-lg)] border bg-transparent p-3 transition-colors',
        isDragging && 'opacity-50',
        isSelected
          ? 'border-df-primary/40 bg-df-primary/8 df-gold-ring'
          : 'border-transparent hover:bg-df-surface',
        !scene.enabled && 'opacity-60'
      )}
    >
      <button
        type="button"
        className="mt-1 cursor-grab text-df-muted-fg hover:text-df-muted active:cursor-grabbing"
        aria-label="Reordenar escena"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <span
        aria-hidden
        className={cn(
          'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold',
          isSelected
            ? 'bg-df-primary text-df-primary-fg'
            : 'bg-df-card text-df-muted ring-1 ring-df-border'
        )}
      >
        {order}
      </span>

      <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-medium text-df-fg">{scene.name}</span>
          <Badge variant={scene.enabled ? 'success' : 'default'} className="shrink-0">
            {scene.enabled ? 'Activa' : 'Pausada'}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-df-muted-fg">
          {definition?.name || scene.scene_type} · orden {order}
        </p>
        <span
          className={cn(
            'mt-2 inline-flex items-center gap-1 text-[11px] font-medium',
            isSelected
              ? 'text-df-primary-light'
              : 'text-df-muted-fg sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100'
          )}
        >
          <SlidersHorizontal className="size-3" />
          Configurar
        </span>
      </button>

      <div className="flex shrink-0 items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
        <button
          type="button"
          onClick={onToggleEnabled}
          className="rounded-[var(--radius-sm)] p-1.5 text-df-muted hover:bg-df-card hover:text-df-fg"
          title={scene.enabled ? 'Deshabilitar' : 'Habilitar'}
          aria-label={scene.enabled ? 'Deshabilitar escena' : 'Habilitar escena'}
        >
          {scene.enabled ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </button>
        <button
          type="button"
          onClick={onDuplicate}
          className="rounded-[var(--radius-sm)] p-1.5 text-df-muted hover:bg-df-card hover:text-df-fg"
          title="Duplicar"
          aria-label="Duplicar escena"
        >
          <Copy className="size-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-[var(--radius-sm)] p-1.5 text-df-muted hover:bg-df-error/15 hover:text-df-error"
          title="Eliminar"
          aria-label="Eliminar escena"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </li>
  )
}
