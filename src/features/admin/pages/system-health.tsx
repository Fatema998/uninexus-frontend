import { Activity, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge, type BadgeTone } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useSystemHealth, type ServiceState } from '../api-ops'

const TONE: Record<ServiceState, BadgeTone> = {
  OPERATIONAL: 'success',
  DEGRADED: 'warning',
  DOWN: 'danger',
}

const DOT: Record<ServiceState, string> = {
  OPERATIONAL: 'bg-success',
  DEGRADED: 'bg-warning',
  DOWN: 'bg-danger',
}

/**
 * System Health — no Figma frame exists. Built from the designed health
 * vocabulary: the LMS/DB/API tiles on the executive dashboard (7:15548) and
 * "All API nodes responsive" from the Admin Master Workspace (7:16795).
 */
export function SystemHealth() {
  const query = useSystemHealth()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="System Health" subtitle="Platform status across every service." />

          <div
            className={cn(
              'flex flex-wrap items-center gap-3 rounded-card border p-6',
              d.overall.state === 'OPERATIONAL'
                ? 'border-success/20 bg-success/5'
                : 'border-warning/20 bg-warning/5',
            )}
          >
            <span className={cn('size-2.5 rounded-full', DOT[d.overall.state])} aria-hidden />
            <p className="text-card-title">
              {d.overall.state === 'OPERATIONAL' ? 'All systems operational' : 'Service degradation'}
            </p>
            <p className="text-fg-muted">{d.overall.note}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {d.metrics.map((m) => (
              <MetricCard key={m.label} label={m.label} value={m.value} tone={m.tone} />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
            <Card>
              <CardHeader title="Services" icon={Activity} />
              <CardBody className="flex flex-col gap-3">
                {d.services.map((s) => (
                  <div
                    key={s.name}
                    className="flex flex-wrap items-center gap-4 rounded-control border border-border-strong bg-surface p-4"
                  >
                    <span className={cn('size-2 shrink-0 rounded-full', DOT[s.state])} aria-hidden />
                    <p className="min-w-0 flex-1 text-link text-fg-heading">{s.name}</p>
                    <p className="text-fg-muted">{s.uptime} uptime</p>
                    <p className="text-fg-muted">{s.latency}</p>
                    <Badge tone={TONE[s.state]}>{s.state}</Badge>
                  </div>
                ))}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Incidents" />
              <CardBody className="flex flex-col gap-4">
                {d.incidents.map((i) => (
                  <div key={i.title} className="flex gap-3">
                    {i.resolved ? (
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                    ) : (
                      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
                    )}
                    <div className="min-w-0">
                      <p className="text-link text-fg-heading">{i.title}</p>
                      <p className="text-fg-muted">{i.when}</p>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </QueryState>
  )
}
