import { useState } from 'react'
import { useParams } from 'react-router'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { QueryState } from '@/components/states'
import { useAssignmentReview } from '../api'

/**
 * Faculty Assignment Review — Figma 1:4053.
 * The rubric totals live-update and the submit is blocked until every
 * criterion is scored within its maximum.
 */
export function AssignmentReview() {
  const { id = '' } = useParams()
  const query = useAssignmentReview(id)
  const [scores, setScores] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)

  return (
    <QueryState query={query}>
      {(d) => {
        const total = d.rubric.reduce((sum, r) => sum + (Number(scores[r.label]) || 0), 0)
        const maxTotal = d.rubric.reduce((sum, r) => sum + r.max, 0)
        const overMax = d.rubric.some((r) => (Number(scores[r.label]) || 0) > r.max)
        const complete = d.rubric.every((r) => scores[r.label] !== undefined && scores[r.label] !== '')

        return (
          <div className="flex flex-col gap-6">
            <PageHeader
              title={d.assignment}
              subtitle={`${d.student.name} • ID: ${d.student.id}`}
            />

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {d.metrics.map((m) => (
                <MetricCard key={m.label} label={m.label} value={m.value} tone={m.tone} />
              ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
              <Card>
                <CardHeader title="Submission" />
                <CardBody>
                  <pre className="overflow-x-auto rounded-control bg-surface-subtle p-4 text-fg-body">
                    <code>{d.code}</code>
                  </pre>
                </CardBody>
              </Card>

              <aside className="flex flex-col gap-6">
                <Card>
                  <CardHeader title="Student" />
                  <CardBody className="flex flex-col gap-2">
                    <div className="flex justify-between gap-3">
                      <span className="text-fg-muted">Previous GPA</span>
                      <span className="text-link text-fg-heading">{d.student.gpa}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-fg-muted">Late Submissions</span>
                      <span className="text-link text-fg-heading">{d.student.late}</span>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader title="Grading Rubric" />
                  <CardBody className="flex flex-col gap-3">
                    {d.rubric.map((r) => (
                      <label key={r.label} className="flex items-center gap-3">
                        <span className="flex-1 text-fg-body">{r.label}</span>
                        <Input
                          type="number"
                          min={0}
                          max={r.max}
                          value={scores[r.label] ?? ''}
                          onChange={(e) =>
                            setScores((prev) => ({ ...prev, [r.label]: e.target.value }))
                          }
                          className="h-9 w-20"
                          aria-label={`${r.label} score out of ${r.max}`}
                        />
                        <span className="w-10 shrink-0 text-fg-muted">/ {r.max}</span>
                      </label>
                    ))}

                    <div className="mt-2 flex items-baseline justify-between border-t border-border pt-3">
                      <span className="text-eyebrow uppercase text-fg-muted">Total</span>
                      <span className={overMax ? 'text-link text-danger' : 'text-link text-fg-heading'}>
                        {total} / {maxTotal}
                      </span>
                    </div>

                    {overMax && (
                      <p role="alert" className="text-danger">
                        A criterion exceeds its maximum.
                      </p>
                    )}

                    <label className="mt-2 flex flex-col gap-1.5">
                      <span className="text-link text-fg-heading">Feedback & Comments</span>
                      <Textarea rows={4} placeholder="Write feedback for the student…" />
                    </label>

                    {saved ? (
                      <p role="status" className="text-success">Grade saved.</p>
                    ) : (
                      <Button
                        disabled={!complete || overMax}
                        onClick={() => setSaved(true)}
                        className="h-11 text-body"
                      >
                        Save grade
                      </Button>
                    )}
                  </CardBody>
                </Card>
              </aside>
            </div>
          </div>
        )
      }}
    </QueryState>
  )
}
