import { Flame } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { ProgressBar } from '@/components/patterns/progress-bar'
import { QueryState } from '@/components/states'
import { useLearningProgress } from '../api'
import { duration, percent } from '@/lib/format'

/** LMS Learning Progress — Figma 6:5065. */
export function LearningProgress() {
  const query = useLearningProgress()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Learning Progress" subtitle="How you are tracking this semester." />

          <div className="grid gap-6 sm:grid-cols-3">
            <MetricCard
              label="Overall Completion"
              value={percent(d.overallPercent)}
              tone="brand"
              progress={d.overallPercent}
            />
            <MetricCard
              label="Total Study Hours"
              value={duration(d.studyMinutes * 60)}
              tone="accent"
              icon={Flame}
            />
            <MetricCard label="Current Streak" value={`${d.streakDays} Days`} tone="warning" />
          </div>

          <Card>
            <CardHeader title="By Course" />
            <CardBody className="flex flex-col gap-4">
              {d.courses.map((c) => (
                <div key={c.course.id}>
                  <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-link text-fg-heading">
                      {c.course.title} ({c.course.code})
                    </span>
                    <span className="text-fg-muted">{c.instructorName}</span>
                  </div>
                  <ProgressBar value={c.percent} tone={c.tone} label={`${c.course.title} progress`} />
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}
    </QueryState>
  )
}
