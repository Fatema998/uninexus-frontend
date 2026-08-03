import { Sparkles, Target } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { ProgressBar } from '@/components/patterns/progress-bar'
import { QueryState } from '@/components/states'
import { useLearningAnalytics } from '../api'

/** LMS Learning Analytics — Figma 6:6146. */
export function LearningAnalytics() {
  const query = useLearningAnalytics()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Learning Analytics" subtitle="Mastery across core competencies." />

          <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
            <Card>
              <CardHeader title="Proficiency Matrix" />
              <CardBody className="flex flex-col gap-4">
                {d.proficiency.map((p) => (
                  <div key={p.label}>
                    <div className="mb-1.5 flex items-baseline justify-between">
                      <span className="text-link text-fg-heading">{p.label}</span>
                      <span className="text-fg-muted">{p.percent}%</span>
                    </div>
                    <ProgressBar value={p.percent} tone={p.tone} label={`${p.label} proficiency`} />
                  </div>
                ))}
              </CardBody>
            </Card>

            <aside className="flex flex-col gap-6">
              <Card>
                <CardBody>
                  <p className="text-eyebrow uppercase text-fg-muted">{d.milestone.label}</p>
                  <p className="mt-1 text-link text-fg-heading">{d.milestone.value}</p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title={d.focus.label} icon={Target} />
                <CardBody>
                  <p className="text-link text-fg-heading">{d.focus.value}</p>
                </CardBody>
              </Card>

              <div className="rounded-card border border-accent-600/20 bg-accent-600/5 p-4">
                <p className="mb-1 flex items-center gap-2 text-link text-accent-600">
                  <Sparkles className="size-4" aria-hidden />
                  UniGPT Insight
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
