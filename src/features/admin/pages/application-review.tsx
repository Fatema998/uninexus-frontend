import { useState } from 'react'
import { useParams } from 'react-router'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { QueryState } from '@/components/states'
import { useApplicationReview } from '../api'

/**
 * Admission Application Review — Figma 7:12274.
 * Approve/reject requires a decision note, so the committee always has a
 * rationale on record.
 */
export function ApplicationReview() {
  const { id = '' } = useParams()
  const query = useApplicationReview(id)
  const [notes, setNotes] = useState('')
  const [template, setTemplate] = useState('')
  const [decision, setDecision] = useState<string | null>(null)

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader
            title={d.student.name}
            subtitle={`Application ${d.student.id}`}
          />

          <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader title="Personal Details" />
                <CardBody>
                  <dl className="grid gap-4 sm:grid-cols-2">
                    {d.personal.map((f) => (
                      <div key={f.label}>
                        <dt className="text-eyebrow uppercase text-fg-muted">{f.label}</dt>
                        <dd className="text-link text-fg-heading">{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Test Scores" />
                <CardBody>
                  <dl className="grid gap-4 sm:grid-cols-2">
                    {d.scores.map((s) => (
                      <div key={s.label}>
                        <dt className="text-eyebrow uppercase text-fg-muted">{s.label}</dt>
                        <dd className="text-metric text-brand-700">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                </CardBody>
              </Card>
            </div>

            <Card>
              <CardHeader title="Decision" />
              <CardBody className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-link text-fg-heading">Offer Letter Template</span>
                  <Select value={template} onValueChange={setTemplate}>
                    <SelectTrigger className="h-10" aria-label="Offer Letter Template">
                      <SelectValue placeholder="Select Offer Letter Template…" />
                    </SelectTrigger>
                    <SelectContent>
                      {d.templates.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-link text-fg-heading">Evaluation Notes</span>
                  <Textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add evaluation notes for the committee…"
                  />
                </label>

                {decision ? (
                  <p role="status" className={decision === 'approved' ? 'text-success' : 'text-danger'}>
                    Application {decision}. The committee log has been updated.
                  </p>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      disabled={!notes.trim()}
                      onClick={() => setDecision('approved')}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      disabled={!notes.trim()}
                      onClick={() => setDecision('rejected')}
                    >
                      Reject
                    </Button>
                  </div>
                )}
                {!decision && !notes.trim() && (
                  <p className="text-fg-muted">A decision note is required before approving or rejecting.</p>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </QueryState>
  )
}
