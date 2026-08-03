import type { ComponentType, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Badge, type BadgeTone } from './badge'
import { ProgressBar } from './progress-bar'

/**
 * MetricCard — design.md §3.
 * The 4px bottom border (other sides 1px) and the blur are the design's
 * signature. Do not "clean them up".
 */
const value = cva('text-metric', {
  variants: {
    tone: {
      brand: 'text-brand-700',
      accent: 'text-accent-600',
      info: 'text-info',
      success: 'text-success',
      warning: 'text-warning',
      danger: 'text-danger',
    },
  },
  defaultVariants: { tone: 'brand' },
})

const iconTile = cva('grid size-9 shrink-0 place-items-center rounded-control', {
  variants: {
    tone: {
      brand: 'bg-brand-600/10 text-brand-700',
      accent: 'bg-accent-600/10 text-accent-600',
      info: 'bg-info/10 text-info',
      success: 'bg-success/10 text-success',
      warning: 'bg-warning/10 text-warning',
      danger: 'bg-danger/10 text-danger',
    },
  },
  defaultVariants: { tone: 'brand' },
})

export type MetricTone = NonNullable<VariantProps<typeof value>['tone']>

type MetricCardProps = {
  label: string
  value: ReactNode
  /** Colour encodes meaning — see design.md §3. */
  tone?: MetricTone
  icon?: ComponentType<{ className?: string }>
  /** Small suffix after the value, e.g. the `/120` in `92/120`. */
  unit?: string
  badge?: { label: string; tone?: BadgeTone }
  /** 0–100. Renders a progress bar in the metric's own colour. */
  progress?: number
  className?: string
}

export function MetricCard({
  label,
  value: metricValue,
  tone = 'brand',
  icon: Icon,
  unit,
  badge,
  progress,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-b-4 border-border-strong bg-surface p-6 backdrop-blur-[6px]',
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        {Icon && (
          <span className={iconTile({ tone })}>
            <Icon className="size-[18px]" aria-hidden />
          </span>
        )}
        {badge && <Badge tone={badge.tone}>{badge.label}</Badge>}
      </div>

      <p className="text-eyebrow uppercase text-fg-muted">{label}</p>

      <p className="mt-1 flex items-baseline gap-1">
        <span className={value({ tone })}>{metricValue}</span>
        {unit && <span className="text-unit text-fg-muted/40">{unit}</span>}
      </p>

      {progress !== undefined && <ProgressBar value={progress} tone={tone} className="mt-3" />}
    </div>
  )
}
