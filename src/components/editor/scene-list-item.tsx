'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Copy, Eye, EyeOff, GripVertical, MoreHorizontal, Trash2 } from 'lucide-react'
import type { Scene } from '@/types'
import { getSceneDefinition } from '@/components/experience/registry'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface SceneListItemProps {
  scene: Scene
  isSelected: boolean
  isOverlay?: boolean
  onSelect: () => void
  onToggleEnabled: () => void
  onDuplicate: () => void
  onDelete: () => void
}

export function SceneListItem({
  scene,
  isSelected,
  isOverlay = false,
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
  } = useSortable({ id: scene.id, disabled: isOverlay })

  const style = isOverlay
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition,
      }

  const definition = getSceneDefinition(scene.scene_type as never)
  const order = scene.position + 1

  return (
    <li
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      data-testid={`scene-row-${scene.id}`}
      className={cn(
        'group relative z-[1] flex items-start gap-2 rounded-[var(--radius-lg)] border bg-transparent p-3 transition-colors',
        isDragging && !isOverlay && 'opacity-30 ring-1 ring-df-primary/40',
        isOverlay && 'border-df-primary/50 bg-df-card shadow-[var(--shadow-elevated)]',
        isSelected
          ? 'border-df-primary/40 bg-df-primary/8 df-gold-ring'
          : 'border-transparent hover:bg-df-surface',
        !scene.enabled && !isDragging && 'opacity-60'
      )}
    >
      <button
        type="button"
        className="mt-1 cursor-grab touch-none text-df-muted-fg hover:text-df-muted active:cursor-grabbing"
        aria-label={`Reordenar ${scene.name}`}
        data-testid={`scene-drag-${scene.id}`}
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

      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 flex-1 text-left"
        data-testid={`scene-select-${scene.id}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-medium text-df-fg">{scene.name}</span>
          <Badge
            variant={scene.enabled ? 'success' : 'default'}
            className="shrink-0"
            data-testid={`scene-status-${scene.id}`}
          >
            {scene.enabled ? 'Activa' : 'Inactiva'}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-df-muted-fg">
          {definition?.name || scene.scene_type}
        </p>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
            'shrink-0 text-df-muted opacity-100 hover:text-df-fg sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100'
          )}
          aria-label={`Acciones de ${scene.name}`}
          data-testid={`scene-menu-${scene.id}`}
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onDuplicate} data-testid={`scene-duplicate-${scene.id}`}>
            <Copy className="size-3.5" />
            Duplicar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onToggleEnabled} data-testid={`scene-toggle-${scene.id}`}>
            {scene.enabled ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            {scene.enabled ? 'Desactivar' : 'Activar'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onDelete} data-testid={`scene-delete-${scene.id}`}>
            <Trash2 className="size-3.5" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  )
}
