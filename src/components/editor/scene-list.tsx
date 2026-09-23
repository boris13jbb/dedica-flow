'use client'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Scene } from '@/types'
import { SceneListItem } from './scene-list-item'

interface SceneListProps {
  scenes: Scene[]
  selectedSceneId: string | null
  onSelectScene: (sceneId: string) => void
  onReorderScenes: (sceneIds: string[]) => void
  onToggleEnabled: (sceneId: string) => void
  onDuplicateScene: (sceneId: string) => void
  onDeleteScene: (sceneId: string) => void
  onAddScene: () => void
}

export function SceneList({
  scenes,
  selectedSceneId,
  onSelectScene,
  onReorderScenes,
  onToggleEnabled,
  onDuplicateScene,
  onDeleteScene,
  onAddScene,
}: SceneListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = scenes.findIndex((s) => s.id === active.id)
      const newIndex = scenes.findIndex((s) => s.id === over.id)
      const reordered = arrayMove(scenes, oldIndex, newIndex)
      onReorderScenes(reordered.map((s) => s.id))
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-df-border px-4 py-3">
        <p className="text-xs text-df-muted">
          {scenes.length === 0
            ? 'Sin momentos aún'
            : `${scenes.length} momento${scenes.length === 1 ? '' : 's'}`}
        </p>
        <Button type="button" onClick={onAddScene} size="sm" variant="primary">
          <Plus className="size-4" />
          Añadir
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 df-scrollbar">
        {scenes.length === 0 ? (
          <div className="px-2 py-12 text-center text-df-muted">
            <p className="mb-1 text-sm text-df-fg">La historia está en blanco</p>
            <p className="text-xs text-df-muted-fg">
              Añade el primer momento para comenzar la narrativa.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={scenes.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <ol className="relative space-y-2 pl-1">
                <span
                  aria-hidden
                  className="absolute bottom-3 left-[22px] top-3 w-px bg-df-border"
                />
                {scenes.map((scene) => (
                  <SceneListItem
                    key={scene.id}
                    scene={scene}
                    isSelected={scene.id === selectedSceneId}
                    onSelect={() => onSelectScene(scene.id)}
                    onToggleEnabled={() => onToggleEnabled(scene.id)}
                    onDuplicate={() => onDuplicateScene(scene.id)}
                    onDelete={() => onDeleteScene(scene.id)}
                  />
                ))}
              </ol>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}
