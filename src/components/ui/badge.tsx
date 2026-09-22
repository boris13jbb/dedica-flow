import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-df-surface text-df-muted ring-1 ring-df-border',
        primary: 'bg-df-primary/15 text-df-primary-light ring-1 ring-df-primary/30',
        success: 'bg-df-success/15 text-df-success ring-1 ring-df-success/30',
        warning: 'bg-df-warning/15 text-df-warning ring-1 ring-df-warning/30',
        error: 'bg-df-error/15 text-df-error ring-1 ring-df-error/30',
        info: 'bg-df-info/15 text-df-info ring-1 ring-df-info/30',
        outline: 'bg-transparent text-df-muted ring-1 ring-df-border',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            'size-1.5 rounded-full',
            variant === 'success' && 'bg-df-success',
            variant === 'warning' && 'bg-df-warning',
            variant === 'error' && 'bg-df-error',
            variant === 'info' && 'bg-df-info',
            variant === 'primary' && 'bg-df-primary',
            (!variant || variant === 'default' || variant === 'outline') && 'bg-df-muted'
          )}
          aria-hidden
        />
      )}
      {children}
    </span>
  )
}

export { Badge, badgeVariants }
