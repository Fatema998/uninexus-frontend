import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useExamOverview } from '../api'

/** Examination Overview — Figma 1:8461. */
export function ExamOverview() {
  const query = useExamOverview()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Examination" subtitle="Your exams, results, and readiness." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {d.metrics.map((m) => (
              <MetricCard key={m.label} label={m.label} value={m.value} tone={m.tone} />
            ))}
          </div>
        </div>
      )}
    </QueryState>
  )
}
