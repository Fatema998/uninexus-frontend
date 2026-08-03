import type { ComponentType, ReactNode } from 'react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'

/** Card — design.md §3. Radius 18, translucent surface. */
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-card border border-border bg-surface backdrop-blur-[6px]',
        className,
      )}
    >
      {children}
    </section>
  )
}

/**
 * Optional header strip: subtle fill, 1px bottom border, 24 padding,
 * 18/28 bold title with an icon, and an optional right-aligned action.
 */
export function CardHeader({
  title,
  icon: Icon,
  action,
  children,
  className,
}: {
  title: string
  icon?: ComponentType<{ className?: string }>
  /** Text link action. Provide `to` for a route, `onClick` for a handler. */
  action?: { label: string; to?: string; onClick?: () => void }
  /** Anything richer than a text action — filters, menus. */
  children?: ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        'flex items-center justify-between gap-3 border-b border-border bg-surface-subtle p-6',
        className,
      )}
    >
      <h3 className="flex items-center gap-3 text-card-title">
        {Icon && <Icon className="size-[18px] text-fg-muted" aria-hidden />}
        {title}
      </h3>

      {action &&
        (action.to ? (
          <Link to={action.to} className="text-link text-brand-700 hover:underline">
            {action.label}
          </Link>
        ) : (
          <button type="button" onClick={action.onClick} className="text-link text-brand-700 hover:underline">
            {action.label}
          </button>
        ))}
      {children}
    </header>
  )
}

/** Padded body for a card that has a header strip. */
export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('p-6', className)}>{children}</div>
}
