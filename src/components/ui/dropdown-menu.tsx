'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

interface DropdownMenuContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(
  null
)

function useDropdownMenu() {
  const ctx = React.useContext(DropdownMenuContext)
  if (!ctx) throw new Error('DropdownMenu components require <DropdownMenu>')
  return ctx
}

interface DropdownMenuProps {
  children: React.ReactNode
}

function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative inline-flex">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

interface DropdownMenuTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

function DropdownMenuTrigger({
  children,
  className,
  onClick,
  ...props
}: DropdownMenuTriggerProps) {
  const { open, setOpen, triggerRef } = useDropdownMenu()

  return (
    <button
      type="button"
      ref={triggerRef}
      aria-haspopup="menu"
      aria-expanded={open}
      className={className}
      onClick={(e) => {
        onClick?.(e)
        setOpen(!open)
      }}
      {...props}
    >
      {children}
    </button>
  )
}

interface DropdownMenuContentProps {
  children: React.ReactNode
  align?: 'start' | 'end'
  className?: string
}

function DropdownMenuContent({
  children,
  align = 'end',
  className,
}: DropdownMenuContentProps) {
  const { open, setOpen, triggerRef } = useDropdownMenu()
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [coords, setCoords] = React.useState<{ top: number; left: number } | null>(
    null
  )

  React.useEffect(() => {
    if (!open || !triggerRef.current) {
      setCoords(null)
      return
    }

    const rect = triggerRef.current.getBoundingClientRect()
    const width = 200
    const left =
      align === 'end'
        ? Math.max(8, rect.right - width)
        : Math.min(rect.left, window.innerWidth - width - 8)

    setCoords({
      top: rect.bottom + 6,
      left,
    })
  }, [open, align, triggerRef])

  React.useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        contentRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return
      }
      setOpen(false)
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onPointer)
    }
  }, [open, setOpen, triggerRef])

  if (!open || typeof document === 'undefined' || !coords) return null

  return createPortal(
    <div
      ref={contentRef}
      role="menu"
      className={cn(
        'fixed z-[80] min-w-[200px] overflow-hidden rounded-[var(--radius-lg)] border border-df-border bg-df-card p-1 shadow-[var(--shadow-elevated)] animate-df-fade-in',
        className
      )}
      style={{ top: coords.top, left: coords.left, width: 200 }}
    >
      {children}
    </div>,
    document.body
  )
}

interface DropdownMenuItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  destructive?: boolean
}

function DropdownMenuItem({
  className,
  destructive,
  onClick,
  children,
  ...props
}: DropdownMenuItemProps) {
  const { setOpen } = useDropdownMenu()

  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        'flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-2 text-left text-sm transition-colors',
        'text-df-fg hover:bg-df-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-df-primary',
        'disabled:pointer-events-none disabled:opacity-50',
        destructive && 'text-df-error hover:bg-df-error/10',
        className
      )}
      onClick={(e) => {
        onClick?.(e)
        setOpen(false)
      }}
      {...props}
    >
      {children}
    </button>
  )
}

function DropdownMenuSeparator() {
  return <div role="separator" className="my-1 h-px bg-df-border" />
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
}
