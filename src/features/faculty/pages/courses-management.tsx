import { FileText } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { ProgressBar } from '@/components/patterns/progress-bar'
import { Button } from '@/components/ui/button'
import { QueryState } from '@/components/states'
import { useCoursesManagement } from '../api'

/** Faculty Courses Management — Figma 1:3640. */
export function CoursesManagement() {
  const query = useCoursesManagement()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader
            title="Courses"
            subtitle={d.chaptersNote}
            action={<Button className="h-11 text-body">New course</Button>}
          />

          <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
            <Card>
              <CardHeader title="Managed Courses" />
              <CardBody className="flex flex-col gap-3">
                {d.courses.map((c) => (
                  <div key={c.code} className="rounded-control border border-border-strong bg-surface p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-link text-fg-heading">{c.code} - {c.name}</p>
                      <p className="text-fg-muted">{c.students} students</p>
                    </div>
                    <ProgressBar value={c.progress} label={`${c.code} progress`} className="mt-3" />
                  </div>
                ))}
              </CardBody>
            </Card>

            <aside className="flex flex-col gap-6">
              <Card>
                <CardHeader title="Recent Materials" icon={FileText} />
                <CardBody className="flex flex-col gap-3">
                  {d.materials.map((m) => (
                    <div key={m.name} className="flex items-center gap-3">
                      <FileText className="size-4.5 shrink-0 text-fg-muted" aria-hidden />
                      <div className="min-w-0">
                        <p className="truncate text-link text-fg-heading">{m.name}</p>
                        <p className="truncate text-fg-muted">{m.uploaded}</p>
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Recent Activity" />
                <CardBody className="flex flex-col gap-3">
                  {d.activity.map((a) => (
                    <div key={a.title} className="border-l-2 border-nav-active-student pl-3">
                      <p className="text-link text-fg-heading">{a.title}</p>
                      <p className="text-fg-muted">{a.meta}</p>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </aside>
          </div>
        </div>
      )}
    </QueryState>
  )
}
