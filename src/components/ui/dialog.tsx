'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children?: React.ReactNode
  footer?: React.ReactNode
  className?: string
  /** Accessible label for close button */
  closeLabel?: string
}

function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  closeLabel = 'Cerrar',
}: DialogProps) {
  const titleId = React.useId()
  const descriptionId = React.useId()

  React.useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Cerrar diálogo"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-df-fade-in"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          'relative z-10 flex max-h-[90vh] w-full flex-col rounded-t-[var(--radius-2xl)] border border-df-border bg-df-card shadow-[var(--shadow-elevated)] animate-df-slide-up sm:max-w-md sm:rounded-[var(--radius-xl)]',
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-df-border px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-semibold text-df-fg">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-df-muted">
                {description}
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={closeLabel}
            onClick={() => onOpenChange(false)}
          >
            <X />
          </Button>
        </div>
        {children && (
          <div className="overflow-y-auto px-5 py-4 df-scrollbar">{children}</div>
        )}
        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-df-border px-5 py-4 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'destructive' | 'primary'
  loading?: boolean
  onConfirm: () => void | Promise<void>
}

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'destructive',
  loading,
  onConfirm,
}: ConfirmDialogProps) {
  const [pending, setPending] = React.useState(false)
  const isLoading = loading ?? pending

  const handleConfirm = async () => {
    try {
      setPending(true)
      await onConfirm()
      onOpenChange(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === 'destructive' ? 'destructive' : 'primary'}
            loading={isLoading}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    />
  )
}

export { Dialog, ConfirmDialog }
export type { DialogProps, ConfirmDialogProps }
