import { Badge } from './badge'
import type { ProjectStatus } from '@/types'

const STATUS_META: Record<
  ProjectStatus,
  { label: string; variant: 'success' | 'warning' | 'default' }
> = {
  published: { label: 'Publicado', variant: 'success' },
  draft: { label: 'Borrador', variant: 'warning' },
  archived: { label: 'Archivado', variant: 'default' },
}

interface StatusBadgeProps {
  status: ProjectStatus
  className?: string
}

function StatusBadge({ status, className }: StatusBadgeProps) {
  const meta = STATUS_META[status] ?? STATUS_META.draft
  return (
    <Badge variant={meta.variant} dot className={className}>
      {meta.label}
    </Badge>
  )
}

export { StatusBadge, STATUS_META }
export type { StatusBadgeProps }
