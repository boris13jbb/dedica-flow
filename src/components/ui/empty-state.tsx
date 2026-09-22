import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from './button'

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
}

function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-[var(--radius-xl)] border border-dashed border-df-border bg-df-surface/40 px-6 py-14 text-center',
        className
      )}
      {...props}
    >
      {icon && (
        <div className="mb-4 flex size-12 items-center justify-center rounded-[var(--radius-lg)] bg-df-card text-df-primary ring-1 ring-df-border">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-df-fg">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-df-muted">{description}</p>
      )}
      {action && (
        <div className="mt-5">
          {action.href ? (
            <Link
              href={action.href}
              className={buttonVariants({ variant: 'primary', size: 'md' })}
            >
              {action.label}
            </Link>
          ) : (
            <Button type="button" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export { EmptyState }
export type { EmptyStateProps }
