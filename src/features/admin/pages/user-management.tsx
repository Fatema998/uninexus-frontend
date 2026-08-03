import { useState } from 'react'
import { Link } from 'react-router'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { DataTable } from '@/components/patterns/data-table'
import { MetricCard } from '@/components/patterns/metric-card'
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
import { QueryState } from '@/components/states'
import { relative } from '@/lib/format'
import { useUserManagement } from '../api'
import type { UserStatus } from '@/types/admin'

const STATUS_TONE: Record<UserStatus, BadgeTone> = {
  ACTIVE: 'success',
  SUSPENDED: 'warning',
  INVITED: 'info',
  DEACTIVATED: 'neutral',
}

const ROLES = ['ALL', 'student', 'faculty', 'admin']
const STATUSES = ['ALL', 'ACTIVE', 'SUSPENDED', 'INVITED', 'DEACTIVATED']

const PAGE_SIZE = 20

/**
 * ERP User Management — Figma 7:17990.
 *
 * Search and filters go to the server. The directory is 12,000 rows, so
 * filtering the current page would silently show a fraction of the matches —
 * see docs/api/admin.md §2. The metrics describe the whole collection, not
 * the page.
 */
export function UserManagement() {
  const [q, setQ] = useState('')
  const [role, setRole] = useState('ALL')
  const [status, setStatus] = useState('ALL')
  const [page, setPage] = useState(1)

  // Any filter change invalidates the page number — page 7 of a narrower
  // result set is usually empty.
  const change = <T,>(set: (v: T) => void) => (v: T) => {
    set(v)
    setPage(1)
  }

  const query = useUserManagement({ q: q.trim(), role, status, page })

  return (
    <QueryState query={query}>
      {(d) => {
        const from = (page - 1) * PAGE_SIZE + 1
        const to = Math.min(page * PAGE_SIZE, d.count)

        return (
          <div className="flex flex-col gap-6">
            <PageHeader title="User Management" subtitle="Accounts, roles, and access." />

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {d.metrics.map((m) => (
                <MetricCard key={m.label} label={m.label} value={m.value} tone={m.tone} />
              ))}
            </div>

            <Card>
              <CardHeader title={`Users (${d.count.toLocaleString()})`} />
              <CardBody className="flex flex-wrap gap-3 pb-0">
                <label className="relative flex min-w-[240px] flex-1 items-center">
                  <Search
                    className="pointer-events-none absolute left-3 size-4.5 text-fg-muted"
                    aria-hidden
                  />
                  <span className="sr-only">Search users</span>
                  <Input
                    value={q}
                    onChange={(e) => change(setQ)(e.target.value)}
                    placeholder="Search by name, email, or reference…"
                    className="h-10 pl-10"
                  />
                </label>

                <Select value={role} onValueChange={change(setRole)}>
                  <SelectTrigger className="h-10 w-[150px]" aria-label="Filter by role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r === 'ALL' ? 'All roles' : r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={status} onValueChange={change(setStatus)}>
                  <SelectTrigger className="h-10 w-[170px]" aria-label="Filter by status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s === 'ALL' ? 'All statuses' : s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardBody>

              <DataTable
                rows={d.results}
                getRowKey={(r) => r.id}
                empty={{ title: 'No users match', description: 'Try a different search or filter.' }}
                columns={[
                  {
                    key: 'name',
                    header: 'Name',
                    cell: (r) => (
                      <Link to={`/admin/users/${r.id}`} className="text-fg-heading hover:underline">
                        {r.fullName}
                      </Link>
                    ),
                  },
                  { key: 'reference', header: 'ID', cell: (r) => r.reference },
                  { key: 'email', header: 'Email', cell: (r) => r.email },
                  { key: 'role', header: 'Role', cell: (r) => r.role },
                  { key: 'department', header: 'Department', cell: (r) => r.department?.code ?? '—' },
                  {
                    key: 'lastActive',
                    header: 'Last active',
                    cell: (r) => (r.lastActiveAt ? relative(r.lastActiveAt) : '—'),
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    cell: (r) => <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>,
                  },
                ]}
              />

              <CardBody className="flex flex-wrap items-center justify-between gap-3 border-t border-border">
                <p className="text-fg-muted">
                  {d.count === 0 ? 'No results' : `Showing ${from}–${to} of ${d.count.toLocaleString()}`}
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
              </CardBody>
            </Card>
          </div>
        )
      }}
    </QueryState>
  )
}
