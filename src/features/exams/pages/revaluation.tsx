import { useState } from 'react'
import { Badge, type BadgeTone } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EmptyState, QueryState } from '@/components/states'
import { ApiError } from '@/hooks/use-api'
import { date, money, relative } from '@/lib/format'
import { useRequestRevaluation, useRevaluation } from '../api'
import type { RevaluationStatus } from '@/types'

const STATUS_TONE: Record<RevaluationStatus, BadgeTone> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  COMPLETED: 'info',
}

const MIN_REASON = 20

/** Exam Revaluation — Figma 1:13158. */
export function Revaluation() {
  const query = useRevaluation()
  const submit = useRequestRevaluation()

  const [courseId, setCourseId] = useState('')
  const [examTypeId, setExamTypeId] = useState('')
  const [reviewTypeId, setReviewTypeId] = useState('')
  const [reason, setReason] = useState('')

  // Server-side field errors, keyed as DRF returns them.
  const fieldErrors = submit.error instanceof ApiError ? submit.error : null

  function onSubmit() {
    submit.mutate(
      { courseId, examTypeId, reviewTypeId, reason },
      {
        onSuccess: () => {
          setCourseId('')
          setExamTypeId('')
          setReviewTypeId('')
          setReason('')
        },
      },
    )
  }

  return (
    <QueryState query={query}>
      {(d) => {
        const ready = courseId && examTypeId && reviewTypeId && reason.trim().length >= MIN_REASON
        const closed = d.eligibleCourses.length === 0

        return (
          <div className="flex flex-col gap-6">
            <PageHeader
              title="Exam Revaluation"
              subtitle={
                d.windowClosesAt
                  ? `Appeal window closes ${relative(d.windowClosesAt)}.`
                  : 'Request a review of a published result.'
              }
            />

            <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
              <Card>
                <CardHeader title="New Request" />
                <CardBody className="flex flex-col gap-4">
                  {closed ? (
                    <EmptyState
                      title="Nothing is appealable right now"
                      description="No published result is inside its revaluation window."
                    />
                  ) : (
                    <>
                      <label className="flex flex-col gap-1.5">
                        <span className="text-link text-fg-heading">Course</span>
                        <Select value={courseId} onValueChange={setCourseId}>
                          <SelectTrigger className="h-10" aria-label="Course">
                            <SelectValue placeholder="Choose a course for revaluation" />
                          </SelectTrigger>
                          <SelectContent>
                            {d.eligibleCourses.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.code} — {c.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldError message={fieldErrors?.fieldError('courseId')} />
                      </label>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="flex flex-col gap-1.5">
                          <span className="text-link text-fg-heading">Exam Type</span>
                          <Select value={examTypeId} onValueChange={setExamTypeId}>
                            <SelectTrigger className="h-10" aria-label="Exam Type">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {d.examTypes.map((x) => (
                                <SelectItem key={x.id} value={x.id}>
                                  {x.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FieldError message={fieldErrors?.fieldError('examTypeId')} />
                        </label>

                        <label className="flex flex-col gap-1.5">
                          <span className="text-link text-fg-heading">Review Type</span>
                          <Select value={reviewTypeId} onValueChange={setReviewTypeId}>
                            <SelectTrigger className="h-10" aria-label="Review Type">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {d.reviewTypes.map((x) => (
                                <SelectItem key={x.id} value={x.id}>
                                  {x.label} — {money(x.fee)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FieldError message={fieldErrors?.fieldError('reviewTypeId')} />
                        </label>
                      </div>

                      <label className="flex flex-col gap-1.5">
                        <span className="text-link text-fg-heading">Reason for Revaluation</span>
                        <Textarea
                          rows={4}
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Briefly describe the grounds for your request…"
                        />
                        <span className="text-fg-muted">
                          {reason.trim().length < MIN_REASON
                            ? `At least ${MIN_REASON} characters (${reason.trim().length}/${MIN_REASON}).`
                            : 'Looks good.'}
                        </span>
                        <FieldError message={fieldErrors?.fieldError('reason')} />
                      </label>

                      {/* Non-field failures — a 409 or a 5xx, not a bad input. */}
                      {submit.isError && !fieldErrors?.problem.errors?.length && (
                        <p role="alert" className="text-danger">
                          {fieldErrors?.detail ?? 'Could not submit the request. Try again.'}
                        </p>
                      )}

                      <Button
                        disabled={!ready || submit.isPending}
                        onClick={onSubmit}
                        className="h-11 text-body"
                      >
                        {submit.isPending ? 'Submitting…' : 'Submit request'}
                      </Button>
                    </>
                  )}
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="My Requests" />
                <CardBody className="flex flex-col gap-3">
                  {d.requests.length === 0 ? (
                    <EmptyState title="No requests yet" />
                  ) : (
                    d.requests.map((r) => (
                      <div
                        key={r.id}
                        // The optimistic row is dimmed until the server confirms it.
                        className={`flex items-center justify-between gap-3 rounded-control border border-border-strong bg-surface p-3 ${
                          r.id.startsWith('tmp-') ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-link text-fg-heading">{r.course.code}</p>
                          <p className="truncate text-fg-muted">
                            {r.reviewType} • {date(r.submittedAt)}
                          </p>
                        </div>
                        <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
                      </div>
                    ))
                  )}
                </CardBody>
              </Card>
            </div>
          </div>
        )
      }}
    </QueryState>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <span role="alert" className="text-danger">
      {message}
    </span>
  )
}
