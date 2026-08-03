import { Card, CardHeader } from '@/components/patterns/card'
import { DataTable } from '@/components/patterns/data-table'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useAdminAcademic } from '../api'

/** ERP Academic Management — Figma 7:13082. */
export function AcademicManagement() {
  const query = useAdminAcademic()

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
              getRowKey={(r) => r.department.id}
              empty={{ title: 'No departments configured' }}
              columns={[
                {
                  key: 'name',
                  header: 'Department',
                  cell: (r) => (
                    <span className="text-fg-heading">
                      {r.department.name} <span className="text-fg-muted">({r.department.code})</span>
                    </span>
                  ),
                },
                { key: 'head', header: 'Head', cell: (r) => r.headName ?? '—' },
                { key: 'programs', header: 'Programmes', cell: (r) => r.programmeCount },
                { key: 'faculty', header: 'Faculty', cell: (r) => r.facultyCount },
                { key: 'students', header: 'Students', cell: (r) => r.studentCount.toLocaleString(), className: 'text-right' },
              ]}
            />
          </Card>
        </div>
      )}
    </QueryState>
  )
}
