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
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-zinc-50">Escenas</h2>
          <span className="text-sm text-zinc-400">{scenes.length}</span>
        </div>
        <Button
          onClick={onAddScene}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-50"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Añadir Escena
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {scenes.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <p className="mb-2">No hay escenas aún</p>
            <p className="text-sm">Añade tu primera escena para comenzar</p>
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
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}
