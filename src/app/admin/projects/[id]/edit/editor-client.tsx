'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import { ArrowLeft, Save, Loader2, SlidersHorizontal, X } from 'lucide-react'
import Link from 'next/link'
import { useShallow } from 'zustand/react/shallow'
import { Button } from '@/components/ui/button'
import { useEditorStore, useRendererStore } from '@/stores'
import { SceneList } from '@/components/editor/scene-list'
import { PreviewPanel } from '@/components/editor/preview-panel'
import { SceneInspector } from '@/components/editor/scene-inspector'
import { ProjectWorkspaceNav } from '@/components/admin/project-workspace-nav'
import { updateProjectScenes, createScene, deleteScene } from './actions'
import type { Project, Scene, SceneType } from '@/types'
import { getSceneDefinition } from '@/components/experience/registry'

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
  const [showInspector, setShowInspector] = useState(false)
  
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
    removeScene,
    reorderScenes,
    setDirty,
    setSaving,
    setLastSaved,
    setPreviewDevice,
  } = useEditorStore()

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

  const selectedScene = scenes.find((s) => s.id === selectedSceneId)

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
    } catch (error) {
      console.error('Error saving:', error)
      alert('Error al guardar cambios')
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

  const handleAddScene = async () => {
    try {
      const newPosition = scenes.length
      const newScene = await createScene(project.id, {
        scene_key: `scene-${Date.now()}`,
        scene_type: 'message',
        name: `Nueva escena ${newPosition + 1}`,
        position: newPosition,
        duration_ms: 5000,
        trigger_mode: 'auto',
        enabled: true,
        config: (getSceneDefinition('message')?.defaultConfig || {}) as unknown as Record<string, never>,
      })

      setScenes([...scenes, newScene as Scene])
      selectScene((newScene as { id: string }).id)
    } catch (error) {
      console.error('Error creating scene:', error)
      alert('Error al crear escena')
    }
  }

  const handleDeleteScene = async (sceneId: string) => {
    if (!confirm('¿Eliminar esta escena?')) return

    try {
      await deleteScene(project.id, sceneId)
      removeScene(sceneId)
    } catch (error) {
      console.error('Error deleting scene:', error)
      alert('Error al eliminar escena')
    }
  }

  const handleDuplicateScene = async (sceneId: string) => {
    const scene = scenes.find((s) => s.id === sceneId)
    if (!scene) return

    try {
      const newScene = await createScene(project.id, {
        scene_key: `${scene.scene_key}-copy-${Date.now()}`,
        scene_type: scene.scene_type,
        name: `${scene.name} (copia)`,
        position: scene.position + 1,
        duration_ms: scene.duration_ms,
        trigger_mode: scene.trigger_mode,
        enabled: scene.enabled,
        config: scene.config as unknown as Record<string, never>,
      })

      const updatedScenes = [...scenes]
      updatedScenes.splice(scene.position + 1, 0, newScene as Scene)
      
      setScenes(
        updatedScenes.map((s, i) => ({
          ...s,
          position: i,
        }))
      )
    } catch (error) {
      console.error('Error duplicating scene:', error)
      alert('Error al duplicar escena')
    }
  }

  const handleToggleEnabled = (sceneId: string) => {
    const scene = scenes.find((s) => s.id === sceneId)
    if (!scene) return

    updateScene(sceneId, { enabled: !scene.enabled })
  }

  const handleReorderScenes = (sceneIds: string[]) => {
    reorderScenes(sceneIds)
  }

  const handleSceneConfigChange = (config: Record<string, unknown>) => {
    if (!selectedSceneId) return
    updateScene(selectedSceneId, { config: config as never })
  }

  const handleSelectScene = (sceneId: string | null) => {
    selectScene(sceneId)
    if (sceneId) setShowInspector(true)
  }

  const inspectorBody = selectedScene ? (
    <SceneInspector
      sceneType={selectedScene.scene_type as SceneType}
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
    <div className="space-y-3 p-4 text-sm text-zinc-400">
      <p>Selecciona una escena a la izquierda para editar textos y opciones.</p>
      <Link
        href={`/admin/projects/${project.id}/media#audio-experiencia`}
        className="inline-flex rounded-lg border border-amber-500/40 bg-amber-400/10 px-3 py-2 text-amber-200 transition hover:bg-amber-400/15"
      >
        Ir a insertar audio →
      </Link>
    </div>
  )

  return (
    <div className="flex h-screen flex-col bg-zinc-950">
      <header className="shrink-0 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/admin"
              className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-50"
              title="Volver al panel"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wider text-amber-400/90">
                Paso 1 · Escenas
              </p>
              <h1 className="truncate text-sm font-semibold text-zinc-50">
                {project.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden text-xs text-zinc-400 sm:block">
              {isSaving ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Guardando...
                </span>
              ) : isDirty ? (
                <span>Cambios pendientes</span>
              ) : lastSaved ? (
                <SaveStatus lastSaved={lastSaved} />
              ) : (
                <span>Guardado</span>
              )}
            </div>

            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="lg:hidden"
              onClick={() => setShowInspector(true)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Textos
            </Button>

            <Button
              type="button"
              onClick={() => void handleSave()}
              disabled={!isDirty || isSaving}
              size="sm"
              className="bg-zinc-100 text-zinc-950 hover:bg-white"
            >
              <Save className="mr-2 h-4 w-4" />
              Guardar
            </Button>
          </div>
        </div>

        <div className="border-t border-zinc-800/80 px-3 py-2 sm:px-4">
          <ProjectWorkspaceNav projectId={project.id} />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900/40 sm:w-72 lg:w-80">
          <div className="border-b border-zinc-800 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Lista de escenas
            </p>
            <p className="text-sm text-zinc-300">
              Ordena y activa cada momento
            </p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <SceneList
              scenes={scenes}
              selectedSceneId={selectedSceneId}
              onSelectScene={handleSelectScene}
              onReorderScenes={handleReorderScenes}
              onToggleEnabled={handleToggleEnabled}
              onDuplicateScene={handleDuplicateScene}
              onDeleteScene={handleDeleteScene}
              onAddScene={handleAddScene}
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <PreviewPanel
            device={previewDevice}
            onDeviceChange={setPreviewDevice}
            projectName={project.name}
            projectSlug={project.slug}
            scenes={scenes}
          />
        </div>

        {/* Panel de propiedades siempre disponible en desktop */}
        <aside className="hidden w-80 shrink-0 flex-col border-l border-zinc-800 bg-zinc-900/40 lg:flex xl:w-96">
          <div className="border-b border-zinc-800 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Propiedades
            </p>
            <p className="text-sm text-zinc-300">
              {selectedScene
                ? `Editando: ${selectedScene.name}`
                : 'Selecciona una escena'}
            </p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{inspectorBody}</div>
        </aside>
      </div>

      {/* Drawer móvil/tablet: campos de texto editables */}
      {showInspector && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar panel"
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowInspector(false)}
          />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl border border-zinc-700 bg-zinc-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Propiedades
                </p>
                <p className="text-sm text-zinc-200">
                  {selectedScene
                    ? `Editando: ${selectedScene.name}`
                    : 'Selecciona una escena'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowInspector(false)}
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">{inspectorBody}</div>
          </div>
        </div>
      )}
    </div>
  )
}
