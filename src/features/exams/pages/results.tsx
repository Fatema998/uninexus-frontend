import { Sparkles } from 'lucide-react'
import { Card, CardHeader } from '@/components/patterns/card'
import { DataTable } from '@/components/patterns/data-table'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useExamResults } from '../api'

/** Exam Results — Figma 1:12105. */
export function ExamResults() {
  const query = useExamResults()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Exam Results" subtitle="Your published results this semester." />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {d.metrics.map((m) => (
              <MetricCard key={m.label} label={m.label} value={m.value} tone={m.tone} />
            ))}
          </div>

          <Card>
            <CardHeader title="Results" />
            <DataTable
              rows={d.rows}
              getRowKey={(r) => r.code}
              empty={{ title: 'No results published yet' }}
              columns={[
                { key: 'code', header: 'Code', cell: (r) => r.code },
                { key: 'name', header: 'Course', cell: (r) => <span className="text-fg-heading">{r.name}</span> },
                { key: 'category', header: 'Category', cell: (r) => r.category },
                { key: 'grade', header: 'Grade', cell: (r) => <span className="text-link text-brand-700">{r.grade}</span> },
                { key: 'points', header: 'Points', cell: (r) => r.points },
              ]}
            />
          </Card>

          <div className="rounded-card border border-accent-600/20 bg-accent-600/5 p-4">
            <p className="mb-1 flex items-center gap-2 text-link text-accent-600">
              <Sparkles className="size-4" aria-hidden />
              Predicted GPA (Final Year): {d.predictedGpa}
            </p>
            <p className="text-fg-body">{d.insight}</p>
          </div>
        </div>
      )}
    </QueryState>
  )
}
