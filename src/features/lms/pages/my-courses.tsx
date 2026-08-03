import { Link } from 'react-router'
import { Badge } from '@/components/patterns/badge'
import { Card, CardBody } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { ProgressBar } from '@/components/patterns/progress-bar'
import { QueryState } from '@/components/states'
import { useLmsCourses } from '../api'

/** LMS My Courses — Figma 6:439. */
export function LmsMyCourses() {
  const query = useLmsCourses()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="My Courses" subtitle={d.term} />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {d.courses.map((c) => (
              <Card key={c.code}>
                <CardBody>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-link text-fg-heading">{c.name}</p>
                      <p className="text-fg-muted">{c.code} • {c.teacher}</p>
                    </div>
                    <Badge tone="success">Ongoing</Badge>
                  </div>

                  <ProgressBar value={c.progress} label={`${c.name} progress`} className="mt-4" />
                  <p className="mt-2 text-fg-muted">{c.progress}% complete</p>

                  <div className="mt-4 flex gap-2">
                    <Link
                      to={`/student/lms/courses/${c.code}/lectures`}
                      className="text-link text-brand-700 hover:underline"
                    >
                      Lectures
                    </Link>
                    <span className="text-fg-muted" aria-hidden>•</span>
                    <Link
                      to={`/student/lms/courses/${c.code}/materials`}
                      className="text-link text-brand-700 hover:underline"
                    >
                      Materials
                    </Link>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}
    </QueryState>
  )
}
