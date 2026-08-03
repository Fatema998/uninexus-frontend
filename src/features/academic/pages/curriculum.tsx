import { ConnectedAssistant } from '@/components/patterns/assistant-panel'
import { Badge, type BadgeTone } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useCurriculum } from '../api'
import type { CurriculumState } from '@/types'

const STATE_TONE: Record<CurriculumState, BadgeTone> = {
  DONE: 'success',
  IN_PROGRESS: 'brand',
  REMAINING: 'neutral',
}

const STATE_LABEL: Record<CurriculumState, string> = {
  DONE: 'DONE',
  IN_PROGRESS: 'IN PROGRESS',
  REMAINING: 'REMAINING',
}

/** Curriculum — Figma 6:10057. */
export function Curriculum() {
  const query = useCurriculum()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Curriculum" subtitle="Your full degree map, course by course." />

          <div className="grid gap-6 sm:grid-cols-3">
            {d.stats.map((s) => (
              <MetricCard
                key={s.label}
                label={s.label}
                value={s.value}
                tone={s.tone}
                progress={s.progress}
              />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
            <Card>
              <CardHeader title="Programme Courses" />
              <CardBody className="flex flex-col gap-3">
                {d.entries.map((c) => (
                  <div
                    key={c.course.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-border-strong bg-surface p-4"
                  >
                    <div className="min-w-0">
                      <p className="text-link text-fg-heading">{c.course.title}</p>
                      <p className="text-fg-muted">
                        {c.department} • {c.course.credits} credits
                      </p>
                    </div>
                    <Badge tone={STATE_TONE[c.state]}>{STATE_LABEL[c.state]}</Badge>
                  </div>
                ))}
              </CardBody>
            </Card>

            <ConnectedAssistant context="academic.curriculum" />
          </div>
        </div>
      )}
    </QueryState>
  )
}
