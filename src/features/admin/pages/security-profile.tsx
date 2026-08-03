import { useParams } from 'react-router'
import { Laptop, MapPin, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useSecurityProfile } from '../api'

/** ERP User Management & Security Profile — Figma 7:15889. */
export function SecurityProfile() {
  const { id = '' } = useParams()
  const query = useSecurityProfile(id)

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader
            title={d.user.name}
            subtitle={`${d.user.role} • ${d.user.department}`}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            {d.stats.map((s) => (
              <MetricCard key={s.label} label={s.label} value={s.value} tone={s.tone} />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title="Authorized Devices" icon={Laptop} />
              <CardBody className="flex flex-col gap-3">
                {d.devices.map((dev) => (
                  <div
                    key={dev.name}
                    className="flex items-center justify-between gap-3 rounded-control border border-border-strong bg-surface p-4"
                  >
                    <div className="min-w-0">
                      <p className="text-link text-fg-heading">{dev.name}</p>
                      <p className="truncate text-fg-muted">{dev.meta}</p>
                    </div>
                    {dev.current && <Badge tone="success">CURRENT</Badge>}
                  </div>
                ))}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Security Overview" icon={ShieldCheck} />
              <CardBody className="flex flex-col gap-4">
                {d.notes.map((n) => (
                  <div key={n.label} className="border-l-2 border-nav-active-student pl-3">
                    <p className="text-link text-fg-heading">{n.label}</p>
                    <p className="text-fg-muted">{n.body}</p>
                  </div>
                ))}
                <p className="flex items-center gap-2 border-t border-border pt-3 text-fg-muted">
                  <MapPin className="size-4 shrink-0" aria-hidden />
                  Last known location: {d.location}
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </QueryState>
  )
}
