import { LifeBuoy, Mail } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { DataTable } from '@/components/patterns/data-table'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useSupport } from '../api-ops'

const TONE: Record<string, BadgeTone> = {
  OPEN: 'danger',
  PENDING: 'warning',
  CLOSED: 'success',
}

/** Support — no Figma frame exists; composed from tokens only. */
export function AdminSupport() {
  const query = useSupport()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Support" subtitle="Platform help for institutional staff." />

          <div className="grid gap-4 sm:grid-cols-3">
            {d.channels.map((c) => (
              <Card key={c.label}>
                <CardBody>
                  <span className="grid size-9 place-items-center rounded-control bg-brand-600/10 text-brand-700">
                    <Mail className="size-4" aria-hidden />
                  </span>
                  <p className="mt-3 text-eyebrow uppercase text-fg-muted">{c.label}</p>
                  <p className="text-link text-fg-heading">{c.value}</p>
                  <p className="text-fg-muted">{c.note}</p>
                </CardBody>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader title="Open Tickets" icon={LifeBuoy} />
            <DataTable
              rows={d.tickets}
              getRowKey={(r) => r.id}
              empty={{ title: 'No tickets', description: 'Nothing needs attention right now.' }}
              columns={[
                { key: 'id', header: 'Ticket', cell: (r) => r.id },
                { key: 'subject', header: 'Subject', cell: (r) => <span className="text-fg-heading">{r.subject}</span> },
                { key: 'from', header: 'Raised by', cell: (r) => r.from },
                { key: 'when', header: 'Updated', cell: (r) => r.when },
                { key: 'status', header: 'Status', cell: (r) => <Badge tone={TONE[r.status]}>{r.status}</Badge> },
              ]}
            />
          </Card>

          <Card>
            <CardHeader title="Common Tasks" />
            <CardBody className="grid gap-3 sm:grid-cols-2">
              {d.topics.map((t) => (
                <button
                  key={t}
                  type="button"
                  className="rounded-control border border-border-strong bg-surface p-4 text-left text-fg-body transition-colors hover:bg-surface-subtle"
                >
                  {t}
                </button>
              ))}
            </CardBody>
          </Card>
        </div>
      )}
    </QueryState>
  )
}
