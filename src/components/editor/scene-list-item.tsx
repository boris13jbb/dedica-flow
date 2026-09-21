'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Eye, EyeOff, Copy, Trash2 } from 'lucide-react'
import type { Scene } from '@/types'
import { getSceneDefinition } from '@/components/experience/registry'

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center gap-2 rounded-lg border p-3 transition-colors ${
        isDragging
          ? 'opacity-50'
          : ''
      } ${
        isSelected
          ? 'bg-zinc-800 border-zinc-600'
          : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
      } ${
        !scene.enabled
          ? 'opacity-60'
          : ''
      }`}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing text-zinc-500 hover:text-zinc-300"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={onSelect}
        className="flex-1 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-50">
            {scene.name}
          </span>
          <span className="text-xs text-zinc-500">
            {definition?.name || scene.scene_type}
          </span>
        </div>
        <div className="text-xs text-zinc-500 mt-0.5">
          Posición {scene.position + 1}
        </div>
      </button>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onToggleEnabled}
          className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
          title={scene.enabled ? 'Deshabilitar' : 'Habilitar'}
        >
          {scene.enabled ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
        </button>

        <button
          type="button"
          onClick={onDuplicate}
          className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
          title="Duplicar"
        >
          <Copy className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="p-1 rounded hover:bg-red-900/50 text-zinc-400 hover:text-red-400"
          title="Eliminar"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
