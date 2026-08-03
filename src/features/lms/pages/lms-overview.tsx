import { Link } from 'react-router'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { ProgressBar } from '@/components/patterns/progress-bar'
import { QueryState } from '@/components/states'
import { useLmsOverview } from '../api'

/** LMS Overview — Figma 6:2. */
export function LmsOverview() {
  const query = useLmsOverview()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Learning" subtitle="Your courses, materials, and coursework in one place." />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {d.metrics.map((m) => (
              <MetricCard key={m.label} label={m.label} value={m.value} tone={m.tone} />
            ))}
          </div>

          <Card>
            <CardHeader title="Active Courses" action={{ label: 'View all', to: '/student/lms/courses' }} />
            <CardBody className="grid gap-4 md:grid-cols-2">
              {d.courses.map((c) => (
                <Link
                  key={c.course.id}
                  to="/student/lms/courses"
                  className="rounded-control border border-border-strong bg-surface p-4 transition-colors hover:bg-surface-subtle"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="min-w-0 truncate text-link text-fg-heading">{c.course.title}</p>
                    {c.grade && <span className="shrink-0 text-link text-brand-700">{c.grade}</span>}
                  </div>
                  <p className="text-fg-muted">{c.course.code} • {c.instructorName}</p>
                  <ProgressBar
                    value={c.progress}
                    label={`${c.course.title} progress`}
                    className="mt-3"
                  />
                </Link>
              ))}
            </CardBody>
          </Card>
        </div>
      )}
    </QueryState>
  )
}
