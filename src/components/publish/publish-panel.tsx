'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Globe,
  GlobeX,
  Clock,
  CheckCircle2,
  XCircle,
  History,
  ExternalLink,
  Loader2,
  AlertCircle,
  Copy,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  publishProject,
  unpublishProject,
  getPublications,
  restorePublication,
} from '@/app/admin/projects/[id]/publish/actions'

interface Publication {
  id: string
  version: number
  slug: string
  status: string
  published_at: string
  unpublished_at: string | null
}

interface PublishPanelProps {
  projectId: string
  projectSlug: string
  projectStatus: string
  publicBaseUrl: string
  enabledScenes: number
}

type PendingAction = 'publish' | 'unpublish' | null

export function PublishPanel({
  projectId,
  projectSlug,
  projectStatus,
  publicBaseUrl,
  enabledScenes,
}: PublishPanelProps) {
  const router = useRouter()
  const [publications, setPublications] = useState<Publication[]>([])
  const [loading, setLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [lastPublicUrl, setLastPublicUrl] = useState<string | null>(null)

  const isPublished = projectStatus === 'published'
  const activePublication = publications.find((p) => p.status === 'active')
  const canPublish = enabledScenes > 0

  const publicUrl =
    lastPublicUrl ||
    `${publicBaseUrl.replace(/\/$/, '')}/p/${encodeURIComponent(projectSlug.trim())}`

  const loadPublications = useCallback(async () => {
    try {
      const pubs = await getPublications(projectId)
      setPublications(pubs)
    } catch (error) {
      console.error('Error loading publications:', error)
    }
  }, [projectId])

  useEffect(() => {
    const timer = setTimeout(() => loadPublications(), 0)
    return () => clearTimeout(timer)
  }, [loadPublications])

  const handlePublish = async () => {
    setErrorMessage(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      const result = await publishProject(projectId)
      setLastPublicUrl(result.publicUrl)
      setSuccessMessage(
        isPublished
          ? `Publicación actualizada · versión ${result.version}`
          : `Proyecto publicado · versión ${result.version}`
      )
      setPendingAction(null)
      router.refresh()
      await loadPublications()
    } catch (error) {
      console.error('Error publishing:', error)
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo publicar el proyecto'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleUnpublish = async () => {
    setErrorMessage(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      await unpublishProject(projectId)
      setSuccessMessage('Proyecto despublicado correctamente')
      setPendingAction(null)
      router.refresh()
      await loadPublications()
    } catch (error) {
      console.error('Error unpublishing:', error)
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo despublicar el proyecto'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (publicationId: string, version: number) => {
    if (
      !window.confirm(
        `¿Restaurar la versión ${version}? Esta se convertirá en la versión activa.`
      )
    ) {
      return
    }

    setErrorMessage(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      await restorePublication(publicationId)
      setSuccessMessage(`Versión ${version} restaurada`)
      router.refresh()
      await loadPublications()
    } catch (error) {
      console.error('Error restoring:', error)
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo restaurar la versión'
      )
    } finally {
      setLoading(false)
    }
  }

  const copyPublicUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setSuccessMessage('Enlace copiado al portapapeles')
    } catch {
      setErrorMessage('No se pudo copiar el enlace')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {!canPublish && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">No hay escenas activas</p>
            <p className="mt-1 text-amber-100/80">
              Activa al menos una escena en el editor antes de publicar.
            </p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-medium">{successMessage}</p>
            {(isPublished || lastPublicUrl) && (
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-emerald-200 underline-offset-2 hover:underline"
              >
                Abrir experiencia pública
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      )}

      <Card className="border-zinc-800 bg-zinc-900 p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-zinc-800 p-3">
              {isPublished ? (
                <Globe className="h-6 w-6 text-green-500" />
              ) : (
                <GlobeX className="h-6 w-6 text-zinc-500" />
              )}
            </div>

            <div className="min-w-0">
              <h3 className="mb-1 text-lg font-semibold text-zinc-50">
                {isPublished ? 'Publicado' : 'Sin publicar'}
              </h3>

              {isPublished && activePublication ? (
                <div className="space-y-2">
                  <p className="text-sm text-zinc-400">
                    Versión {activePublication.version} ·{' '}
                    {formatDate(activePublication.published_at)}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex max-w-full items-center gap-1 truncate text-sm text-blue-400 hover:text-blue-300"
                    >
                      {publicUrl}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={copyPublicUrl}
                      className="h-8"
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      Copiar
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-500">
                  Este proyecto no está disponible públicamente todavía.
                </p>
              )}

              <p className="mt-2 text-xs text-zinc-500">
                {enabledScenes} escena{enabledScenes === 1 ? '' : 's'} activa
                {enabledScenes === 1 ? '' : 's'} lista{enabledScenes === 1 ? '' : 's'} para publicar
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:justify-end">
            {pendingAction === 'publish' ? (
              <div className="flex flex-wrap gap-2 rounded-xl border border-zinc-700 bg-zinc-950/60 p-3">
                <p className="w-full text-sm text-zinc-300">
                  {isPublished
                    ? '¿Actualizar la publicación con los cambios actuales?'
                    : '¿Publicar este proyecto y hacerlo visible en la web?'}
                </p>
                <Button
                  type="button"
                  onClick={handlePublish}
                  disabled={loading || !canPublish}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : isPublished ? (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  ) : (
                    <Globe className="mr-2 h-4 w-4" />
                  )}
                  Confirmar
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setPendingAction(null)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </div>
            ) : pendingAction === 'unpublish' ? (
              <div className="flex flex-wrap gap-2 rounded-xl border border-zinc-700 bg-zinc-950/60 p-3">
                <p className="w-full text-sm text-zinc-300">
                  ¿Despublicar? El enlace dejará de mostrar la experiencia.
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleUnpublish}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirmar
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setPendingAction(null)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <>
                <Button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null)
                    setSuccessMessage(null)
                    setPendingAction('publish')
                  }}
                  disabled={loading || !canPublish}
                >
                  {isPublished ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Actualizar publicación
                    </>
                  ) : (
                    <>
                      <Globe className="mr-2 h-4 w-4" />
                      Publicar
                    </>
                  )}
                </Button>

                {isPublished && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setErrorMessage(null)
                      setSuccessMessage(null)
                      setPendingAction('unpublish')
                    }}
                    disabled={loading}
                  >
                    <GlobeX className="mr-2 h-4 w-4" />
                    Despublicar
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </Card>

      {publications.length > 0 && (
        <Button
          type="button"
          variant="secondary"
          onClick={() => setShowHistory(!showHistory)}
          className="w-full"
        >
          <History className="mr-2 h-4 w-4" />
          {showHistory ? 'Ocultar' : 'Ver'} historial de versiones ({publications.length})
        </Button>
      )}

      {showHistory && publications.length > 0 && (
        <div className="space-y-2">
          {publications.map((pub) => (
            <Card key={pub.id} className="border-zinc-800 bg-zinc-900 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {pub.status === 'active' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : pub.status === 'inactive' ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-zinc-500" />
                    )}
                    <span className="font-medium text-zinc-50">Versión {pub.version}</span>
                  </div>

                  <div className="text-sm text-zinc-400">
                    <p>{formatDate(pub.published_at)}</p>
                    {pub.unpublished_at && (
                      <p className="text-xs text-zinc-600">
                        Despublicada: {formatDate(pub.unpublished_at)}
                      </p>
                    )}
                  </div>
                </div>

                {pub.status !== 'active' && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => handleRestore(pub.id, pub.version)}
                    disabled={loading}
                  >
                    Restaurar
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
