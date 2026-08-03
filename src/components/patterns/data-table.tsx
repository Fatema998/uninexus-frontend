import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/states'

/**
 * DataTable — design.md §3.
 * Deliberately not a data-grid: sorting/filtering/pagination arrive when a
 * screen needs them, not before.
 */
export type Column<T> = {
  key: string
  header: string
  /** Cell renderer. Return a string for plain text. */
  cell: (row: T) => ReactNode
  className?: string
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  empty,
  className,
}: {
  columns: Column<T>[]
  rows: T[]
  getRowKey: (row: T, index: number) => string
  empty?: { title: string; description?: string }
  className?: string
}) {
  if (rows.length === 0) {
    return <EmptyState title={empty?.title ?? 'Nothing here yet'} description={empty?.description} />
  }

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-surface-subtle">
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={cn('px-6 py-3 text-eyebrow uppercase text-fg-muted', c.className)}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={getRowKey(row, i)} className="border-b border-border last:border-0">
              {columns.map((c) => (
                <td key={c.key} className={cn('px-6 py-4 text-fg-body', c.className)}>
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
