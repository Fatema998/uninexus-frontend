import type { ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Badge — design.md §3. Only `success` is drawn in Figma; the other soft
 * pairs are derived at the same lightness relationship (see index.css).
 */
const badge = cva(
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-badge uppercase',
  {
    variants: {
      tone: {
        neutral: 'bg-surface-subtle text-fg-muted',
        brand: 'bg-brand-600/10 text-brand-700',
        accent: 'bg-accent-600/10 text-accent-600',
        success: 'bg-success-bg text-success-fg',
        info: 'bg-info-bg text-info-fg',
        warning: 'bg-warning-bg text-warning-fg',
        danger: 'bg-danger-bg text-danger-fg',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

export type BadgeTone = NonNullable<VariantProps<typeof badge>['tone']>

export function Badge({
  tone,
  children,
  className,
}: {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}) {
  return <span className={cn(badge({ tone }), className)}>{children}</span>
}
