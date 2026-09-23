import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  /** Show wordmark next to mark */
  showWordmark?: boolean
  /** Compact mark-only size */
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: { box: 'size-8', icon: 16, text: 'text-sm' },
  md: { box: 'size-9', icon: 18, text: 'text-base' },
  lg: { box: 'size-12', icon: 24, text: 'text-xl' },
}

function LogoMark({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Infinity-inspired mark */}
      <path
        d="M7.5 12c0-2.2 1.6-3.5 3.5-3.5 1.4 0 2.4.7 3.5 2.1C15.6 9.2 16.6 8.5 18 8.5c1.9 0 3.5 1.3 3.5 3.5S19.9 15.5 18 15.5c-1.4 0-2.4-.7-3.5-2.1-1.1 1.4-2.1 2.1-3.5 2.1-1.9 0-3.5-1.3-3.5-3.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 10.5c1.1 1.2 1.1 2.8 0 4M13 10.5c-1.1 1.2-1.1 2.8 0 4"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  )
}

function Logo({ className, showWordmark = true, size = 'md' }: LogoProps) {
  const s = sizeMap[size]

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center text-df-primary',
          s.box
        )}
      >
        <LogoMark size={s.icon + 4} />
      </span>
      {showWordmark && (
        <span className={cn('font-semibold tracking-tight text-df-fg', s.text)}>
          DedicaFlow
        </span>
      )}
    </span>
  )
}

export { Logo, LogoMark }
export type { LogoProps }
