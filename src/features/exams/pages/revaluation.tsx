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
import { QueryState } from '@/components/states'
import { useRevaluation } from '../api'

const STATUS_TONE: Record<string, BadgeTone> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
}

/** Exam Revaluation — Figma 1:13158. */
export function Revaluation() {
  const query = useRevaluation()
  const [course, setCourse] = useState('')
  const [examType, setExamType] = useState('')
  const [reviewType, setReviewType] = useState('')
  const [reason, setReason] = useState('')
  const [sent, setSent] = useState(false)

  return (
    <QueryState query={query}>
      {(d) => {
        const ready = course && examType && reviewType && reason.trim().length >= 20

        return (
          <div className="flex flex-col gap-6">
            <PageHeader title="Exam Revaluation" subtitle="Request a review of a published result." />

            <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
              <Card>
                <CardHeader title="New Request" />
                <CardBody className="flex flex-col gap-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-link text-fg-heading">Course</span>
                    <Select value={course} onValueChange={setCourse}>
                      <SelectTrigger className="h-10" aria-label="Course">
                        <SelectValue placeholder="Choose a course for revaluation" />
                      </SelectTrigger>
                      <SelectContent>
                        {d.courses.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.code} — {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-link text-fg-heading">Exam Type</span>
                      <Select value={examType} onValueChange={setExamType}>
                        <SelectTrigger className="h-10" aria-label="Exam Type">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {d.examTypes.map((x) => (
                            <SelectItem key={x} value={x}>{x}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>

                    <label className="flex flex-col gap-1.5">
                      <span className="text-link text-fg-heading">Review Type</span>
                      <Select value={reviewType} onValueChange={setReviewType}>
                        <SelectTrigger className="h-10" aria-label="Review Type">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {d.reviewTypes.map((x) => (
                            <SelectItem key={x} value={x}>{x}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      {reason.trim().length < 20
                        ? `At least 20 characters (${reason.trim().length}/20).`
                        : 'Looks good.'}
                    </span>
                  </label>

                  {sent ? (
                    <p role="status" className="text-success">
                      Request submitted. You will be notified once it is reviewed.
                    </p>
                  ) : (
                    <Button disabled={!ready} onClick={() => setSent(true)} className="h-11 text-body">
                      Submit request
                    </Button>
                  )}
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="My Requests" />
                <CardBody className="flex flex-col gap-3">
                  {d.requests.map((r) => (
                    <div
                      key={r.code + r.date}
                      className="flex items-center justify-between gap-3 rounded-control border border-border-strong bg-surface p-3"
                    >
                      <div className="min-w-0">
                        <p className="text-link text-fg-heading">{r.code}</p>
                        <p className="truncate text-fg-muted">{r.type} • {r.date}</p>
                      </div>
                      <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </div>
          </div>
        )
      }}
    </QueryState>
  )
}
