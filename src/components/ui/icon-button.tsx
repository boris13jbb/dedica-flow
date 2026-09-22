import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button, type ButtonProps } from './button'

export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'size'> {
  label: string
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const sizeMap = {
  sm: 'icon-sm' as const,
  md: 'icon' as const,
  lg: 'icon' as const,
}

/**
 * Botón solo-icono con aria-label obligatorio.
 */
const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, size = 'md', className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={sizeMap[size]}
        aria-label={label}
        title={label}
        className={cn(size === 'lg' && 'h-11 w-11', className)}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
IconButton.displayName = 'IconButton'

function Spinner({
  className,
  label = 'Cargando',
}: {
  className?: string
  label?: string
}) {
  return (
    <Loader2
      className={cn('size-4 animate-spin text-df-primary', className)}
      aria-label={label}
      role="status"
    />
  )
}

export { IconButton, Spinner }
