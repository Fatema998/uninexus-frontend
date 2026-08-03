import type { ReactNode } from 'react'

/** Every screen opens with a title, a one-line subtitle, and optional actions. */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-card-title">{title}</h1>
        {subtitle && <p className="text-fg-muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}
