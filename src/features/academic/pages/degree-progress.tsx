import { CalendarClock, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { ProgressBar } from '@/components/patterns/progress-bar'
import { QueryState } from '@/components/states'
import { useDegreeProgress } from '../api'
import { date } from '@/lib/format'
import type { MilestoneState } from '@/types'

const DOT: Record<MilestoneState, string> = {
  DONE: 'bg-success',
  CURRENT: 'bg-brand-600 ring-4 ring-brand-600/20',
  UPCOMING: 'bg-track',
}

/** Degree Progress — Figma 6:9702. */
export function DegreeProgress() {
  const query = useDegreeProgress()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Degree Progress" subtitle="How close you are to graduating." />

          <div className="grid gap-6 lg:grid-cols-3">
            {d.buckets.map((b) => (
              <Card key={b.label}>
                <CardBody>
                  <p className="text-eyebrow uppercase text-fg-muted">{b.label}</p>
                  <p className="mt-1 text-metric text-fg-heading">{b.percent}%</p>
                  <ProgressBar value={b.percent} tone={b.tone} label={b.label} className="mt-3" />
                  <p className="mt-2 text-fg-muted">{b.note}</p>
                </CardBody>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
            <Card>
              <CardHeader title="Milestone Timeline" />
              <CardBody>
                <ol className="flex flex-col">
                  {d.milestones.map((m, i) => (
                    <li key={m.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span className={cn('mt-1.5 size-3 shrink-0 rounded-full', DOT[m.state])} aria-hidden />
                        {i < d.milestones.length - 1 && (
                          <span className="w-px flex-1 bg-border" aria-hidden />
                        )}
                      </div>
                      <div className="pb-6">
                        <p className="text-link text-fg-heading">{m.title}</p>
                        <p className="text-fg-muted">{m.note}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </CardBody>
            </Card>

            <aside className="flex flex-col gap-6">
              {d.nextDeadline && (
                <Card>
                  <CardHeader title={d.nextDeadline.title} icon={CalendarClock} />
                  <CardBody>
                    <p className="text-fg-body">Due {date(d.nextDeadline.dueAt)}</p>
                  </CardBody>
                </Card>
              )}

              {d.forecast && (
                <div className="rounded-card border border-accent-600/20 bg-accent-600/5 p-4">
                  <p className="mb-1 flex items-center gap-2 text-link text-accent-600">
                    <Sparkles className="size-4" aria-hidden />
                    AI Graduation Forecast
                  </p>
                  <p className="text-fg-body">{d.forecast}</p>
                </div>
              )}
            </aside>
          </div>
        </div>
      )}
    </QueryState>
  )
}
