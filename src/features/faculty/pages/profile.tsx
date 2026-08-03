import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useFacultyProfile } from '../api'

/** Faculty Profile — Figma 1:868. */
export function FacultyProfile() {
  const query = useFacultyProfile()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="My Profile" subtitle="Your faculty record." />

          <div className="grid gap-6 sm:grid-cols-2">
            {d.metrics.map((m) => (
              <MetricCard key={m.label} label={m.label} value={m.value} tone={m.tone} />
            ))}
          </div>

          <Card>
            <CardHeader title="Details" />
            <CardBody>
              <dl className="grid gap-4 sm:grid-cols-2">
                {d.fields.map((f) => (
                  <div key={f.label}>
                    <dt className="text-eyebrow uppercase text-fg-muted">{f.label}</dt>
                    <dd className="text-link text-fg-heading">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Education" />
            <CardBody className="flex flex-col gap-3">
              {d.education.map((e) => (
                <div key={e.school} className="border-l-2 border-nav-active-student pl-3">
                  <p className="text-link text-fg-heading">{e.school}</p>
                  <p className="text-fg-muted">{e.note}</p>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}
    </QueryState>
  )
}
