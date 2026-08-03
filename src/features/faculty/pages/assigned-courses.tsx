import { Card, CardBody } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { ProgressBar } from '@/components/patterns/progress-bar'
import { QueryState } from '@/components/states'
import { useAssignedCourses } from '../api'

/** Faculty My Assigned Courses — Figma 1:433. */
export function AssignedCourses() {
  const query = useAssignedCourses()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="My Assigned Courses" subtitle="Everything you teach this semester." />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {d.courses.map((c) => (
              <Card key={c.code}>
                <CardBody>
                  <p className="text-link text-fg-heading">{c.name}</p>
                  <p className="text-fg-muted">{c.code} • {c.section} • {c.students} students</p>
                  <ProgressBar value={c.progress} label={`${c.name} syllabus progress`} className="mt-4" />
                  <p className="mt-2 text-fg-muted">{c.progress}% of syllabus covered</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}
    </QueryState>
  )
}
