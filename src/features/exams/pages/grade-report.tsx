import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { DataTable } from '@/components/patterns/data-table'
import { PageHeader } from '@/components/patterns/page-header'
import { ProgressBar } from '@/components/patterns/progress-bar'
import { QueryState } from '@/components/states'
import { gpa, percent } from '@/lib/format'
import { useGradeReport } from '../api'

/** Grade Report — Figma 1:11742. */
export function GradeReport() {
  const query = useGradeReport()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Grade Report" subtitle={`Cumulative GPA ${gpa(d.cgpa)}`} />

          <Card>
            <CardHeader title="Degree Completion" />
            <CardBody>
              <p className="text-metric text-brand-700">{percent(d.completionPercent)}</p>
              <ProgressBar value={d.completionPercent} label="Degree completion" className="mt-3" />
              <p className="mt-2 text-fg-muted">of the degree complete</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Term History" />
            <DataTable
              rows={d.terms}
              getRowKey={(r) => r.termId}
              empty={{ title: 'No terms completed yet' }}
              columns={[
                { key: 'term', header: 'Term', cell: (r) => <span className="text-fg-heading">{r.termName}</span> },
                { key: 'gpa', header: 'GPA', cell: (r) => <span className="text-link text-brand-700">{gpa(r.gpa)}</span> },
                { key: 'credits', header: 'Credits', cell: (r) => r.credits },
              ]}
            />
          </Card>
        </div>
      )}
    </QueryState>
  )
}
