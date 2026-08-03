import { Link } from 'react-router'
import { Card, CardBody } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { ProgressBar } from '@/components/patterns/progress-bar'
import { QueryState } from '@/components/states'
import { useAssignedSections } from '../api'

/** Faculty My Assigned Courses — Figma 1:433. */
export function AssignedCourses() {
  const query = useAssignedSections()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="My Assigned Courses" subtitle="Everything you teach this semester." />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {d.sections.map((s) => (
              <Card key={s.id}>
                <CardBody>
                  <Link
                    to={`/faculty/courses?section=${s.id}`}
                    className="text-link text-fg-heading hover:underline"
                  >
                    {s.course.title}
                  </Link>
                  <p className="text-fg-muted">
                    {s.course.code} • Sec {s.name} • {s.enrolledCount} students
                  </p>
                  <ProgressBar
                    value={s.syllabusProgress}
                    label={`${s.course.title} syllabus progress`}
                    className="mt-4"
                  />
                  <p className="mt-2 text-fg-muted">
                    {s.chaptersDone} of {s.chaptersTotal} chapters covered
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}
    </QueryState>
  )
}
