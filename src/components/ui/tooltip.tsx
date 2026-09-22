'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactElement
  side?: 'top' | 'bottom' | 'left' | 'right'
  delayMs?: number
  className?: string
}

function Tooltip({
  content,
  children,
  side = 'top',
  delayMs = 300,
  className,
}: TooltipProps) {
  const [open, setOpen] = React.useState(false)
  const timeoutRef = React.useRef<number | null>(null)
  const id = React.useId()

  const show = () => {
    timeoutRef.current = window.setTimeout(() => setOpen(true), delayMs)
  }

  const hide = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    setOpen(false)
  }

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    }
  }, [])

  const sideClasses = {
    top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
    bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
    left: 'right-full top-1/2 mr-2 -translate-y-1/2',
    right: 'left-full top-1/2 ml-2 -translate-y-1/2',
  }

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {React.cloneElement(children, {
        'aria-describedby': open ? id : undefined,
      } as React.HTMLAttributes<HTMLElement>)}
      {open && (
        <span
          id={id}
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-50 whitespace-nowrap rounded-md border border-df-border bg-df-surface px-2 py-1 text-xs text-df-fg shadow-lg animate-df-fade-in',
            sideClasses[side],
            className
          )}
        >
          {content}
        </span>
      )}
    </span>
  )
}

export { Tooltip }
export type { TooltipProps }
