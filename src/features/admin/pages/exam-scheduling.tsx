import { Sparkles } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/patterns/badge'
import { Card, CardHeader } from '@/components/patterns/card'
import { DataTable } from '@/components/patterns/data-table'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useExamScheduling } from '../api'

const TONE: Record<string, BadgeTone> = {
  CONFIRMED: 'success',
  PENDING: 'warning',
  UNASSIGNED: 'danger',
}

/**
 * ERP Exam Scheduling & Timetable Matrix — Figma 7:16290.
 * Wide and dense: the table scrolls inside its own container so the page
 * never scrolls horizontally.
 */
export function ExamScheduling() {
  const query = useExamScheduling()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Exam Scheduling" subtitle="Halls, proctors, and conflicts." />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {d.metrics.map((m) => (
              <MetricCard key={m.label} label={m.label} value={m.value} tone={m.tone} />
            ))}
          </div>

          <Card>
            <CardHeader title="Timetable Matrix" />
            <DataTable
              rows={d.slots}
              getRowKey={(r) => r.code}
              empty={{ title: 'Nothing scheduled yet' }}
              columns={[
                { key: 'code', header: 'Code', cell: (r) => r.code },
                { key: 'name', header: 'Course', cell: (r) => <span className="text-fg-heading">{r.name}</span> },
                { key: 'hall', header: 'Hall', cell: (r) => r.hall },
                { key: 'proctor', header: 'Proctor', cell: (r) => r.proctor },
                { key: 'state', header: 'Status', cell: (r) => <Badge tone={TONE[r.state]}>{r.state}</Badge> },
              ]}
            />
          </Card>

          <div className="rounded-card border border-accent-600/20 bg-accent-600/5 p-4">
            <p className="mb-1 flex items-center gap-2 text-link text-accent-600">
              <Sparkles className="size-4" aria-hidden />
              Need scheduling help?
            </p>
            <p className="text-fg-body">{d.aiNote}</p>
          </div>
        </div>
      )}
    </QueryState>
  )
}
