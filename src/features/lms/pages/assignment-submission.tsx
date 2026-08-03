import { useState } from 'react'
import { useParams } from 'react-router'
import { CheckCircle2, Upload, X } from 'lucide-react'
import { AssistantPanel } from '@/components/patterns/assistant-panel'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { QueryState } from '@/components/states'
import { useAssignmentDetail } from '../api'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'

/** LMS Assignment Submission — Figma 6:3292. */
export function AssignmentSubmission() {
  const { id = '' } = useParams()
  const query = useAssignmentDetail(id)
  const [files, setFiles] = useState<string[]>([])
  const [agreed, setAgreed] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title={d.title} subtitle={`${d.course} • Due ${d.due}`} />

          <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader title="Brief" />
                <CardBody>
                  <p className="text-fg-body">{d.brief}</p>
                  <ul className="mt-3 flex flex-col gap-2">
                    {d.requirements.map((r) => (
                      <li key={r} className="flex gap-2 text-fg-body">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                        {r}
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Submit Assignment" />
                <CardBody className="flex flex-col gap-4">
                  <label className="flex cursor-pointer flex-col items-center gap-2 rounded-control border-2 border-dashed border-sidebar-line p-8 text-center hover:bg-surface-subtle">
                    <Upload className="size-5 text-fg-muted" aria-hidden />
                    <span className="text-link text-fg-heading">Choose files to upload</span>
                    <span className="text-fg-muted">PDF, DOCX, or ZIP up to 25 MB</span>
                    <input
                      type="file"
                      multiple
                      className="sr-only"
                      onChange={(e) =>
                        setFiles(Array.from(e.target.files ?? []).map((f) => f.name))
                      }
                    />
                  </label>

                  {files.length > 0 && (
                    <ul className="flex flex-col gap-2">
                      {files.map((f) => (
                        <li
                          key={f}
                          className="flex items-center justify-between gap-3 rounded-control bg-surface-subtle p-3"
                        >
                          <span className="min-w-0 truncate text-fg-body">{f}</span>
                          <button
                            type="button"
                            aria-label={`Remove ${f}`}
                            onClick={() => setFiles((prev) => prev.filter((x) => x !== f))}
                            className="shrink-0 text-fg-muted hover:text-danger"
                          >
                            <X className="size-4" aria-hidden />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <label className="flex flex-col gap-1.5">
                    <span className="text-link text-fg-heading">Additional Notes (Optional)</span>
                    <Textarea
                      rows={3}
                      placeholder="Write any comments for the instructor here…"
                      className="w-full rounded-control border border-border-strong bg-surface p-3 outline-none focus-visible:border-brand-600"
                    />
                  </label>

                  <label className="flex items-start gap-3">
                    <Checkbox
                      checked={agreed}
                      onCheckedChange={(v) => setAgreed(v === true)}
                      className="mt-1 shrink-0"
                    />
                    <span className="text-fg-muted">{d.integrityNote}</span>
                  </label>

                  {submitted ? (
                    <p role="status" className="flex items-center gap-2 text-success">
                      <CheckCircle2 className="size-4" aria-hidden />
                      Submitted. You can resubmit until the deadline.
                    </p>
                  ) : (
                    <Button
                      disabled={files.length === 0 || !agreed}
                      onClick={() => setSubmitted(true)}
                      className="h-11 w-full text-body"
                    >
                      Submit assignment
                    </Button>
                  )}
                </CardBody>
              </Card>
            </div>

            <AssistantPanel {...d.assistant} />
          </div>
        </div>
      )}
    </QueryState>
  )
}
