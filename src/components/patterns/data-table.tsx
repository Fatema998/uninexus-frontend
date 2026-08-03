import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmptyState } from '@/components/states'

/**
 * DataTable — design.md §3, built on the shadcn <Table> primitives.
 *
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
      <Table>
        <TableHeader>
          <TableRow className="bg-surface-subtle hover:bg-surface-subtle">
            {columns.map((c) => (
              <TableHead
                key={c.key}
                className={cn('h-auto px-6 py-3 text-eyebrow uppercase text-fg-muted', c.className)}
              >
                {c.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={getRowKey(row, i)} className="border-border">
              {columns.map((c) => (
                <TableCell key={c.key} className={cn('px-6 py-4 text-body text-fg-body', c.className)}>
                  {c.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
