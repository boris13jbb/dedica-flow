import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[88px] w-full rounded-[var(--radius-md)] border bg-df-surface px-3 py-2 text-sm text-df-fg shadow-sm transition-colors duration-150',
          'border-df-border placeholder:text-df-muted-fg',
          'hover:border-df-border-hover',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-df-primary focus-visible:border-df-primary',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'resize-y',
          error && 'border-df-error focus-visible:ring-df-error',
          className
        )}
        ref={ref}
        aria-invalid={error || undefined}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
