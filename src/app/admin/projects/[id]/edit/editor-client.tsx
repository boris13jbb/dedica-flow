'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import { ArrowLeft, Save, Loader2, Eye, Rocket, Clapperboard, MonitorPlay, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'
import { useShallow } from 'zustand/react/shallow'
import { Button, buttonVariants } from '@/components/ui/button'
import { Logo } from '@/components/brand/logo'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { useEditorStore, useRendererStore } from '@/stores'
import { SceneList } from '@/components/editor/scene-list'
import { SceneCatalog } from '@/components/editor/scene-catalog'
import { PreviewPanel } from '@/components/editor/preview-panel'
import { SceneInspector } from '@/components/editor/scene-inspector'
import { ProjectWorkspaceNav } from '@/components/admin/project-workspace-nav'
import { ConfirmDialog } from '@/components/ui/dialog'
import { updateProjectScenes, createScene, deleteScene } from './actions'
import type { Project, Scene, SceneType } from '@/types'
import { buildNewScenePayload, cloneSceneForDuplicate } from '@/lib/scene-builder'

function scenesFingerprint(scenes: Scene[]) {
  return JSON.stringify(
    scenes.map((s) => ({
      id: s.id,
      name: s.name,
      position: s.position,
      duration_ms: s.duration_ms,
      trigger_mode: s.trigger_mode,
      enabled: s.enabled,
      config: s.config,
    }))
  )
}

// Component to show save status with auto-updating time
function SaveStatus({ lastSaved }: { lastSaved: Date }) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const updateSeconds = () => {
      setSeconds(Math.floor((Date.now() - lastSaved.getTime()) / 1000))
    }
    
    updateSeconds()
    const interval = setInterval(updateSeconds, 1000)
    return () => clearInterval(interval)
  }, [lastSaved])

  return <span>Guardado hace {seconds}s</span>
}

interface EditorClientProps {
  project: Project
  initialScenes: Scene[]
}

