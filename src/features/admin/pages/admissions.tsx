import { useState } from 'react'
import { Link } from 'react-router'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { relative } from '@/lib/format'
import { useAdmissions } from '../api'
import type { ApplicationStatus } from '@/types/admin'

const TONE: Record<ApplicationStatus, BadgeTone> = {
  PENDING: 'warning',
  IN_REVIEW: 'info',
  APPROVED: 'success',
  REJECTED: 'danger',
  WAITLISTED: 'neutral',
}

const STATUSES = ['ALL', 'PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'WAITLISTED']
const PAGE_SIZE = 20

/** ERP Admission Management — Figma 7:12631. */
export function Admissions() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('ALL')
  const [page, setPage] = useState(1)

  // Paginated and searched server-side — see docs/api/admin.md §2.
  const query = useAdmissions({ q: q.trim(), status, page })

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Admissions" subtitle="Applications across every programme." />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {d.metrics.map((m) => (
              <MetricCard key={m.label} label={m.label} value={m.value} tone={m.tone} />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title="Programmes" />
              <CardBody className="flex flex-col gap-3">
                {d.programmes.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-control border border-border-strong bg-surface p-4"
                  >
                    <div>
                      <p className="text-link text-fg-heading">{p.name}</p>
                      <p className="text-fg-muted">{p.school}</p>
                    </div>
                    <span className="text-link text-brand-700">{p.applicantCount}</span>
                  </div>
                ))}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title={`Action Center (${d.count.toLocaleString()})`} />
              <CardBody className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-3">
                  <label className="relative flex min-w-[200px] flex-1 items-center">
                    <Search
                      className="pointer-events-none absolute left-3 size-4.5 text-fg-muted"
                      aria-hidden
                    />
                    <span className="sr-only">Search applications</span>
                    <Input
                      value={q}
                      onChange={(e) => {
                        setQ(e.target.value)
                        setPage(1)
                      }}
                      placeholder="Search by name or reference…"
                      className="h-10 pl-10"
                    />
                  </label>
                  <Select
                    value={status}
                    onValueChange={(v) => {
                      setStatus(v)
                      setPage(1)
                    }}
                  >
                    <SelectTrigger className="h-10 w-[160px]" aria-label="Filter by status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s === 'ALL' ? 'All statuses' : s.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {d.results.map((a) => (
                  <Link
                    key={a.id}
                    to={`/admin/admissions/${a.id}`}
                    className="flex items-center justify-between gap-3 rounded-control border border-border-strong bg-surface p-4 hover:bg-surface-subtle"
                  >
                    <div className="min-w-0">
                      <p className="text-link text-fg-heading">{a.applicantName}</p>
                      <p className="truncate text-fg-muted">
                        {a.reference} • {a.programme.name} • {relative(a.submittedAt)}
                      </p>
                    </div>
                    <Badge tone={TONE[a.status]}>{a.status.replace('_', ' ')}</Badge>
                  </Link>
                ))}

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                  <p className="text-fg-muted">
                    {d.count === 0
                      ? 'No results'
                      : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, d.count)} of ${d.count}`}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!d.previous}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="size-4" aria-hidden />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!d.next}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                      <ChevronRight className="size-4" aria-hidden />
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </QueryState>
  )
}
