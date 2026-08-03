import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ConnectedAssistant } from '@/components/patterns/assistant-panel'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { QueryState } from '@/components/states'
import { ApiError } from '@/hooks/use-api'
import { date } from '@/lib/format'
import { useDropAdd, useSubmitDropAdd } from '../api'
import type { ApiErrorBody } from '@/types'

/** Drop/Add Course — Figma 6:10404. */
export function DropAdd() {
  const query = useDropAdd()
  const submit = useSubmitDropAdd()
  const [dropping, setDropping] = useState<string[]>([])

  const error = submit.error instanceof ApiError ? (submit.error.body as ApiErrorBody) : null

  return (
    <QueryState query={query}>
      {(d) => {
        const remaining = d.enrolled
          .filter((c) => !dropping.includes(c.offeringId))
          .reduce((sum, c) => sum + c.course.credits, 0)
        const belowMinimum = remaining < d.fullTimeMinimumCredits

        const toggle = (offeringId: string) =>
          setDropping((prev) =>
            prev.includes(offeringId)
              ? prev.filter((c) => c !== offeringId)
              : [...prev, offeringId],
          )

        function confirm() {
          // One request per drop. The server owns approval; the list refetches.
          for (const offeringId of dropping) {
            submit.mutate({ action: 'DROP', offeringId })
          }
          setDropping([])
        }

        return (
          <div className="flex flex-col gap-6">
            <PageHeader
              title="Drop / Add Course"
              subtitle={`Adjust your enrolment before ${date(d.dropDeadline)}.`}
            />

            <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
              <Card>
                <CardHeader title="Enrolled Courses" />
                <CardBody className="flex flex-col gap-3">
                  {d.enrolled.map((c) => {
                    const marked = dropping.includes(c.offeringId)
                    return (
                      <div
                        key={c.offeringId}
                        className={cn(
                          'flex flex-wrap items-center justify-between gap-3 rounded-control border p-4 transition-colors',
                          marked ? 'border-danger/40 bg-danger/5' : 'border-border-strong bg-surface',
                        )}
                      >
                        <div className="min-w-0">
                          <p
                            className={cn(
                              'text-link text-fg-heading',
                              marked && 'line-through decoration-danger',
                            )}
                          >
                            {c.course.title}
                          </p>
                          <p className="text-fg-muted">
                            {c.course.code} • {c.instructorName} • {c.course.credits} Credits
                          </p>
                        </div>
                        {/* The row stays when the deadline passes; the button dies. */}
                        <Button
                          variant={marked ? 'outline' : 'destructive'}
                          size="sm"
                          disabled={!c.canDrop}
                          title={c.canDrop ? undefined : 'The drop deadline for this course has passed.'}
                          onClick={() => toggle(c.offeringId)}
                        >
                          {marked ? 'Undo' : 'Drop'}
                        </Button>
                      </div>
                    )
                  })}
                </CardBody>
              </Card>

              <aside className="flex flex-col gap-6">
                <Card>
                  <CardHeader title="Academic Summary" />
                  <CardBody className="flex flex-col gap-2">
                    <Row label="Enrolled credits" value={`${d.enrolledCredits}`} />
                    <Row label="Full-time minimum" value={`${d.fullTimeMinimumCredits}`} />
                    <Row label="Drop deadline" value={date(d.dropDeadline)} />

                    <div className="mt-2 flex items-baseline justify-between border-t border-border pt-3">
                      <span className="text-eyebrow uppercase text-fg-muted">After changes</span>
                      <span
                        className={cn('text-link', belowMinimum ? 'text-danger' : 'text-success')}
                      >
                        {remaining} credits
                      </span>
                    </div>

                    {belowMinimum && (
                      <p role="alert" className="flex items-start gap-2 text-danger">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
                        Below the {d.fullTimeMinimumCredits}-credit full-time minimum. This may
                        affect your enrolment status.
                      </p>
                    )}

                    {error && (
                      <p role="alert" className="text-danger">
                        {error.detail ?? 'Could not apply the change.'}
                      </p>
                    )}

                    <Button
                      disabled={dropping.length === 0 || submit.isPending}
                      onClick={confirm}
                      className="mt-2 h-11 w-full text-body"
                    >
                      {submit.isPending
                        ? 'Applying…'
                        : `Confirm changes${dropping.length > 0 ? ` (${dropping.length})` : ''}`}
                    </Button>
                  </CardBody>
                </Card>

                <ConnectedAssistant context="academic.drop-add" />
              </aside>
            </div>
          </div>
        )
      }}
    </QueryState>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-fg-muted">{label}</span>
      <span className="text-link text-fg-heading">{value}</span>
    </div>
  )
}
