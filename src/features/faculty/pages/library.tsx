import { useState } from 'react'
import { BookOpen, Search } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EmptyState, QueryState } from '@/components/states'
import { date } from '@/lib/format'
import { useFacultyLibrary, useReserveItem } from '../api'
import type { LibraryItemKind } from '@/types/faculty'

const KINDS: { id: string; label: string }[] = [
  { id: 'ALL', label: 'All types' },
  { id: 'BOOK', label: 'Books' },
  { id: 'JOURNAL', label: 'Journals' },
  { id: 'THESIS', label: 'Theses' },
  { id: 'DATASET', label: 'Datasets' },
]

const KIND_TONE: Record<LibraryItemKind, BadgeTone> = {
  BOOK: 'brand',
  JOURNAL: 'accent',
  THESIS: 'info',
  DATASET: 'success',
}

/** Faculty Library Resources — Figma 1:5381. */
export function FacultyLibrary() {
  const [q, setQ] = useState('')
  const [kind, setKind] = useState('ALL')
  const query = useFacultyLibrary(q.trim(), kind)

  // Optimistic: reserving is reversible and low-stakes. The only surprise the
  // server can spring is a queue position, and that is shown when it lands.
  const reserve = useReserveItem(['faculty', 'library', q.trim(), kind])

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Library Resources" subtitle={`${d.count} titles available to faculty.`} />

          <Card>
            <CardHeader title="Catalogue" icon={BookOpen} />
            <CardBody className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-3">
                <label className="relative flex flex-1 items-center">
                  <Search
                    className="pointer-events-none absolute left-3 size-4.5 text-fg-muted"
                    aria-hidden
                  />
                  <span className="sr-only">Search the catalogue</span>
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search by title or author…"
                    className="h-10 pl-10"
                  />
                </label>

                <Select value={kind} onValueChange={setKind}>
                  <SelectTrigger className="h-10 w-[180px]" aria-label="Filter by type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KINDS.map((k) => (
                      <SelectItem key={k.id} value={k.id}>
                        {k.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {d.results.length === 0 ? (
                <EmptyState title="Nothing matches" description="Try a different term or type." />
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {d.results.map((i) => (
                    <div
                      key={i.id}
                      className="flex items-start justify-between gap-3 rounded-control border border-border-strong bg-surface p-4"
                    >
                      <div className="min-w-0">
                        <p className="text-link text-fg-heading">{i.title}</p>
                        <p className="truncate text-fg-muted">
                          {i.author}
                          {i.year && ` • ${i.year}`}
                          {i.shelf && ` • ${i.shelf}`}
                        </p>
                        {/* An unavailable item says when, not just "no". */}
                        {!i.available && i.availableAt && (
                          <p className="text-fg-muted">Back {date(i.availableAt)}</p>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <Badge tone={KIND_TONE[i.kind]}>{i.kind}</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={reserve.isPending}
                          onClick={() => reserve.mutate(i.id)}
                        >
                          {i.available ? 'Reserve' : 'Join queue'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {reserve.isSuccess && reserve.data && (
                <p role="status" className="text-success">
                  {reserve.data.status === 'RESERVED'
                    ? 'Reserved — collect it within three days.'
                    : `Added to the queue at position ${reserve.data.queuePosition}.`}
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </QueryState>
  )
}
