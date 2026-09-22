import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (!items.length) return null

  return (
    <nav aria-label="Miga de pan" className={cn('min-w-0', className)}>
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1">
              {index > 0 && (
                <ChevronRight className="size-3.5 shrink-0 text-df-muted-fg" aria-hidden />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="truncate text-df-muted transition-colors hover:text-df-fg"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    'truncate',
                    isLast ? 'font-medium text-df-fg' : 'text-df-muted'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export { Breadcrumbs }
