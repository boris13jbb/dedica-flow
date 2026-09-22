import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional fixed width (e.g. "40%" or 120) */
  width?: string | number
  /** Optional fixed height */
  height?: string | number
}

function Skeleton({ className, width, height, style, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-[var(--radius-md)] bg-df-surface',
        className
      )}
      style={{
        width,
        height,
        backgroundImage:
          'linear-gradient(90deg, var(--surface) 0%, var(--card-hover) 50%, var(--surface) 100%)',
        backgroundSize: '200% 100%',
        animation: 'df-skeleton 1.6s ease-in-out infinite',
        ...style,
      }}
      aria-hidden
      {...props}
    />
  )
}

export { Skeleton }
