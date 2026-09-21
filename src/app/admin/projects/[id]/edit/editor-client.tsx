'use client'

import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Eye, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useEditorStore } from '@/stores'
import { SceneList } from '@/components/editor/scene-list'
import { PreviewPanel } from '@/components/editor/preview-panel'
import { SceneInspector } from '@/components/editor/scene-inspector'
import { updateProjectScenes, createScene, deleteScene } from './actions'
import type { Project, Scene, SceneType } from '@/types'
import { getSceneDefinition } from '@/components/experience/registry'

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
  const router = useRouter()
  
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

  useEffect(() => {
    setProject(project)
    setScenes(initialScenes)
  }, [project, initialScenes, setProject, setScenes])

  const selectedScene = scenes.find((s) => s.id === selectedSceneId)

  const handleSave = useCallback(async () => {
    if (!isDirty || isSaving) return

    setSaving(true)
    try {
      await updateProjectScenes(project.id, scenes)
      setDirty(false)
      setLastSaved(new Date())
      router.refresh()
    } catch (error) {
      console.error('Error saving:', error)
      alert('Error al guardar cambios')
    } finally {
      setSaving(false)
    }
  }, [
    project.id,
    scenes,
    isDirty,
    isSaving,
    setSaving,
    setDirty,
    setLastSaved,
    router,
  ])

  // Autosave
  useEffect(() => {
    if (!isDirty) return

    const timer = setTimeout(() => {
      handleSave()
    }, 1000)

    return () => clearTimeout(timer)
  }, [isDirty, handleSave])

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
      router.refresh()
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

      router.refresh()
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
    // Cast config to Json type for Supabase
    updateScene(selectedSceneId, { config: config as never })
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-950">
      {/* Topbar */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="text-zinc-400 hover:text-zinc-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div>
            <h1 className="text-sm font-medium text-zinc-50">{project.name}</h1>
            <p className="text-xs text-zinc-500">/p/{project.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Save status */}
          <div className="text-xs text-zinc-400">
            {isSaving ? (
              <span className="flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
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
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            size="sm"
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-50"
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </header>

      {/* Editor layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Scene list */}
        <div className="w-80 border-r border-zinc-800 bg-zinc-900/30">
          <SceneList
            scenes={scenes}
            selectedSceneId={selectedSceneId}
            onSelectScene={selectScene}
            onReorderScenes={handleReorderScenes}
            onToggleEnabled={handleToggleEnabled}
            onDuplicateScene={handleDuplicateScene}
            onDeleteScene={handleDeleteScene}
            onAddScene={handleAddScene}
          />
        </div>

        {/* Preview */}
        <div className="flex-1">
          <PreviewPanel
            device={previewDevice}
            onDeviceChange={setPreviewDevice}
            projectName={project.name}
            projectSlug={project.slug}
            scenes={scenes}
          />
        </div>

        {/* Inspector */}
        <div className="w-80 border-l border-zinc-800 bg-zinc-900/30 overflow-y-auto">
          {selectedScene ? (
            <SceneInspector
              sceneType={selectedScene.scene_type as SceneType}
              config={selectedScene.config as Record<string, unknown>}
              onChange={handleSceneConfigChange}
            />
          ) : (
            <div className="p-4 text-center text-zinc-400">
              <p>Selecciona una escena para editarla</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
