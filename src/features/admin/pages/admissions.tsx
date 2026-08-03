import { Link } from 'react-router'
import { Badge, type BadgeTone } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useAdmissions } from '../api'

const TONE: Record<string, BadgeTone> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
}

/** ERP Admission Management — Figma 7:12631. */
export function Admissions() {
  const query = useAdmissions()

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
                {d.programs.map((p) => (
                  <div
                    key={p.name}
                    className="flex items-center justify-between gap-3 rounded-control border border-border-strong bg-surface p-4"
                  >
                    <div>
                      <p className="text-link text-fg-heading">{p.name}</p>
                      <p className="text-fg-muted">{p.school}</p>
                    </div>
                    <span className="text-link text-brand-700">{p.applicants}</span>
                  </div>
                ))}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Action Center" />
              <CardBody className="flex flex-col gap-3">
                {d.applications.map((a) => (
                  <Link
                    key={a.id}
                    to={`/admin/admissions/${a.id}`}
                    className="flex items-center justify-between gap-3 rounded-control border border-border-strong bg-surface p-4 hover:bg-surface-subtle"
                  >
                    <div className="min-w-0">
                      <p className="text-link text-fg-heading">{a.name}</p>
                      <p className="truncate text-fg-muted">{a.id} • {a.program}</p>
                    </div>
                    <Badge tone={TONE[a.status]}>{a.status}</Badge>
                  </Link>
                ))}
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </QueryState>
  )
}
