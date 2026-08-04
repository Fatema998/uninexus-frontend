import { useState } from 'react'
import { useParams } from 'react-router'
import { CheckCircle2, Upload, X } from 'lucide-react'
import { ConnectedAssistant } from '@/components/patterns/assistant-panel'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { QueryState } from '@/components/states'
import { ApiError } from '@/hooks/use-api'
import { dateTime, fileSize } from '@/lib/format'
import { useAssignmentDetail, useSubmitAssignment } from '../api'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'

/**
 * LMS Assignment Submission — Figma 6:3292.
 *
 * Multipart upload, deliberately not optimistic: the transfer has real
 * duration, so a spinner is honest and a fake "Submitted" is not.
 * See docs/api/student.md §6.2.
 */
export function AssignmentSubmission() {
  const { id = '' } = useParams()
  const query = useAssignmentDetail(id)
  const submit = useSubmitAssignment(id)

  const [files, setFiles] = useState<File[]>([])
  const [comment, setComment] = useState('')
  const [agreed, setAgreed] = useState(false)

  const errors = submit.error instanceof ApiError ? submit.error : null

  return (
    <QueryState query={query}>
      {(d) => {
        const oversized = files.filter((f) => f.size > d.maxAttachmentBytes)
        const tooMany = files.length > d.maxAttachments
        const canSubmit =
          files.length > 0 && agreed && !tooMany && oversized.length === 0 && !submit.isPending

        function send() {
          const form = new FormData()
          for (const f of files) form.append('files', f)
          form.append('comment', comment)
          form.append('integrityAgreed', String(agreed))
          // No Content-Type header — the browser sets the multipart boundary.
          submit.mutate(form)
        }

        return (
          <div className="flex flex-col gap-6">
            <PageHeader
              title={d.title}
              subtitle={`${d.course.code} ${d.course.title} • Due ${dateTime(d.dueAt)}`}
            />

            <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
              <div className="flex flex-col gap-6">
                <Card>
                  <CardHeader title="Brief" />
                  <CardBody>
                    <p className="text-fg-body">{d.brief}</p>
                    <ul className="mt-3 flex flex-col gap-2">
                      {d.requirements.map((r) => (
                        <li key={r} className="flex gap-2 text-fg-body">
                          <CheckCircle2
                            className="mt-0.5 size-4 shrink-0 text-success"
                            aria-hidden
                          />
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
                      <span className="text-fg-muted">
                        Up to {d.maxAttachments} files, {fileSize(d.maxAttachmentBytes)} each
                      </span>
                      <input
                        type="file"
                        multiple
                        accept={d.acceptedMimeTypes.join(',')}
                        className="sr-only"
                        onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                      />
                    </label>

                    {files.length > 0 && (
                      <ul className="flex flex-col gap-2">
                        {files.map((f) => (
                          <li
                            key={f.name}
                            className="flex items-center justify-between gap-3 rounded-control bg-surface-subtle p-3"
                          >
                            <span className="min-w-0 truncate text-fg-body">
                              {f.name}{' '}
                              <span
                                className={
                                  f.size > d.maxAttachmentBytes ? 'text-danger' : 'text-fg-muted'
                                }
                              >
                                ({fileSize(f.size)})
                              </span>
                            </span>
                            <button
                              type="button"
                              aria-label={`Remove ${f.name}`}
                              onClick={() => setFiles((prev) => prev.filter((x) => x !== f))}
                              className="shrink-0 text-fg-muted hover:text-danger"
                            >
                              <X className="size-4" aria-hidden />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Client-side for the fast rejection; the server enforces it. */}
                    {tooMany && (
                      <p role="alert" className="text-danger">
                        At most {d.maxAttachments} files.
                      </p>
                    )}
                    {oversized.length > 0 && (
                      <p role="alert" className="text-danger">
                        {oversized.length} file{oversized.length === 1 ? ' is' : 's are'} over the{' '}
                        {fileSize(d.maxAttachmentBytes)} limit.
                      </p>
                    )}

                    <label className="flex flex-col gap-1.5">
                      <span className="text-link text-fg-heading">Additional Notes (Optional)</span>
                      <Textarea
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write any comments for the instructor here…"
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

                    {submit.isError && (
                      <p role="alert" className="text-danger">
                        {errors?.fieldError('files') ??
                          errors?.fieldError('integrityAgreed') ??
                          errors?.detail ??
                          'Submission failed. Your files were not uploaded.'}
                      </p>
                    )}

                    {submit.isSuccess ? (
                      <p role="status" className="flex items-center gap-2 text-success">
                        <CheckCircle2 className="size-4" aria-hidden />
                        Submitted. You can resubmit until the deadline.
                      </p>
                    ) : (
                      <Button disabled={!canSubmit} onClick={send} className="h-11 w-full text-body">
                        {submit.isPending ? 'Uploading…' : 'Submit assignment'}
                      </Button>
                    )}
                  </CardBody>
                </Card>
              </div>

              <ConnectedAssistant context="lms.assignment-detail" />
            </div>
          </div>
        )
      }}
    </QueryState>
  )
}
