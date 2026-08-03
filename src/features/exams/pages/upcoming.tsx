import { Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { QueryState } from '@/components/states'
import { date, timeRange } from '@/lib/format'
import { useUpcomingExams } from '../api'

/** Upcoming Exams — Figma 1:10924. */
export function UpcomingExams() {
  const query = useUpcomingExams()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Upcoming Exams" subtitle="What is coming, and when." />

          <div className="rounded-card border border-accent-600/20 bg-accent-600/5 p-6">
            <p className="mb-1 flex items-center gap-2 text-card-title text-accent-600">
              <Sparkles className="size-4.5" aria-hidden />
              Ready to Prepare?
            </p>
            <p className="text-fg-body">
              Let UniGPT build a personalised study plan around these dates.
            </p>
            <Button asChild className="mt-4 h-11 text-body">
              <Link to="/student/ai/study-planner">Create study plan</Link>
            </Button>
          </div>

          <Card>
            <CardHeader title="Exams" />
            <CardBody className="flex flex-col gap-3">
              {d.exams.map((e) => (
                <div
                  key={e.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-border-strong bg-surface p-4"
                >
                  <div>
                    <p className="text-link text-fg-heading">{e.course.title}</p>
                    <p className="text-fg-muted">{e.course.code} • {e.venue}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-link text-brand-700">{date(e.startsAt)}</p>
                    <p className="text-fg-muted">{timeRange(e.startsAt, e.endsAt)}</p>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}
    </QueryState>
  )
}
