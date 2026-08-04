import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { FileText, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { ProgressBar } from '@/components/patterns/progress-bar'
import { Button } from '@/components/ui/button'
import { QueryState } from '@/components/states'
import { ApiError } from '@/hooks/use-api'
import { fileSize, relative } from '@/lib/format'
import { useAssignedSections, useSectionDetail, useUploadMaterials } from '../api'

/** Faculty Courses Management — Figma 1:3640. */
export function CoursesManagement() {
  const sections = useAssignedSections()
  const [params, setParams] = useSearchParams()

  return (
    <QueryState query={sections}>
      {(d) => {
        // Section is the unit of everything a teacher does; the URL carries it
        // so a link to a specific course survives a reload.
        const activeId = params.get('section') ?? d.sections[0]?.id ?? null

        return (
          <div className="flex flex-col gap-6">
            <PageHeader
              title="Courses"
              subtitle={`${d.sections.length} sections this semester.`}
            />

            <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
              <Card>
                <CardHeader title="Managed Courses" />
                <CardBody className="flex flex-col gap-3">
                  {d.sections.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setParams({ section: s.id })}
                      className={cn(
                        'rounded-control border p-4 text-left transition-colors',
                        activeId === s.id
                          ? 'border-brand-600 bg-brand-600/5'
                          : 'border-border-strong bg-surface hover:bg-surface-subtle',
                      )}
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-link text-fg-heading">
                          {s.course.code} — {s.course.title}
                        </p>
                        <p className="text-fg-muted">
                          Sec {s.name} • {s.enrolledCount} students
                        </p>
                      </div>
                      <ProgressBar
                        value={s.syllabusProgress}
                        label={`${s.course.code} progress`}
                        className="mt-3"
                      />
                      <p className="mt-2 text-fg-muted">
                        {s.chaptersDone} of {s.chaptersTotal} chapters covered
                      </p>
                    </button>
                  ))}
                </CardBody>
              </Card>

              {activeId ? <SectionPanel sectionId={activeId} /> : null}
            </div>
          </div>
        )
      }}
    </QueryState>
  )
}

/**
 * Split out so the upload mutation is keyed to one section. A shared hook at
 * the parent would invalidate whichever section happened to be open when it
 * mounted.
 */
function SectionPanel({ sectionId }: { sectionId: string }) {
  const query = useSectionDetail(sectionId)
  const upload = useUploadMaterials(sectionId)
  const [files, setFiles] = useState<File[]>([])

  const error = upload.error instanceof ApiError ? upload.error : null

  function send() {
    const form = new FormData()
    for (const f of files) form.append('files', f)
    form.append('note', '')
    // Not optimistic: the upload has real duration, so a spinner is honest.
    upload.mutate(form, { onSuccess: () => setFiles([]) })
  }

  return (
    <QueryState query={query}>
      {(d) => (
        <aside className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Materials" icon={FileText} />
            <CardBody className="flex flex-col gap-3">
              {d.materials.map((m) => (
                <a key={m.id} href={m.url} download className="flex items-center gap-3">
                  <FileText className="size-4.5 shrink-0 text-fg-muted" aria-hidden />
                  <div className="min-w-0">
                    <p className="truncate text-link text-brand-700">{m.filename}</p>
                    <p className="truncate text-fg-muted">
                      {fileSize(m.sizeBytes)} • uploaded {relative(m.uploadedAt)}
                    </p>
                  </div>
                </a>
              ))}

              <label className="mt-1 flex cursor-pointer flex-col items-center gap-1 rounded-control border-2 border-dashed border-sidebar-line p-4 text-center hover:bg-surface-subtle">
                <Upload className="size-4 text-fg-muted" aria-hidden />
                <span className="text-link text-fg-heading">Upload material</span>
                <input
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                />
              </label>

              {files.length > 0 && (
                <>
                  <ul className="flex flex-col gap-2">
                    {files.map((f) => (
                      <li
                        key={f.name}
                        className="flex items-center justify-between gap-3 rounded-control bg-surface-subtle p-2"
                      >
                        <span className="min-w-0 truncate text-fg-body">
                          {f.name} <span className="text-fg-muted">({fileSize(f.size)})</span>
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
                  <Button disabled={upload.isPending} onClick={send} className="h-11 text-body">
                    {upload.isPending ? 'Uploading…' : `Upload ${files.length} file(s)`}
                  </Button>
                </>
              )}

              {upload.isError && (
                <p role="alert" className="text-danger">
                  {error?.fieldError('files') ?? error?.detail ?? 'Upload failed.'}
                </p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Recent Activity" />
            <CardBody className="flex flex-col gap-3">
              {d.recentActivity.map((a) => (
                <div key={a.id} className="border-l-2 border-nav-active-student pl-3">
                  <p className="text-link text-fg-heading">{a.title}</p>
                  <p className="text-fg-muted">{relative(a.at)}</p>
                </div>
              ))}
            </CardBody>
          </Card>
        </aside>
      )}
    </QueryState>
  )
}
