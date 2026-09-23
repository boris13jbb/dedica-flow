'use client'

import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
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
  const [activeId, setActiveId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const activeScene = scenes.find((scene) => scene.id === activeId) ?? null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) return

    const oldIndex = scenes.findIndex((scene) => scene.id === active.id)
    const newIndex = scenes.findIndex((scene) => scene.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    const ordered = [...scenes]
    const [moved] = ordered.splice(oldIndex, 1)
    ordered.splice(newIndex, 0, moved)
    onReorderScenes(ordered.map((scene) => scene.id))
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-df-border px-4 py-3">
        <p className="text-xs text-df-muted">
          {scenes.length === 0
            ? 'Sin momentos aún'
            : `${scenes.length} momento${scenes.length === 1 ? '' : 's'}`}
        </p>
        <Button
          type="button"
          onClick={onAddScene}
          size="sm"
          variant="primary"
          data-testid="add-scene-button"
        >
          <Plus className="size-4" />
          Agregar escena
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 df-scrollbar">
        {scenes.length === 0 ? (
          <div className="px-2 py-12 text-center text-df-muted">
            <p className="mb-1 text-sm text-df-fg">La historia está en blanco</p>
            <p className="text-xs text-df-muted-fg">
              Agrega el primer momento para comenzar la narrativa.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveId(null)}
          >
            <SortableContext
              items={scenes.map((scene) => scene.id)}
              strategy={verticalListSortingStrategy}
            >
              <ol className="relative space-y-2 pl-1" data-testid="scene-list">
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
            <DragOverlay>
              {activeScene ? (
                <ul className="list-none">
                  <SceneListItem
                    scene={activeScene}
                    isSelected
                    isOverlay
                    onSelect={() => undefined}
                    onToggleEnabled={() => undefined}
                    onDuplicate={() => undefined}
                    onDelete={() => undefined}
                  />
                </ul>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  )
}
