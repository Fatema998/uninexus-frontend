import type { ComponentType, ReactNode } from 'react'
import { AlertCircle, Inbox, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/hooks/use-api'

/**
 * Loading / empty / error states.
 *
 * No Figma frames exist for these (docs/design.md §6.4) — they are composed
 * purely from existing tokens so they read as part of the system. Every list
 * and every query-backed surface uses these three; do not hand-roll a spinner.
 */

export function LoadingState({ label = 'Loading…', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('grid place-items-center gap-3 p-12 text-fg-muted', className)} role="status">
      <Loader2 className="size-5 animate-spin" aria-hidden />
      <p className="text-link font-normal">{label}</p>
    </div>
  )
}

/** Skeleton block for card-shaped content — steadier than a spinner in a grid. */
export function LoadingCard({ className }: { className?: string }) {
  return (
    <div
      className={cn('h-32 animate-pulse rounded-card border border-border-strong bg-surface', className)}
      role="status"
      aria-label="Loading"
    />
  )
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: {
  title: string
  description?: string
  icon?: ComponentType<{ className?: string }>
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('grid place-items-center gap-2 p-12 text-center', className)}>
      <Icon className="size-6 text-fg-muted" aria-hidden />
      <p className="text-card-title">{title}</p>
      {description && <p className="max-w-[42ch] text-fg-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

/** Turn an unknown thrown value into something worth showing a user. */
function messageFor(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) return 'You do not have access to this.'
    if (error.status === 404) return 'We could not find what you were looking for.'
    if (error.status >= 500) return 'The server had a problem. Please try again shortly.'
    return `Request failed (${error.status}).`
  }
  return error instanceof Error ? error.message : 'Something went wrong.'
}

export function ErrorState({
  error,
  onRetry,
  className,
}: {
  error: unknown
  onRetry?: () => void
  className?: string
}) {
  return (
    <div className={cn('grid place-items-center gap-2 p-12 text-center', className)} role="alert">
      <AlertCircle className="size-6 text-danger" aria-hidden />
      <p className="text-card-title">Couldn't load this</p>
      <p className="max-w-[42ch] text-fg-muted">{messageFor(error)}</p>
      {onRetry && (
        <Button variant="outline" size="lg" onClick={onRetry} className="mt-2">
          Try again
        </Button>
      )}
    </div>
  )
}

/**
 * Standard query renderer: one place that decides loading vs error vs empty,
 * so 83 screens don't each invent their own branching.
 */
export function QueryState<T>({
  query,
  children,
  empty,
  isEmpty,
}: {
  query: { data?: T; isPending: boolean; error: unknown; refetch: () => void }
  children: (data: T) => ReactNode
  empty?: { title: string; description?: string }
  isEmpty?: (data: T) => boolean
}) {
  if (query.isPending) return <LoadingState />
  if (query.error) return <ErrorState error={query.error} onRetry={query.refetch} />
  if (query.data === undefined) return null
  if (isEmpty?.(query.data)) {
    return <EmptyState title={empty?.title ?? 'Nothing here yet'} description={empty?.description} />
  }
  return <>{children(query.data)}</>
}
