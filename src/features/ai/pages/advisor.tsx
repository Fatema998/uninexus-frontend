import { AlertTriangle, Sparkles } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { ProgressBar } from '@/components/patterns/progress-bar'
import { QueryState } from '@/components/states'
import { useAdvisor } from '../api'
import { gpa } from '@/lib/format'

/** AI Academic Advisor — Figma 1:7728. */
export function Advisor() {
  const query = useAdvisor()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="AI Academic Advisor" subtitle="Where you stand, and what to do next." />

          <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader title="Academic Roadmap Progress" />
                <CardBody>
                  <div className="flex flex-wrap items-baseline gap-4">
                    <p className="text-metric text-brand-700">{gpa(d.gpa.current)}</p>
                    <p className="text-unit text-fg-muted">target {gpa(d.gpa.target)}</p>
                  </div>
                  <ProgressBar value={d.gpa.percent} label="Progress to target GPA" className="mt-3" />
                  <p className="mt-2 text-fg-muted">{d.gpa.percent}% of target reached</p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Recommended Action Plan" />
                <CardBody className="flex flex-col gap-4">
                  {d.plan.map((p) => (
                    <div key={p.id} className="border-l-2 border-nav-active-student pl-3">
                      <p className="text-link text-fg-heading">{p.title}</p>
                      <p className="text-fg-muted">{p.body}</p>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </div>

            <aside className="flex flex-col gap-6">
              {d.alerts.map((a) => (
                <div key={a.id} className="rounded-card border border-warning/20 bg-warning/5 p-4">
                  <p className="mb-1 flex items-center gap-2 text-link text-warning">
                    <AlertTriangle className="size-4" aria-hidden />
                    {a.title}
                  </p>
                  <p className="text-fg-body">{a.body}</p>
                </div>
              ))}

              <Card>
                <CardHeader title="Benchmarks" />
                <CardBody className="flex flex-col gap-3">
                  {d.stats.map((s) => (
                    <div key={s.label} className="flex items-baseline justify-between gap-3">
                      <span className="text-fg-muted">{s.label}</span>
                      <span className="text-link text-fg-heading">{s.value}</span>
                    </div>
                  ))}
                </CardBody>
              </Card>

              <div className="rounded-card border border-accent-600/20 bg-accent-600/5 p-4">
                <p className="mb-1 flex items-center gap-2 text-link text-accent-600">
                  <Sparkles className="size-4" aria-hidden />
                  AI Insight
                </p>
                <p className="text-fg-body">{d.insight}</p>
              </div>
            </aside>
          </div>
        </div>
      )}
    </QueryState>
  )
}
