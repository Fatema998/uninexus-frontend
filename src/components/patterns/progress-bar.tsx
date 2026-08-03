import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import type { MetricTone } from './metric-card'

/**
 * ProgressBar — design.md §3. Height 6, pill, track `--track`.
 * Fill is the metric's own colour, never brand-blue by default.
 *
 * Wraps shadcn <Progress> (Radix) so it keeps the correct ARIA semantics;
 * the tone/track styling is UniGPT's.
 */
const FILL: Record<MetricTone, string> = {
  brand: '[&_[data-slot=progress-indicator]]:bg-brand-700',
  accent: '[&_[data-slot=progress-indicator]]:bg-accent-600',
  info: '[&_[data-slot=progress-indicator]]:bg-info',
  success: '[&_[data-slot=progress-indicator]]:bg-success',
  warning: '[&_[data-slot=progress-indicator]]:bg-warning',
  danger: '[&_[data-slot=progress-indicator]]:bg-danger',
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
    <Progress
      value={pct}
      aria-label={label}
      className={cn('h-1.5 bg-track', FILL[tone], className)}
    />
  )
}
