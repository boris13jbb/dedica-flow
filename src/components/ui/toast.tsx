'use client'

import { useSyncExternalStore } from 'react'
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: string
  title: string
  description?: string
  variant: ToastVariant
  duration: number
}

interface ToastOptions {
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

type ToastListener = () => void

const listeners = new Set<ToastListener>()
let toasts: ToastItem[] = []
const emptyToasts: ToastItem[] = []

function emit() {
  listeners.forEach((l) => l())
}

function subscribe(listener: ToastListener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return toasts
}

function getServerSnapshot() {
  return emptyToasts
}

function addToast(options: ToastOptions) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const item: ToastItem = {
    id,
    title: options.title,
    description: options.description,
    variant: options.variant ?? 'default',
    duration: options.duration ?? 3200,
  }
  toasts = [...toasts, item]
  emit()

  if (item.duration > 0 && typeof window !== 'undefined') {
    window.setTimeout(() => dismissToast(id), item.duration)
  }

  return id
}

function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id)
  emit()
}

export function toast(options: ToastOptions | string) {
  if (typeof options === 'string') {
    return addToast({ title: options })
  }
  return addToast(options)
}

toast.success = (title: string, description?: string) =>
  addToast({ title, description, variant: 'success' })
toast.error = (title: string, description?: string) =>
  addToast({ title, description, variant: 'error' })
toast.warning = (title: string, description?: string) =>
  addToast({ title, description, variant: 'warning' })
toast.info = (title: string, description?: string) =>
  addToast({ title, description, variant: 'info' })

const variantStyles: Record<ToastVariant, string> = {
  default: 'border-df-border bg-df-card',
  success: 'border-df-success/30 bg-df-card',
  error: 'border-df-error/30 bg-df-card',
  warning: 'border-df-warning/30 bg-df-card',
  info: 'border-df-info/30 bg-df-card',
}

const variantIconClass: Record<ToastVariant, string> = {
  default: 'text-df-muted',
  success: 'text-df-success',
  error: 'text-df-error',
  warning: 'text-df-warning',
  info: 'text-df-info',
}

function ToastIcon({ variant }: { variant: ToastVariant }) {
  const className = cn('size-4', variantIconClass[variant])
  switch (variant) {
    case 'success':
      return <CheckCircle2 className={className} />
    case 'error':
      return <XCircle className={className} />
    case 'warning':
      return <AlertTriangle className={className} />
    default:
      return <Info className={className} />
  }
}

function Toaster() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0"
      aria-live="polite"
      aria-relevant="additions"
    >
      {items.map((item) => (
        <div
          key={item.id}
          role="status"
          className={cn(
            'pointer-events-auto flex items-start gap-3 rounded-[var(--radius-lg)] border p-3.5 shadow-[var(--shadow-elevated)] animate-df-slide-up',
            variantStyles[item.variant]
          )}
        >
          <span className="mt-0.5 shrink-0">
            <ToastIcon variant={item.variant} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-df-fg">{item.title}</p>
            {item.description && (
              <p className="mt-0.5 text-xs text-df-muted">{item.description}</p>
            )}
          </div>
          <button
            type="button"
            className="rounded-md p-1 text-df-muted-fg transition-colors hover:bg-df-surface hover:text-df-fg"
            aria-label="Cerrar notificación"
            onClick={() => dismissToast(item.id)}
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}

export { Toaster }
export type { ToastOptions }
