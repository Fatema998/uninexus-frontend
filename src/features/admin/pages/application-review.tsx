import { useState } from 'react'
import { useParams } from 'react-router'
import { CheckCircle2, FileText, XCircle } from 'lucide-react'
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
import { ApiError } from '@/hooks/use-api'
import { date, dateTime, relative } from '@/lib/format'
import { useApplicationDetail, useDecideApplication } from '../api'
import type { ApplicationStatus, DecideApplicationRequest } from '@/types/admin'

const TONE: Record<ApplicationStatus, BadgeTone> = {
  PENDING: 'warning',
  IN_REVIEW: 'info',
  APPROVED: 'success',
  REJECTED: 'danger',
  WAITLISTED: 'neutral',
}

type Decision = DecideApplicationRequest['status']

/**
 * ERP Application Review Workspace — Figma 7:12274.
 *
 * A decision sends an offer or rejection letter, so it is never optimistic
 * and never repeatable: the server returns 409 on an already-decided
 * application rather than overwriting. See docs/api/admin.md §3.3.
 */
export function ApplicationReview() {
  const { id = '' } = useParams()
  const query = useApplicationDetail(id)
  const decide = useDecideApplication(id)

  const [decision, setDecision] = useState<Decision | ''>('')
  const [templateId, setTemplateId] = useState('')
  const [note, setNote] = useState('')

  const error = decide.error instanceof ApiError ? decide.error : null

  return (
    <QueryState query={query}>
      {(d) => {
        const decided = d.status === 'APPROVED' || d.status === 'REJECTED'
        // A template is required for an approval and forbidden otherwise.
        const needsTemplate = decision === 'APPROVED'
        const ready = decision && (!needsTemplate || templateId) && note.trim().length >= 10

        return (
          <div className="flex flex-col gap-6">
            <PageHeader
              title={d.applicantName}
              subtitle={`${d.reference} • ${d.programme.name} • ${d.programme.school}`}
              action={<Badge tone={TONE[d.status]}>{d.status.replace('_', ' ')}</Badge>}
            />

            <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
              <div className="flex flex-col gap-6">
                <Card>
                  <CardHeader title="Personal Details" />
                  <CardBody>
                    <dl className="grid gap-4 sm:grid-cols-2">
                      <Field label="Date of Birth" value={date(d.personal.dateOfBirth)} />
                      <Field label="Nationality" value={d.personal.nationality} />
                      <Field label="Primary Contact" value={d.personal.email} />
                      <Field label="Phone" value={d.personal.phone} />
                    </dl>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader title="Scores" />
                  <CardBody>
                    <dl className="grid gap-4 sm:grid-cols-3">
                      {d.scores.map((s) => (
                        <Field key={s.id} label={s.label} value={s.value} />
                      ))}
                    </dl>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader title="Documents" />
                  <CardBody className="flex flex-col gap-3">
                    {d.documents.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 rounded-control border border-border-strong bg-surface p-3 hover:bg-surface-subtle"
                      >
                        <FileText className="size-4.5 shrink-0 text-fg-muted" aria-hidden />
                        <span className="min-w-0 flex-1 truncate text-link text-brand-700">
                          {doc.label}
                        </span>
                        {doc.verified ? (
                          <Badge tone="success">VERIFIED</Badge>
                        ) : (
                          <Badge tone="warning">UNVERIFIED</Badge>
                        )}
                      </a>
                    ))}
                  </CardBody>
                </Card>
              </div>

              <aside>
                <Card className="xl:sticky xl:top-24">
                  <CardHeader title="Decision" />
                  <CardBody className="flex flex-col gap-4">
                    {/* Decided applications are read-only here. Reversing one
                        is a separate, audited workflow. */}
                    {decided || decide.isSuccess ? (
                      <div className="flex flex-col gap-2">
                        <p className="flex items-center gap-2 text-link text-fg-heading">
                          {d.status === 'REJECTED' ? (
                            <XCircle className="size-4 text-danger" aria-hidden />
                          ) : (
                            <CheckCircle2 className="size-4 text-success" aria-hidden />
                          )}
                          {decide.data
                            ? `${decide.data.application.status} — letter ${decide.data.notificationQueued ? 'queued' : 'not sent'}`
                            : d.status}
                        </p>
                        {d.decision && (
                          <p className="text-fg-muted">
                            {d.decision.by} • {dateTime(d.decision.at)}
                          </p>
                        )}
                        {d.decision?.note && <p className="text-fg-body">{d.decision.note}</p>}
                        {decide.data && (
                          <p className="text-fg-muted">
                            Recorded {relative(decide.data.audit.at)} by{' '}
                            {decide.data.audit.actorName}.
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        <label className="flex flex-col gap-1.5">
                          <span className="text-link text-fg-heading">Outcome</span>
                          <Select
                            value={decision}
                            onValueChange={(v) => {
                              setDecision(v as Decision)
                              if (v !== 'APPROVED') setTemplateId('')
                            }}
                          >
                            <SelectTrigger className="h-10" aria-label="Outcome">
                              <SelectValue placeholder="Choose an outcome" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="APPROVED">Approve</SelectItem>
                              <SelectItem value="WAITLISTED">Waitlist</SelectItem>
                              <SelectItem value="REJECTED">Reject</SelectItem>
                            </SelectContent>
                          </Select>
                        </label>

                        {needsTemplate && (
                          <label className="flex flex-col gap-1.5">
                            <span className="text-link text-fg-heading">Offer letter</span>
                            <Select value={templateId} onValueChange={setTemplateId}>
                              <SelectTrigger className="h-10" aria-label="Offer letter template">
                                <SelectValue placeholder="Choose a template" />
                              </SelectTrigger>
                              <SelectContent>
                                {d.templates.map((t) => (
                                  <SelectItem key={t.id} value={t.id}>
                                    {t.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </label>
                        )}

                        <label className="flex flex-col gap-1.5">
                          <span className="text-link text-fg-heading">Note (recorded)</span>
                          <Textarea
                            rows={3}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Grounds for this decision…"
                          />
                        </label>

                        {decide.isError && (
                          <p role="alert" className="text-danger">
                            {error?.fieldError('templateId') ?? error?.detail ?? 'Could not record the decision.'}
                          </p>
                        )}

                        <p className="text-fg-muted">
                          This sends the applicant a letter. It cannot be undone here.
                        </p>

                        <Button
                          disabled={!ready || decide.isPending}
                          onClick={() =>
                            decide.mutate({
                              status: decision as Decision,
                              templateId: needsTemplate ? templateId : null,
                              note,
                            })
                          }
                          className="h-11 text-body"
                        >
                          {decide.isPending ? 'Recording…' : 'Record decision'}
                        </Button>
                      </>
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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-eyebrow uppercase text-fg-muted">{label}</dt>
      <dd className="text-link text-fg-heading">{value}</dd>
    </div>
  )
}
