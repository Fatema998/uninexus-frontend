import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useExamHub } from '../api'

/** ERP Examination Management Hub — Figma 7:17176. */
export function ExamHub() {
  const query = useExamHub()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Examination Hub" subtitle="Institution-wide exam operations." />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {d.metrics.map((m) => (
              <MetricCard key={m.label} label={m.label} value={m.value} tone={m.tone} />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title="Ongoing Exams" />
              <CardBody className="flex flex-col gap-3">
                {d.ongoing.map((o) => (
                  <div
                    key={o.title}
                    className="flex items-center justify-between gap-3 rounded-control border border-border-strong bg-surface p-4"
                  >
                    <p className="text-link text-fg-heading">{o.title}</p>
                    <p className="text-fg-muted">{o.place}</p>
                  </div>
                ))}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Activity Log" />
              <CardBody className="flex flex-col gap-3">
                {d.log.map((l) => (
                  <div key={l.text} className="flex gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-600" aria-hidden />
                    <div>
                      <p className="text-fg-body">{l.text}</p>
                      <p className="text-fg-muted">{l.when}</p>
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
