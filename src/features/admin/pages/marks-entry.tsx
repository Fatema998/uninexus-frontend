import { useState } from 'react'
import { AlertTriangle, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { QueryState } from '@/components/states'
import { ApiError } from '@/hooks/use-api'
import { useMarksEntry, usePublishMarks, useSaveMarks } from '../api'
import type { ApiErrorBody } from '@/types'

/**
 * ERP Marks Entry & Results Workspace — Figma 7:14290.
 *
 * Two separate actions, deliberately. Saving is reversible bookkeeping;
 * publishing makes every student in the section see their result at once and
 * cannot be undone — so it sits behind a typed confirmation and the sheet
 * locks afterwards. See docs/api/admin.md §3.4.
 */
export function MarksEntry() {
  const query = useMarksEntry()
  const save = useSaveMarks()
  const publish = usePublishMarks()

  const [edits, setEdits] = useState<Record<string, string>>({})
  const [confirming, setConfirming] = useState(false)
  const [confirmation, setConfirmation] = useState('')

  const rejected = Object.fromEntries((save.data?.rejected ?? []).map((r) => [r.studentId, r.reason]))
  const publishError =
    publish.error instanceof ApiError ? (publish.error.body as ApiErrorBody) : null

  return (
    <QueryState query={query}>
      {(d) => {
        const max = d.assessment.maxPoints
        const valueOf = (studentId: string, stored: number | null) =>
          edits[studentId] ?? (stored === null ? '' : String(stored))

        const values = d.rows.map((r) => valueOf(r.student.id, r.marks))
        const complete = values.every((v) => v !== '')
        const anyOver = values.some((v) => v !== '' && Number(v) > max)
        const entered = values.filter((v) => v !== '').map(Number)
        const average = entered.length
          ? (entered.reduce((a, b) => a + b, 0) / entered.length).toFixed(1)
          : '—'
        const pending = Object.keys(edits).length

        function submitSave() {
          save.mutate(
            {
              sectionId: 'sec-1',
              assessmentId: d.assessment.id,
              entries: Object.entries(edits).map(([studentId, raw]) => ({
                studentId,
                marks: raw.trim() === '' ? null : Number(raw),
              })),
            },
            {
              onSuccess: (result) => {
                // Keep only what the server refused, so a typo does not cost
                // the other twenty-nine entries.
                const keep = new Set(result.rejected.map((r) => r.studentId))
                setEdits((prev) =>
                  Object.fromEntries(Object.entries(prev).filter(([k]) => keep.has(k))),
                )
              },
            },
          )
        }

        return (
          <div className="flex flex-col gap-6">
            <PageHeader
              title="Marks Entry"
              subtitle={`${d.course.code} Sec ${d.sectionName} • ${d.assessment.label} • ${d.assessment.weightPercent}% weighting`}
              action={
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={pending === 0 || save.isPending || !d.editable}
                    onClick={submitSave}
                    className="h-11 text-body"
                  >
                    {save.isPending ? 'Saving…' : `Save ${pending || ''}`}
                  </Button>
                  <Button
                    disabled={!complete || anyOver || !d.editable}
                    onClick={() => setConfirming(true)}
                    className="h-11 text-body"
                  >
                    {d.status === 'PUBLISHED' ? 'Published' : 'Publish results'}
                  </Button>
                </div>
              }
            />

            {/* Publishing is irreversible and reaches everyone at once, so it
                asks for the course code rather than a single click. */}
            {confirming && d.editable && (
              <div className="rounded-card border border-warning/40 bg-warning/5 p-4">
                <p className="mb-1 flex items-center gap-2 text-link text-warning">
                  <AlertTriangle className="size-4" aria-hidden />
                  Publish {d.course.code} {d.assessment.label} to {d.rows.length} students?
                </p>
                <p className="text-fg-body">
                  Every student sees their mark immediately, and the sheet locks. Type{' '}
                  <strong>{d.course.code}</strong> to confirm.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Input
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    placeholder={d.course.code}
                    aria-label="Type the course code to confirm"
                    className="h-10 w-[180px]"
                  />
                  <Button
                    disabled={confirmation !== d.course.code || publish.isPending}
                    onClick={() =>
                      publish.mutate({
                        sectionId: 'sec-1',
                        assessmentId: d.assessment.id,
                        confirmation,
                      })
                    }
                  >
                    {publish.isPending ? 'Publishing…' : 'Publish'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setConfirming(false)
                      setConfirmation('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
                {publish.isError && (
                  <p role="alert" className="mt-2 text-danger">
                    {publishError?.confirmation ?? publishError?.detail ?? 'Could not publish.'}
                  </p>
                )}
              </div>
            )}

            {publish.isSuccess && (
              <p role="status" className="text-success">
                Published to {publish.data.publishedCount} students — {publish.data.audit.summary}.
              </p>
            )}

            {save.isSuccess && (
              <p
                role="status"
                className={save.data.rejected.length > 0 ? 'text-warning' : 'text-success'}
              >
                {save.data.saved} saved
                {save.data.rejected.length > 0 &&
                  ` • ${save.data.rejected.length} rejected — see the highlighted rows`}
              </p>
            )}

            <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
              <Card>
                <CardHeader title={`${d.assessment.label} — ${d.status}`}>
                  {!d.editable && <Badge tone="neutral">LOCKED</Badge>}
                </CardHeader>
                <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-surface-subtle hover:bg-surface-subtle">
                        {['Student', 'ID', `Marks /${max}`].map((h) => (
                          <TableHead
                            key={h}
                            className="h-auto px-6 py-3 text-eyebrow uppercase text-fg-muted"
                          >
                            {h}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {d.rows.map((r) => {
                        const v = valueOf(r.student.id, r.marks)
                        const over = v !== '' && Number(v) > max
                        const reason = rejected[r.student.id]
                        return (
                          <TableRow key={r.student.id}>
                            <TableCell className="text-fg-heading">{r.student.fullName}</TableCell>
                            <TableCell>{r.student.registrationNo}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={0}
                                max={max}
                                disabled={!d.editable}
                                aria-label={`Marks for ${r.student.fullName}`}
                                aria-invalid={over || reason !== undefined}
                                value={v}
                                onChange={(e) =>
                                  setEdits((prev) => ({ ...prev, [r.student.id]: e.target.value }))
                                }
                                className={cn(
                                  'h-9 w-24',
                                  (over || reason) && 'border-danger',
                                  edits[r.student.id] !== undefined && !over && !reason && 'border-brand-600',
                                )}
                              />
                              {over && (
                                <span role="alert" className="mt-1 block text-danger">
                                  Max {max}.
                                </span>
                              )}
                              {reason && (
                                <span role="alert" className="mt-1 block text-danger">
                                  {reason}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </Card>

              <aside className="flex flex-col gap-6">
                <Card>
                  <CardHeader title="Summary" />
                  <CardBody className="flex flex-col gap-2">
                    <Row label="Students" value={String(d.rows.length)} />
                    <Row label="Entered" value={`${entered.length} / ${d.rows.length}`} />
                    <Row label="Average" value={average} />
                    <Row label="Status" value={d.status} />
                  </CardBody>
                </Card>

                {d.insight && (
                  <div className="rounded-card border border-accent-600/20 bg-accent-600/5 p-4">
                    <p className="mb-1 flex items-center gap-2 text-link text-accent-600">
                      <Sparkles className="size-4" aria-hidden />
                      Insight
                    </p>
                    <p className="text-fg-body">{d.insight}</p>
                  </div>
                )}
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