export function EditorClient({ project, initialScenes }: EditorClientProps) {
  const hydratedRef = useRef(false)
  /** Vista activa en viewport < lg (móvil/tablet): no mostrar 3 columnas */
  const [mobilePane, setMobilePane] = useState<'scenes' | 'preview' | 'props'>('preview')
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [creatingScene, setCreatingScene] = useState(false)
  const [scenePendingDelete, setScenePendingDelete] = useState<Scene | null>(null)
  const [deletingScene, setDeletingScene] = useState(false)
  
  const {
    scenes,
    selectedSceneId,
    isDirty,
    isSaving,
    lastSaved,
    previewDevice,
    setProject,
    setScenes,
    selectScene,
    updateScene,
    addScene,
    insertSceneAfter,
    removeScene,
    reorderScenes,
    setDirty,
    setSaving,
    setLastSaved,
    setPreviewDevice,
  } = useEditorStore()

  // Mientras el store no corresponde a este proyecto, mostrar escenas del servidor.
  const storeProjectId = useEditorStore((s) => s.project?.id)
  const visibleScenes = storeProjectId === project.id ? scenes : initialScenes

  const { goToScene } = useRendererStore(
    useShallow((s) => ({ goToScene: s.goToScene }))
  )

  // Hidratar una sola vez; no pisar ediciones locales tras autosave/refresh
  useEffect(() => {
    setProject(project)
    const { isDirty: dirty, isSaving: saving } = useEditorStore.getState()
    if (!hydratedRef.current || (!dirty && !saving)) {
      setScenes(initialScenes)
      hydratedRef.current = true
    }
  }, [project, initialScenes, setProject, setScenes])

  // Al seleccionar una escena, el preview salta a esa posición (solo al cambiar selección)
  useEffect(() => {
    if (!selectedSceneId) return
    const enabled = useEditorStore
      .getState()
      .scenes.filter((s) => s.enabled)
      .sort((a, b) => a.position - b.position)
    const idx = enabled.findIndex((s) => s.id === selectedSceneId)
    if (idx >= 0) {
      goToScene(idx)
      useRendererStore.getState().pause()
    }
  }, [selectedSceneId, goToScene])

  const selectedScene = visibleScenes.find((s) => s.id === selectedSceneId)

  const handleSave = useCallback(async () => {
    const state = useEditorStore.getState()
    if (!state.isDirty || state.isSaving) return

    const scenesToSave = state.scenes
    const fingerprintBefore = scenesFingerprint(scenesToSave)

    setSaving(true)
    try {
      await updateProjectScenes(project.id, scenesToSave)
      const after = useEditorStore.getState().scenes
      // Solo marcar limpio si no hubo más teclas mientras guardaba
      if (scenesFingerprint(after) === fingerprintBefore) {
        setDirty(false)
        setLastSaved(new Date())
      } else {
        setLastSaved(new Date())
      }
      // Evitar router.refresh() aquí: reseteaba los inputs a mitad de escritura
    } catch {
      toast.error('Error al guardar', 'No se pudieron guardar los cambios. Inténtalo de nuevo.')
    } finally {
      setSaving(false)
    }
  }, [project.id, setSaving, setDirty, setLastSaved])

  // Autosave con debounce real sobre el contenido (no sobre la identidad de handleSave)
  useEffect(() => {
    if (!isDirty || isSaving) return

    const timer = setTimeout(() => {
      void handleSave()
    }, 1200)

    return () => clearTimeout(timer)
  }, [isDirty, isSaving, scenes, handleSave])

  const persistScenes = useCallback(
    async (nextScenes: Scene[]) => {
      await updateProjectScenes(project.id, nextScenes)
      setDirty(false)
      setLastSaved(new Date())
    },
    [project.id, setDirty, setLastSaved]
  )

  const handleAddScene = async (type: SceneType) => {
    setCreatingScene(true)
    try {
      const payload = buildNewScenePayload(type, useEditorStore.getState().scenes.length)
      const created = (await createScene(project.id, {
        ...payload,
        config: payload.config as never,
      })) as Scene
      addScene(created)
      setDirty(false)
      setCatalogOpen(false)
      toast.success('Escena añadida', created.name)
    } catch {
      toast.error('Error al crear escena')
    } finally {
      setCreatingScene(false)
    }
  }

  const handleConfirmDeleteScene = async () => {
    if (!scenePendingDelete) return
    setDeletingScene(true)
    try {
      await deleteScene(project.id, scenePendingDelete.id)
      removeScene(scenePendingDelete.id)
      const remaining = useEditorStore.getState().scenes
      await persistScenes(remaining)
      toast.success('Escena eliminada', scenePendingDelete.name)
    } catch {
      toast.error('Error al eliminar escena')
      throw new Error('delete-failed')
    } finally {
      setDeletingScene(false)
    }
  }

  const handleDuplicateScene = async (sceneId: string) => {
    const scene = useEditorStore.getState().scenes.find((item) => item.id === sceneId)
    if (!scene) return

    try {
      const payload = cloneSceneForDuplicate(scene)
      const created = (await createScene(project.id, {
        ...payload,
        config: payload.config as never,
      })) as Scene
      insertSceneAfter(scene.id, created)
      await persistScenes(useEditorStore.getState().scenes)
      toast.success('Escena duplicada', created.name)
    } catch {
      toast.error('Error al duplicar escena')
    }
  }

  const handleToggleEnabled = (sceneId: string) => {
    const scene = useEditorStore.getState().scenes.find((item) => item.id === sceneId)
    if (!scene) return

    updateScene(sceneId, { enabled: !scene.enabled })
  }

  const handleReorderScenes = async (sceneIds: string[]) => {
    reorderScenes(sceneIds)
    try {
      await persistScenes(useEditorStore.getState().scenes)
    } catch {
      toast.error('Error al guardar', 'No se pudo persistir el nuevo orden.')
    }
  }

  const handleSceneConfigChange = (config: Record<string, unknown>) => {
    if (!selectedSceneId) return
    updateScene(selectedSceneId, { config: config as never })
  }

  const handleSelectScene = (sceneId: string | null) => {
    selectScene(sceneId)
    if (sceneId) {
      setMobilePane('props')
    }
  }

  const inspectorBody = selectedScene ? (
    <SceneInspector
      sceneType={selectedScene.scene_type as SceneType}
      projectId={project.id}
      config={
        (selectedScene.config &&
        typeof selectedScene.config === 'object' &&
        !Array.isArray(selectedScene.config)
          ? (selectedScene.config as Record<string, unknown>)
          : {}) as Record<string, unknown>
      }
      onChange={handleSceneConfigChange}
    />
  ) : (
    <div className="space-y-3 p-4 text-sm text-df-muted">
      <p>Selecciona una escena a la izquierda para editar textos y opciones.</p>
      <Link
        href={`/admin/projects/${project.id}/media#audio-experiencia`}
        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
      >
        Ir a insertar audio →
      </Link>
    </div>
  )

  return (
    <div className="flex h-screen flex-col bg-df-bg text-df-fg">
      <header className="shrink-0 border-b border-df-border bg-df-bg/90 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between gap-3 px-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link
              href="/admin"
              className="rounded-[var(--radius-md)] p-2 text-df-muted transition-colors hover:bg-df-surface hover:text-df-fg"
              title="Volver al panel"
              aria-label="Volver al panel"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <Link href="/admin" className="hidden shrink-0 sm:block" aria-label="DedicaFlow">
              <Logo size="sm" showWordmark={false} />
            </Link>
            <div className="min-w-0">
              <Breadcrumbs
                items={[
                  { label: 'Experiencias', href: '/admin' },
                  { label: project.name || 'Proyecto' },
                ]}
                className="hidden md:block"
              />
              <h1 className="truncate text-sm font-semibold text-df-fg md:hidden">
                {project.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden text-xs text-df-muted sm:block" aria-live="polite">
              {isSaving ? (
                <span className="flex items-center gap-1.5 text-df-primary-light">
                  <Loader2 className="size-3 animate-spin" />
                  Guardando…
                </span>
              ) : isDirty ? (
                <span>Cambios pendientes</span>
              ) : lastSaved ? (
                <SaveStatus lastSaved={lastSaved} />
              ) : (
                <span className="text-df-success">Guardado automáticamente</span>
              )}
            </div>

            <Link
              href={`/p/${project.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'hidden sm:inline-flex')}
            >
              <Eye className="size-3.5" />
              Vista previa
            </Link>

            <Link
              href={`/admin/projects/${project.id}/publish`}
              className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'hidden sm:inline-flex')}
            >
              <Rocket className="size-3.5" />
              Publicar
            </Link>

            <Button
              type="button"
              onClick={() => void handleSave()}
              disabled={!isDirty || isSaving}
              size="sm"
              variant="secondary"
              loading={isSaving}
            >
              <Save className="size-3.5" />
              <span className="hidden sm:inline">Guardar</span>
            </Button>
          </div>
        </div>

        <div className="border-t border-df-border/80 px-3 py-2 sm:px-4">
          <ProjectWorkspaceNav projectId={project.id} variant="tabs" />
        </div>
      </header>

      {/* Desktop / tablet grande: 3 columnas */}
      <div className="hidden min-h-0 flex-1 overflow-hidden lg:flex">
        <aside className="flex w-[280px] shrink-0 flex-col border-r border-df-border bg-df-surface xl:w-[290px]">
          <div className="border-b border-df-border px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-df-muted-fg">
              Escenas
            </p>
            <p className="text-sm text-df-muted">Ordena y activa cada momento</p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto df-scrollbar">
            <SceneList
              scenes={visibleScenes}
              selectedSceneId={selectedSceneId}
              onSelectScene={handleSelectScene}
              onReorderScenes={handleReorderScenes}
              onToggleEnabled={handleToggleEnabled}
              onDuplicateScene={handleDuplicateScene}
              onDeleteScene={(sceneId) => {
                const scene = visibleScenes.find((item) => item.id === sceneId)
                if (scene) setScenePendingDelete(scene)
              }}
              onAddScene={() => setCatalogOpen(true)}
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1 bg-black">
          <PreviewPanel
            device={previewDevice}
            onDeviceChange={setPreviewDevice}
            projectName={project.name}
            projectSlug={project.slug}
            scenes={visibleScenes}
          />
        </div>

        <aside className="flex w-[320px] shrink-0 flex-col border-l border-df-border bg-df-surface xl:w-[340px]">
          <div className="border-b border-df-border px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wider text-df-muted-fg">
              Propiedades
            </p>
            <p className="text-sm text-df-muted">
              {selectedScene
                ? `Editando: ${selectedScene.name}`
                : 'Selecciona una escena'}
            </p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto df-scrollbar">{inspectorBody}</div>
        </aside>
      </div>

      {/* Móvil / tablet: una sola vista + tabs inferiores */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:hidden">
        <div className="min-h-0 flex-1 overflow-hidden">
          {mobilePane === 'scenes' && (
            <div className="flex h-full flex-col bg-df-surface">
              <div className="border-b border-df-border px-4 py-3">
                <p className="text-sm font-medium text-df-fg">Escenas</p>
                <p className="text-xs text-df-muted">Toca una escena para editarla</p>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto df-scrollbar">
                <SceneList
                  scenes={visibleScenes}
                  selectedSceneId={selectedSceneId}
                  onSelectScene={handleSelectScene}
                  onReorderScenes={handleReorderScenes}
                  onToggleEnabled={handleToggleEnabled}
                  onDuplicateScene={handleDuplicateScene}
                  onDeleteScene={(sceneId) => {
                    const scene = visibleScenes.find((item) => item.id === sceneId)
                    if (scene) setScenePendingDelete(scene)
                  }}
                  onAddScene={() => setCatalogOpen(true)}
                />
              </div>
            </div>
          )}
          {mobilePane === 'preview' && (
            <div className="h-full bg-black">
              <PreviewPanel
                device={previewDevice}
                onDeviceChange={setPreviewDevice}
                projectName={project.name}
                projectSlug={project.slug}
                scenes={visibleScenes}
              />
            </div>
          )}
          {mobilePane === 'props' && (
            <div className="flex h-full flex-col bg-df-surface">
              <div className="border-b border-df-border px-4 py-3">
                <p className="text-sm font-medium text-df-fg">Ajustes</p>
                <p className="text-xs text-df-muted">
                  {selectedScene
                    ? `Editando: ${selectedScene.name}`
                    : 'Selecciona una escena primero'}
                </p>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto df-scrollbar">{inspectorBody}</div>
            </div>
          )}
        </div>

        <nav
          aria-label="Vistas del editor"
          className="flex shrink-0 border-t border-df-border bg-df-surface pb-[env(safe-area-inset-bottom)]"
        >
          {(
            [
              { id: 'scenes' as const, label: 'Escenas', icon: Clapperboard },
              { id: 'preview' as const, label: 'Preview', icon: MonitorPlay },
              { id: 'props' as const, label: 'Ajustes', icon: SlidersHorizontal },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon
            const active = mobilePane === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => setMobilePane(tab.id)}
                className={cn(
                  'flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 px-2 py-2 text-[11px] font-medium transition-colors',
                  active ? 'text-df-primary' : 'text-df-muted hover:text-df-fg'
                )}
              >
                <Icon className="size-5" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      <SceneCatalog
        open={catalogOpen}
        onOpenChange={setCatalogOpen}
        creating={creatingScene}
        onSelectType={(type) => void handleAddScene(type)}
      />

      <ConfirmDialog
        open={Boolean(scenePendingDelete)}
        onOpenChange={(open) => {
          if (!open) setScenePendingDelete(null)
        }}
        title="Eliminar escena"
        description={
          scenePendingDelete
            ? `Se eliminará “${scenePendingDelete.name}” de esta experiencia. Esta acción no se puede deshacer.`
            : undefined
        }
        confirmLabel="Eliminar"
        variant="destructive"
        loading={deletingScene}
        onConfirm={handleConfirmDeleteScene}
      />
    </div>
  )
}
