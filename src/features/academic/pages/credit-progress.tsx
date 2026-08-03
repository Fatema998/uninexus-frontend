import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { DataTable } from '@/components/patterns/data-table'
import { PageHeader } from '@/components/patterns/page-header'
import { ProgressBar } from '@/components/patterns/progress-bar'
import { QueryState } from '@/components/states'
import { useCreditProgress } from '../api'
import { gpa } from '@/lib/format'

/** Credit Progress — Figma 6:8940. */
export function CreditProgress() {
  const query = useCreditProgress()

  return (
    <QueryState query={query}>
      {(d) => {
        const pct = Math.round((d.overall.earned / d.overall.required) * 100)

        return (
          <div className="flex flex-col gap-6">
            <PageHeader title="Credit Progress" subtitle="Credits earned against your degree requirement." />

            <Card>
              <CardHeader title="Overall Completion" />
              <CardBody>
                <p className="flex items-baseline gap-1">
                  <span className="text-metric text-brand-700">{d.overall.earned}</span>
                  <span className="text-unit text-fg-muted/40">/ {d.overall.required}</span>
                </p>
                <ProgressBar value={pct} label="Overall credit completion" className="mt-3" />
                <p className="mt-2 text-fg-muted">
                  {pct}% complete • {d.overall.required - d.overall.earned} credits remaining
                </p>
              </CardBody>
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
              {d.byCategory.map((c) => {
                const catPct = Math.round((c.earned / c.required) * 100)
                return (
                  <Card key={c.label}>
                    <CardBody>
                      <p className="text-eyebrow uppercase text-fg-muted">{c.label}</p>
                      <p className="mt-1 flex items-baseline gap-1">
                        <span className="text-metric text-fg-heading">{c.earned}</span>
                        <span className="text-unit text-fg-muted/40">/ {c.required}</span>
                      </p>
                      <ProgressBar
                        value={catPct}
                        tone={c.tone}
                        label={`${c.label} credits`}
                        className="mt-3"
                      />
                      {c.earned >= c.required && (
                        <p className="mt-2 text-fg-muted">Requirement met.</p>
                      )}
                    </CardBody>
                  </Card>
                )
              })}
            </div>

            <Card>
              <CardHeader title="Credits by Term" />
              <DataTable
                rows={d.perTerm}
                getRowKey={(r) => r.termId}
                empty={{ title: 'No completed terms yet' }}
                columns={[
                  { key: 'term', header: 'Term', cell: (r) => <span className="text-fg-heading">{r.termName}</span> },
                  { key: 'credits', header: 'Credits', cell: (r) => r.credits },
                  { key: 'gpa', header: 'GPA', cell: (r) => gpa(r.gpa) },
                ]}
              />
            </Card>
          </div>
        )
      }}
    </QueryState>
  )
}
