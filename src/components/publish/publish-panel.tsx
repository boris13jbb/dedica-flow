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
  AlertCircle,
  Copy,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/dialog'
import { toast } from '@/components/ui/toast'
import { formatPublicationDate } from '@/lib/format'
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

type PendingAction = 'publish' | null

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
  const [unpublishOpen, setUnpublishOpen] = useState(false)
  const [restoreTarget, setRestoreTarget] = useState<{
    id: string
    version: number
  } | null>(null)
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
      toast.success('Experiencia despublicada')
      router.refresh()
      await loadPublications()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo despublicar el proyecto'
      )
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async () => {
    if (!restoreTarget) return

    setErrorMessage(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      await restorePublication(restoreTarget.id)
      setSuccessMessage(`Versión ${restoreTarget.version} restaurada`)
      toast.success(`Versión ${restoreTarget.version} restaurada`)
      router.refresh()
      await loadPublications()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo restaurar la versión'
      )
      throw error
    } finally {
      setLoading(false)
    }
  }

  const copyPublicUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setSuccessMessage('Enlace copiado')
      toast.success('Copiado', 'El enlace está en el portapapeles')
    } catch {
      setErrorMessage('No se pudo copiar el enlace')
      toast.error('No se pudo copiar el enlace')
    }
  }

  return (
    <div className="space-y-6">
      {!canPublish && (
        <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-df-warning/30 bg-df-warning/10 p-4 text-sm text-amber-100">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">No hay escenas activas</p>
            <p className="mt-1 text-amber-100/80">
              Activa al menos una escena en el editor antes de publicar.
            </p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-df-error/30 bg-df-error/10 p-4 text-sm text-red-100"
        >
          <XCircle className="mt-0.5 size-4 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-df-success/30 bg-df-success/10 p-4 text-sm text-emerald-100"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-medium">
              {isPublished || lastPublicUrl
                ? '¡Experiencia publicada!'
                : successMessage}
            </p>
            <p className="mt-1 text-emerald-100/80">{successMessage}</p>
            {(isPublished || lastPublicUrl) && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={copyPublicUrl}>
                  <Copy className="size-3.5" />
                  Copiar
                </Button>
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 items-center gap-1.5 rounded-[var(--radius-md)] border border-df-success/40 bg-df-success/15 px-3 text-xs font-medium text-emerald-200 transition hover:bg-df-success/25"
                >
                  Abrir
                  <ExternalLink className="size-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-[var(--radius-lg)] bg-df-surface p-3 ring-1 ring-df-border">
              {isPublished ? (
                <Globe className="size-6 text-df-success" />
              ) : (
                <GlobeX className="size-6 text-df-muted-fg" />
              )}
            </div>

            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-df-fg">
                  {isPublished ? 'Publicado' : 'Sin publicar'}
                </h3>
                <Badge variant={isPublished ? 'success' : 'default'} dot>
                  {isPublished ? 'En línea' : 'Borrador'}
                </Badge>
              </div>

              {isPublished ? (
                <div className="space-y-2">
                  {activePublication ? (
                    <p className="text-sm text-df-muted">
                      Versión {activePublication.version} ·{' '}
                      {formatPublicationDate(activePublication.published_at)}
                    </p>
                  ) : (
                    <p className="text-sm text-df-muted">Enlace público disponible.</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="max-w-full truncate rounded-[var(--radius-md)] border border-df-border bg-df-surface px-2.5 py-1.5 text-xs text-df-fg">
                      {publicUrl}
                    </code>
                    <Button type="button" size="sm" variant="secondary" onClick={copyPublicUrl}>
                      <Copy className="size-3.5" />
                      Copiar
                    </Button>
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 items-center gap-1 rounded-[var(--radius-md)] px-2 text-xs text-df-info hover:underline"
                    >
                      Abrir
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-df-muted">
                  Este proyecto no está disponible públicamente todavía.
                </p>
              )}

              <p className="mt-2 text-xs text-df-muted-fg">
                {enabledScenes} escena{enabledScenes === 1 ? '' : 's'} activa
                {enabledScenes === 1 ? '' : 's'} lista{enabledScenes === 1 ? '' : 's'} para publicar
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:justify-end">
            {pendingAction === 'publish' ? (
              <div className="flex flex-wrap gap-2 rounded-[var(--radius-xl)] border border-df-border bg-df-surface p-3">
                <p className="w-full text-sm text-df-muted">
                  {isPublished
                    ? '¿Actualizar la publicación con los cambios actuales?'
                    : '¿Publicar este proyecto y hacerlo visible en la web?'}
                </p>
                <Button
                  type="button"
                  onClick={handlePublish}
                  disabled={loading || !canPublish}
                  loading={loading}
                >
                  {isPublished ? <RefreshCw className="size-4" /> : <Globe className="size-4" />}
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
                  className="min-h-11 sm:min-h-10"
                >
                  {isPublished ? (
                    <>
                      <RefreshCw className="size-4" />
                      Actualizar publicación
                    </>
                  ) : (
                    <>
                      <Globe className="size-4" />
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
                      setUnpublishOpen(true)
                    }}
                    disabled={loading}
                    className="min-h-11 sm:min-h-10"
                  >
                    <GlobeX className="size-4" />
                    Despublicar
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </Card>

      {publications.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-df-fg">Historial de versiones</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="size-3.5" />
              {showHistory ? 'Ocultar' : 'Ver'} ({publications.length})
            </Button>
          </div>

          {showHistory && (
            <div className="space-y-2">
              {publications.map((pub) => (
                <Card key={pub.id} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {pub.status === 'active' ? (
                        <CheckCircle2 className="size-4 text-df-success" />
                      ) : pub.status === 'inactive' ? (
                        <XCircle className="size-4 text-df-error" />
                      ) : (
                        <Clock className="size-4 text-df-muted-fg" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-df-fg">v{pub.version}</span>
                          {pub.status === 'active' && (
                            <Badge variant="success" dot>
                              Activa
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-df-muted">
                          {formatPublicationDate(pub.published_at)}
                        </p>
                      </div>
                    </div>

                    {pub.status !== 'active' && (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          setRestoreTarget({ id: pub.id, version: pub.version })
                        }
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
        </section>
      )}

      <ConfirmDialog
        open={unpublishOpen}
        onOpenChange={setUnpublishOpen}
        title="Despublicar experiencia"
        description="El enlace público dejará de mostrar la experiencia. Podrás volver a publicar más tarde."
        confirmLabel="Despublicar"
        variant="destructive"
        loading={loading}
        onConfirm={handleUnpublish}
      />

      <ConfirmDialog
        open={Boolean(restoreTarget)}
        onOpenChange={(open) => {
          if (!open) setRestoreTarget(null)
        }}
        title={
          restoreTarget
            ? `Restaurar versión ${restoreTarget.version}`
            : 'Restaurar versión'
        }
        description="Esta versión se convertirá en la activa. La publicación actual se reemplazará."
        confirmLabel="Restaurar"
        variant="primary"
        loading={loading}
        onConfirm={handleRestore}
      />
    </div>
  )
}
