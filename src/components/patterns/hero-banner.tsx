import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * HeroBanner — design.md §3.
 * Horizontal brand fade (not the 135° gradient), 48px horizontal padding,
 * translucent pill badge with a live dot.
 */
export function HeroBanner({
  badge,
  heading,
  children,
  action,
  className,
}: {
  badge?: string
  heading: string
  children?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-card border border-border-faint bg-brand-700 shadow-card',
        className,
      )}
    >
      <div className="absolute inset-0 bg-hero-fade" aria-hidden />

      <div className="relative flex flex-wrap items-center justify-between gap-6 px-12 py-8">
        <div>
          {badge && (
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 backdrop-blur-[6px]">
              <span className="size-1.5 rounded-full bg-success-dot" aria-hidden />
              <span className="text-eyebrow uppercase text-white">{badge}</span>
            </span>
          )}
          <h2 className="text-card-title text-white">{heading}</h2>
          {children && <div className="mt-1 text-hero text-white/80">{children}</div>}
        </div>
        {action}
      </div>
    </div>
  )
}
