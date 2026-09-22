'use client'

import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Breadcrumbs, type BreadcrumbItem } from './breadcrumbs'

interface AppHeaderProps {
  title?: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: React.ReactNode
  onMenuClick?: () => void
  className?: string
  /** Compact bar for editor / dense screens */
  dense?: boolean
}

function AppHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  onMenuClick,
  className,
  dense,
}: AppHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex shrink-0 items-center gap-3 border-b border-df-border bg-df-bg/80 px-4 backdrop-blur-xl sm:px-6',
        dense ? 'h-12' : 'h-14 min-h-14',
        className
      )}
    >
      {onMenuClick && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="lg:hidden"
          aria-label="Abrir menú"
          onClick={onMenuClick}
        >
          <Menu />
        </Button>
      )}

      <div className="min-w-0 flex-1">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <Breadcrumbs items={breadcrumbs} />
        ) : title ? (
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold tracking-tight text-df-fg sm:text-lg">
              {title}
            </h1>
            {subtitle && (
              <p className="hidden truncate text-xs text-df-muted sm:block">{subtitle}</p>
            )}
          </div>
        ) : null}
      </div>

      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </header>
  )
}

export { AppHeader }
export type { AppHeaderProps }
