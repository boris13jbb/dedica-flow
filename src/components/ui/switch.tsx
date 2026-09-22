'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label?: string
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked, onCheckedChange, disabled, label, id, ...props }, ref) => {
    return (
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        ref={ref}
        className={cn(
          'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-df-primary focus-visible:ring-offset-2 focus-visible:ring-offset-df-bg',
          'disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-df-primary' : 'bg-df-border',
          className
        )}
        onClick={() => onCheckedChange(!checked)}
        {...props}
      >
        <span
          className={cn(
            'pointer-events-none block size-4 rounded-full bg-white shadow transition-transform duration-150',
            checked ? 'translate-x-4' : 'translate-x-0.5'
          )}
        />
      </button>
    )
  }
)
Switch.displayName = 'Switch'

export { Switch }
