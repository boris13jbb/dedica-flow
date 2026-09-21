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
}

export function PublishPanel({ projectId, projectSlug, projectStatus }: PublishPanelProps) {
  const router = useRouter()
  const [publications, setPublications] = useState<Publication[]>([])
  const [loading, setLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const isPublished = projectStatus === 'published'
  const activePublication = publications.find((p) => p.status === 'active')

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
    if (!confirm('¿Publicar este proyecto? Esto lo hará visible públicamente.')) return

    setLoading(true)
    try {
      const result = await publishProject(projectId)
      alert(`¡Publicado! Versión ${result.version}`)
      router.refresh()
      await loadPublications()
    } catch (error) {
      console.error('Error publishing:', error)
      alert(error instanceof Error ? error.message : 'Error al publicar')
    } finally {
      setLoading(false)
    }
  }

  const handleUnpublish = async () => {
    if (!confirm('¿Despublicar este proyecto? Ya no será visible públicamente.')) return

    setLoading(true)
    try {
      await unpublishProject(projectId)
      alert('Proyecto despublicado')
      router.refresh()
      await loadPublications()
    } catch (error) {
      console.error('Error unpublishing:', error)
      alert(error instanceof Error ? error.message : 'Error al despublicar')
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (publicationId: string, version: number) => {
    if (!confirm(`¿Restaurar la versión ${version}? Esta se convertirá en la versión activa.`)) return

    setLoading(true)
    try {
      await restorePublication(publicationId)
      alert(`Versión ${version} restaurada`)
      router.refresh()
      await loadPublications()
    } catch (error) {
      console.error('Error restoring:', error)
      alert(error instanceof Error ? error.message : 'Error al restaurar')
    } finally {
      setLoading(false)
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

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/p/${projectSlug}`

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className="p-6 bg-zinc-900 border-zinc-800">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-zinc-800 rounded-lg">
              {isPublished ? (
                <Globe className="w-6 h-6 text-green-500" />
              ) : (
                <GlobeX className="w-6 h-6 text-zinc-500" />
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-zinc-50 mb-1">
                {isPublished ? 'Publicado' : 'Sin publicar'}
              </h3>
              
              {isPublished && activePublication ? (
                <div className="space-y-1">
                  <p className="text-sm text-zinc-400">
                    Versión {activePublication.version} · {formatDate(activePublication.published_at)}
                  </p>
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                  >
                    {publicUrl}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <p className="text-sm text-zinc-500">
                  Este proyecto no está disponible públicamente
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {isPublished ? (
              <Button
                type="button"
                variant="secondary"
                onClick={handleUnpublish}
                disabled={loading}
              >
                <GlobeX className="w-4 h-4 mr-2" />
                Despublicar
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handlePublish}
                disabled={loading}
              >
                <Globe className="w-4 h-4 mr-2" />
                Publicar
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* History Toggle */}
      {publications.length > 0 && (
        <Button
          type="button"
          variant="secondary"
          onClick={() => setShowHistory(!showHistory)}
          className="w-full"
        >
          <History className="w-4 h-4 mr-2" />
          {showHistory ? 'Ocultar' : 'Ver'} historial de versiones ({publications.length})
        </Button>
      )}

      {/* History List */}
      {showHistory && publications.length > 0 && (
        <div className="space-y-2">
          {publications.map((pub) => (
            <Card
              key={pub.id}
              className="p-4 bg-zinc-900 border-zinc-800"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {pub.status === 'active' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : pub.status === 'inactive' ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-zinc-500" />
                    )}
                    <span className="font-medium text-zinc-50">
                      Versión {pub.version}
                    </span>
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
