import { Sparkles } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { DataTable } from '@/components/patterns/data-table'
import { PageHeader } from '@/components/patterns/page-header'
import { ProgressBar } from '@/components/patterns/progress-bar'
import { QueryState } from '@/components/states'
import { useGradebook } from '../api'
import { gpa, percent } from '@/lib/format'

/** LMS Gradebook — Figma 6:7427. */
export function Gradebook() {
  const query = useGradebook()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Gradebook" subtitle="Grades across every course this programme." />

          <Card>
            <CardHeader title="Graduation Requirements" />
            <CardBody>
              <ProgressBar value={d.completionPercent} label="Graduation requirements met" />
              <p className="mt-2 text-fg-muted">
                {percent(d.completionPercent)} of graduation requirements met
              </p>
            </CardBody>
          </Card>

          {d.insight && (
            <div className="rounded-card border border-accent-600/20 bg-accent-600/5 p-4">
              <p className="mb-1 flex items-center gap-2 text-link text-accent-600">
                <Sparkles className="size-4" aria-hidden />
                {d.insight.title}
              </p>
              <p className="text-fg-body">{d.insight.body}</p>
            </div>
          )}

          <Card>
            <CardHeader title="Grades" />
            <DataTable
              rows={d.rows}
              getRowKey={(r) => r.course.id}
              empty={{ title: 'No grades published yet' }}
              columns={[
                { key: 'code', header: 'Code', cell: (r) => r.course.code },
                { key: 'name', header: 'Course', cell: (r) => <span className="text-fg-heading">{r.course.title}</span> },
                { key: 'credits', header: 'Credits', cell: (r) => r.course.credits },
                { key: 'grade', header: 'Grade', cell: (r) => <span className="text-link text-brand-700">{r.grade ?? '—'}</span> },
                { key: 'points', header: 'Points', cell: (r) => (r.points === null ? '—' : gpa(r.points)) },
              ]}
            />
          </Card>
        </div>
      )}
    </QueryState>
  )
}
