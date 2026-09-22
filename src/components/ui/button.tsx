import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-df-primary focus-visible:ring-offset-2 focus-visible:ring-offset-df-bg disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-df-primary text-df-primary-fg shadow-[var(--shadow-glow)] hover:bg-df-primary-light active:bg-df-primary',
        secondary:
          'bg-df-surface text-df-fg border border-df-border hover:bg-df-card-hover hover:border-df-border-hover',
        outline:
          'border border-df-border bg-transparent text-df-fg hover:bg-df-surface hover:border-df-border-hover',
        ghost:
          'text-df-muted hover:bg-df-surface hover:text-df-fg',
        destructive:
          'bg-df-error/15 text-df-error border border-df-error/30 hover:bg-df-error/25',
        success:
          'bg-df-success/15 text-df-success border border-df-success/30 hover:bg-df-success/25',
        link:
          'text-df-primary underline-offset-4 hover:underline hover:text-df-primary-light p-0 h-auto',
        // Legacy aliases for existing call sites
        default:
          'bg-df-primary text-df-primary-fg shadow-[var(--shadow-glow)] hover:bg-df-primary-light',
      },
      size: {
        sm: 'h-8 px-3 text-xs [&_svg]:size-3.5',
        md: 'h-10 px-4 text-sm [&_svg]:size-4',
        lg: 'h-11 px-6 text-sm [&_svg]:size-4',
        icon: 'h-10 w-10 [&_svg]:size-4',
        'icon-sm': 'h-8 w-8 [&_svg]:size-3.5',
        default: 'h-10 px-4 text-sm [&_svg]:size-4',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" aria-hidden />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
