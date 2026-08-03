import { AlertTriangle, Lightbulb } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { ProgressBar } from '@/components/patterns/progress-bar'
import { QueryState } from '@/components/states'
import { useExamAnalytics } from '../api'

/** Exam Analytics — Figma 1:13501. */
export function ExamAnalytics() {
  const query = useExamAnalytics()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Exam Analytics" subtitle={d.summary} />

          <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
            <Card>
              <CardHeader title="Assessment Breakdown" />
              <CardBody className="flex flex-col gap-4">
                {d.breakdown.map((b) => (
                  <div key={b.label}>
                    <div className="mb-1.5 flex items-baseline justify-between">
                      <span className="text-link text-fg-heading">{b.label}</span>
                      <span className="text-fg-muted">{b.percent}%</span>
                    </div>
                    <ProgressBar value={b.percent} tone={b.tone} label={b.label} />
                  </div>
                ))}
              </CardBody>
            </Card>

            <aside className="flex flex-col gap-6">
              {d.weakest && (
                <div className="rounded-card border border-warning/20 bg-warning/5 p-4">
                  <p className="mb-1 flex items-center gap-2 text-link text-warning">
                    <AlertTriangle className="size-4" aria-hidden />
                    {d.weakest.title}
                  </p>
                  <p className="text-fg-body">{d.weakest.note}</p>
                </div>
              )}

              <Card>
                <CardHeader title="Recommendations" icon={Lightbulb} />
                <CardBody>
                  <ul className="flex flex-col gap-3">
                    {d.recommendations.map((r) => (
                      <li key={r} className="flex gap-2 text-fg-body">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-600" aria-hidden />
                        {r}
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            </aside>
          </div>
        </div>
      )}
    </QueryState>
  )
}
