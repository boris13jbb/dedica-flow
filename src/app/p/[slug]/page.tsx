import { createAdminClient } from '@/lib/supabase/admin'
import { ExperienceRenderer } from '@/components/experience/renderer'
import type { Json } from '@/types'
import type { ExperienceConfig } from '@/types'
import { notFound } from 'next/navigation'

interface PublicationSnapshot {
  projectId: string
  name: string
  slug: string
  scenes: Array<{
    id: string
    sceneKey: string
    sceneType: string
    name: string
    position: number
    duration: {
      enter: number
      hold: number
      exit: number
    }
    trigger: string
    enabled: boolean
    config: Record<string, unknown>
  }>
  audio?: {
    assetId?: string
    url?: string | null
    volume: number
    loop: boolean
    fadeIn: number
    fadeOut: number
  }
  metadata?: {
    title?: string
    description?: string
    ogImage?: string
    noIndex: boolean
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createAdminClient()

  const { data: publication } = (await supabase
    .from('publications')
    .select('snapshot')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()) as { data: { snapshot: Json } | null }

  if (!publication) {
    return {
      title: 'Experiencia no encontrada',
    }
  }

  const snapshot = publication.snapshot as unknown as PublicationSnapshot

  return {
    title: snapshot.metadata?.title || snapshot.name,
    description: snapshot.metadata?.description || `Experiencia creada con DedicaStudio`,
    robots: {
      index: !snapshot.metadata?.noIndex,
      follow: !snapshot.metadata?.noIndex,
    },
    openGraph: snapshot.metadata?.ogImage ? {
      images: [snapshot.metadata.ogImage],
    } : undefined,
  }
}

export default async function PublicExperiencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createAdminClient()

  // Get active publication
  const { data: publication } = (await supabase
    .from('publications')
    .select('id, snapshot')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()) as { data: { id: string; snapshot: Json } | null }

  if (!publication) {
    notFound()
  }

  const snapshot = publication.snapshot as unknown as PublicationSnapshot

  // Convert snapshot to ExperienceConfig
  const config: ExperienceConfig = {
    projectId: snapshot.projectId,
    name: snapshot.name,
    slug: snapshot.slug,
    scenes: snapshot.scenes.map((scene) => ({
      id: scene.id,
      sceneKey: scene.sceneKey,
      sceneType: scene.sceneType as never,
      name: scene.name,
      position: scene.position,
      duration: scene.duration,
      trigger: scene.trigger as 'auto' | 'click' | 'manual',
      enabled: scene.enabled,
      config: scene.config,
    })),
    audio: snapshot.audio,
    metadata: snapshot.metadata,
  }

  return (
    <div className="w-full h-screen bg-zinc-950">
      <ExperienceRenderer
        config={config}
        autoPlay={true}
        quality="auto"
      />
    </div>
  )
}
