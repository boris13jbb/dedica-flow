'use client'

import {
  Cloud,
  Flag,
  Flower,
  Images,
  MessageSquare,
  Play,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { Dialog } from '@/components/ui/dialog'
import { getAllSceneDefinitions } from '@/components/experience/registry'
import { cn } from '@/lib/utils'
import type { SceneType } from '@/types'

const SCENE_ICONS: Record<string, LucideIcon> = {
  Play,
  Sparkles,
  Cloud,
  Flower,
  Images,
  MessageSquare,
  Flag,
}

const CATEGORY_LABELS: Record<string, string> = {
  content: 'Narrativa',
  '3d': 'Espacio 3D',
}

interface SceneCatalogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectType: (type: SceneType) => void
  creating?: boolean
}

export function SceneCatalog({
  open,
  onOpenChange,
  onSelectType,
  creating = false,
}: SceneCatalogProps) {
  const definitions = getAllSceneDefinitions()
  const categories = Array.from(new Set(definitions.map((item) => item.category)))

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Agregar escena"
      description="Elige el siguiente momento de la experiencia."
      className="sm:max-w-2xl"
    >
      <div className="space-y-5" data-testid="scene-catalog">
        {categories.map((category) => {
          const items = definitions.filter((item) => item.category === category)
          return (
            <section key={category} className="space-y-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-df-muted-fg">
                {CATEGORY_LABELS[category] ?? category}
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {items.map((definition) => {
                  const Icon = SCENE_ICONS[definition.icon] ?? Sparkles
                  return (
                    <button
                      key={definition.type}
                      type="button"
                      disabled={creating}
                      data-testid={`scene-catalog-${definition.type}`}
                      onClick={() => onSelectType(definition.type)}
                      className={cn(
                        'group flex items-start gap-3 rounded-[var(--radius-lg)] border border-df-border bg-df-surface/70 p-3 text-left transition-colors',
                        'hover:border-df-primary/40 hover:bg-df-primary/8',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-df-primary',
                        creating && 'pointer-events-none opacity-60'
                      )}
                    >
                      <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-df-card text-df-primary ring-1 ring-df-border">
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-df-fg">
                          {definition.name}
                        </span>
                        <span className="mt-1 block text-xs leading-relaxed text-df-muted">
                          {definition.description}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </Dialog>
  )
}
