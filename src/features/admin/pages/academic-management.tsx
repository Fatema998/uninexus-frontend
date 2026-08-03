import { Card, CardHeader } from '@/components/patterns/card'
import { DataTable } from '@/components/patterns/data-table'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useAcademicManagement } from '../api'

/** ERP Academic Management — Figma 7:13082. */
export function AcademicManagement() {
  const query = useAcademicManagement()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Academic Management" subtitle="Departments, programmes, and courses." />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {d.metrics.map((m) => (
              <MetricCard key={m.label} label={m.label} value={m.value} tone={m.tone} />
            ))}
          </div>

          <Card>
            <CardHeader title="Departments" />
            <DataTable
              rows={d.departments}
              getRowKey={(r) => r.name}
              empty={{ title: 'No departments configured' }}
              columns={[
                { key: 'name', header: 'Department', cell: (r) => <span className="text-fg-heading">{r.name}</span> },
                { key: 'programs', header: 'Programmes', cell: (r) => r.programs },
                { key: 'faculty', header: 'Faculty', cell: (r) => r.faculty },
                { key: 'students', header: 'Students', cell: (r) => r.students.toLocaleString(), className: 'text-right' },
              ]}
            />
          </Card>
        </div>
      )}
    </QueryState>
  )
}
