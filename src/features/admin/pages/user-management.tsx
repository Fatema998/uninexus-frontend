import { useState } from 'react'
import { Link } from 'react-router'
import { Search } from 'lucide-react'
import { Badge } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { DataTable } from '@/components/patterns/data-table'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { Input } from '@/components/ui/input'
import { QueryState } from '@/components/states'
import { useUserManagement } from '../api'

/** ERP User Management — Figma 7:17990. */
export function UserManagement() {
  const query = useUserManagement()
  const [q, setQ] = useState('')

  return (
    <QueryState query={query}>
      {(d) => {
        const term = q.trim().toLowerCase()
        const rows = term
          ? d.users.filter(
              (u) =>
                u.name.toLowerCase().includes(term) ||
                u.email.toLowerCase().includes(term) ||
                u.role.toLowerCase().includes(term),
            )
          : d.users

        return (
          <div className="flex flex-col gap-6">
            <PageHeader title="User Management" subtitle="Accounts, roles, and access." />

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {d.metrics.map((m) => (
                <MetricCard key={m.label} label={m.label} value={m.value} tone={m.tone} />
              ))}
            </div>

            <Card>
              <CardHeader title="Users" />
              <CardBody className="pb-0">
                <label className="relative flex items-center">
                  <Search className="pointer-events-none absolute left-3 size-4.5 text-fg-muted" aria-hidden />
                  <span className="sr-only">Search users</span>
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search for users, roles, or departments…"
                    className="h-10 pl-10"
                  />
                </label>
              </CardBody>
              <DataTable
                rows={rows}
                getRowKey={(r) => r.id}
                empty={{ title: 'No users match', description: `Nothing matches “${q}”.` }}
                columns={[
                  {
                    key: 'name',
                    header: 'Name',
                    cell: (r) => (
                      <Link to={`/admin/users/${r.id}`} className="text-fg-heading hover:underline">
                        {r.name}
                      </Link>
                    ),
                  },
                  { key: 'email', header: 'Email', cell: (r) => r.email },
                  { key: 'role', header: 'Role', cell: (r) => r.role },
                  { key: 'department', header: 'Department', cell: (r) => r.department },
                  {
                    key: 'status',
                    header: 'Status',
                    cell: (r) => (
                      <Badge tone={r.active ? 'success' : 'neutral'}>
                        {r.active ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                    ),
                  },
                ]}
              />
            </Card>
          </div>
        )
      }}
    </QueryState>
  )
}
