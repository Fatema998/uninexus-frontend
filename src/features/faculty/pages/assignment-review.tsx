import { useState } from 'react'
import { useParams } from 'react-router'
import { Paperclip } from 'lucide-react'
import { Badge } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { QueryState } from '@/components/states'
import { ApiError } from '@/hooks/use-api'
import { dateTime, fileSize, gpa } from '@/lib/format'
import { useGradeSubmission, useSubmissionDetail } from '../api'

/**
 * Faculty Assignment Review — Figma 1:4053.
 *
 * Never optimistic — this is a transcript entry. The rubric totals live but
 * nothing is written until the server confirms, and every criterion must be
 * scored: a partial rubric is rejected server-side because a missing mark
 * would silently keep whatever an earlier pass left behind.
 */
export function AssignmentReview() {
  const { id = '' } = useParams()
  const query = useSubmissionDetail(id)
  const grade = useGradeSubmission(id)

  const [scores, setScores] = useState<Record<string, string>>({})
  const [feedback, setFeedback] = useState('')
  const [release, setRelease] = useState(false)

  const error = grade.error instanceof ApiError ? grade.error : null

  return (
    <QueryState query={query}>
      {(d) => {
        const valueOf = (criterionId: string) =>
          scores[criterionId] ?? String(d.scores.find((s) => s.criterionId === criterionId)?.points ?? '')

        const total = d.rubric.reduce((sum, r) => sum + (Number(valueOf(r.id)) || 0), 0)
        const maxTotal = d.rubric.reduce((sum, r) => sum + r.maxPoints, 0)
        const overMax = d.rubric.some((r) => (Number(valueOf(r.id)) || 0) > r.maxPoints)
        const complete = d.rubric.every((r) => valueOf(r.id) !== '')

        function save() {
          grade.mutate({
            scores: d.rubric.map((r) => ({ criterionId: r.id, points: Number(valueOf(r.id)) })),
            feedback,
            release,
          })
        }

        return (
          <div className="flex flex-col gap-6">
            <PageHeader
              title={d.assignment.title}
              subtitle={`${d.student.fullName} • ${d.student.registrationNo}`}
            />

            <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
              <div className="flex flex-col gap-6">
                <Card>
                  <CardHeader title="Submission">
                    {d.late && <Badge tone="warning">LATE</Badge>}
                  </CardHeader>
                  <CardBody className="flex flex-col gap-4">
                    <p className="text-fg-muted">
                      {d.submittedAt ? `Submitted ${dateTime(d.submittedAt)}` : 'Not submitted'}
                    </p>

                    {d.comment && <p className="text-fg-body">{d.comment}</p>}

                    {d.body && (
                      <pre className="overflow-x-auto rounded-control bg-surface-subtle p-4 text-fg-body">
                        <code>{d.body}</code>
                      </pre>
                    )}

                    {d.attachments.map((a) => (
                      <a
                        key={a.id}
                        href={a.url}
                        download
                        className="flex items-center gap-3 rounded-control border border-border-strong bg-surface p-3 hover:bg-surface-subtle"
                      >
                        <Paperclip className="size-4.5 shrink-0 text-fg-muted" aria-hidden />
                        <span className="min-w-0">
                          <span className="block truncate text-link text-brand-700">
                            {a.filename}
                          </span>
                          <span className="block text-fg-muted">{fileSize(a.sizeBytes)}</span>
                        </span>
                      </a>
                    ))}
                  </CardBody>
                </Card>
              </div>

              <aside className="flex flex-col gap-6">
                <Card>
                  <CardHeader title="Student" />
                  <CardBody className="flex flex-col gap-2">
                    <div className="flex justify-between gap-3">
                      <span className="text-fg-muted">CGPA</span>
                      <span className="text-link text-fg-heading">
                        {d.student.cgpa === null ? '—' : gpa(d.student.cgpa)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-fg-muted">Late Submissions</span>
                      <span className="text-link text-fg-heading">{d.student.lateSubmissions}</span>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader title="Grading Rubric" />
                  <CardBody className="flex flex-col gap-3">
                    {d.rubric.map((r) => (
                      <label key={r.id} className="flex items-center gap-3">
                        <span className="flex-1 text-fg-body">{r.label}</span>
                        <Input
                          type="number"
                          min={0}
                          max={r.maxPoints}
                          value={valueOf(r.id)}
                          onChange={(e) => setScores((prev) => ({ ...prev, [r.id]: e.target.value }))}
                          className="h-9 w-20"
                          aria-label={`${r.label} score out of ${r.maxPoints}`}
                        />
                        <span className="w-10 shrink-0 text-fg-muted">/ {r.maxPoints}</span>
                      </label>
                    ))}

                    <div className="mt-2 flex items-baseline justify-between border-t border-border pt-3">
                      <span className="text-eyebrow uppercase text-fg-muted">Total</span>
                      <span
                        className={overMax ? 'text-link text-danger' : 'text-link text-fg-heading'}
                      >
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
                      <Textarea
                        rows={4}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Write feedback for the student…"
                      />
                    </label>

                    {/* Unreleased grades are invisible to the student — this is
                        what makes a moderation pass possible. */}
                    <label className="flex items-start gap-3">
                      <Checkbox
                        checked={release}
                        onCheckedChange={(v) => setRelease(v === true)}
                        className="mt-1 shrink-0"
                      />
                      <span className="text-fg-muted">
                        Release to the student now. Leave unchecked to save provisionally.
                      </span>
                    </label>

                    {grade.isError && (
                      <p role="alert" className="text-danger">
                        {error?.fieldError('scores') ?? error?.detail ?? 'Could not save the grade.'}
                      </p>
                    )}

                    {grade.isSuccess ? (
                      <p role="status" className="text-success">
                        Saved — {grade.data.totalScore}/{maxTotal} ({grade.data.grade}),{' '}
                        {grade.data.released ? 'released to the student' : 'held as provisional'}.
                      </p>
                    ) : (
                      <Button
                        disabled={!complete || overMax || grade.isPending}
                        onClick={save}
                        className="h-11 text-body"
                      >
                        {grade.isPending ? 'Saving…' : 'Save grade'}
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
