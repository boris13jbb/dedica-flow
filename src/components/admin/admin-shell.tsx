import { AppShell } from '@/components/layout/app-shell'
import type { BreadcrumbItem } from '@/components/layout/breadcrumbs'

interface AdminShellProps {
  email?: string | null
  children: React.ReactNode
  title?: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: React.ReactNode
  hidePageHeading?: boolean
  fullWidth?: boolean
  contentClassName?: string
}

/**
 * Compatibilidad: AdminShell delega en AppShell DedicaFlow.
 * Mantiene la API usada por páginas admin existentes.
 */
export function AdminShell({
  email,
  children,
  title,
  subtitle,
  breadcrumbs,
  actions,
  hidePageHeading,
  fullWidth,
  contentClassName,
}: AdminShellProps) {
  return (
    <AppShell
      email={email}
      title={title}
      subtitle={subtitle}
      breadcrumbs={breadcrumbs}
      actions={actions}
      hidePageHeading={hidePageHeading}
      fullWidth={fullWidth}
      contentClassName={contentClassName}
    >
      {children}
    </AppShell>
  )
}
