import { cn } from '@/lib/utils'
import type { MetricTone } from './metric-card'

/**
 * ProgressBar — design.md §3. Height 6, pill, track `--track`.
 * Fill is the metric's own colour, never brand-blue by default.
 */
const FILL: Record<MetricTone, string> = {
  brand: 'bg-brand-700',
  accent: 'bg-accent-600',
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
}

export function ProgressBar({
  value,
  tone = 'brand',
  label,
  className,
}: {
  /** 0–100; clamped. */
  value: number
  tone?: MetricTone
  label?: string
  className?: string
}) {
  const pct = Math.min(100, Math.max(0, value))

  return (
    <div
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-track', className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className={cn('h-full rounded-full transition-[width]', FILL[tone])} style={{ width: `${pct}%` }} />
    </div>
  )
}
