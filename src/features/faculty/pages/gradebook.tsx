import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { cn } from '@/lib/utils'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmptyState, QueryState } from '@/components/states'
import { useAssignedSections, useGradebook, useSaveGrades } from '../api'

/** `${studentId}:${columnId}` -> raw input text. */
type Edits = Record<string, string>
const cellKey = (studentId: string, columnId: string) => `${studentId}:${columnId}`

/**
 * Faculty Grade Book — Figma 2:169.
 *
 * Bulk entry, saved in one batched PATCH. Deliberately not optimistic: the
 * server may keep 28 of 30 cells, and patching all 30 would show them land
 * and then quietly revert two after the teacher has moved on. We wait, then
 * mark the rejected cells in place. See docs/api/faculty.md §2.4.
 */
export function FacultyGradebook() {
  const sections = useAssignedSections()
  const [params, setParams] = useSearchParams()

  return (
    <QueryState query={sections}>
      {(s) => {
        const activeId = params.get('section') ?? s.sections[0]?.id
        if (!activeId) return <EmptyState title="No sections assigned" />

        return (
          <Sheet
            sectionId={activeId}
            sections={s.sections.map((x) => ({ id: x.id, label: `${x.course.code} Sec ${x.name}` }))}
            onPick={(id) => setParams({ section: id })}
          />
        )
      }}
    </QueryState>
  )
}

function Sheet({
  sectionId,
  sections,
  onPick,
}: {
  sectionId: string
  sections: { id: string; label: string }[]
  onPick: (id: string) => void
}) {
  const query = useGradebook(sectionId)
  const save = useSaveGrades(sectionId)
  const [edits, setEdits] = useState<Edits>({})

  /** Per-cell reasons from the last save. Cleared when that cell is edited. */
  const rejected = Object.fromEntries(
    (save.data?.rejected ?? []).map((r) => [cellKey(r.studentId, r.columnId), r.reason]),
  )

  return (
    <QueryState query={query}>
      {(d) => {
        const pending = Object.keys(edits).length

        function submit() {
          const entries = Object.entries(edits).map(([key, raw]) => {
            const [studentId, columnId] = key.split(':')
            return {
              studentId: studentId!,
              columnId: columnId!,
              // An emptied cell is a deliberate clear, not a zero.
              points: raw.trim() === '' ? null : Number(raw),
            }
          })
          save.mutate(
            { entries },
            {
              onSuccess: (result) => {
                // Keep only the cells the server refused, so the teacher can
                // fix them without retyping the ones that landed.
                const keep = new Set(result.rejected.map((r) => cellKey(r.studentId, r.columnId)))
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
              title="Grade Book"
              subtitle={`${d.section.course.code} Sec ${d.section.name} • ${d.remainingEntries} cells still empty`}
              action={
                <Button
                  disabled={pending === 0 || save.isPending}
                  onClick={submit}
                  className="h-11 text-body"
                >
                  {save.isPending ? 'Saving…' : `Save ${pending || ''} change${pending === 1 ? '' : 's'}`}
                </Button>
              }
            />

            <Select value={sectionId} onValueChange={onPick}>
              <SelectTrigger className="h-10 w-[260px]" aria-label="Section">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sections.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {save.isSuccess && (
              <p
                role="status"
                className={save.data.rejected.length > 0 ? 'text-warning' : 'text-success'}
              >
                {save.data.saved} saved
                {save.data.rejected.length > 0 &&
                  ` • ${save.data.rejected.length} rejected — see the highlighted cells`}
              </p>
            )}

            <Card>
              <CardHeader title="Marks" />
              <CardBody className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>ID</TableHead>
                      {d.columns.map((c) => (
                        <TableHead key={c.id}>
                          {c.label}
                          <span className="ml-1 text-fg-muted">
                            /{c.maxPoints} · {c.weightPercent}%
                          </span>
                        </TableHead>
                      ))}
                      <TableHead>Total</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {d.rows.map((row) => (
                      <TableRow key={row.student.id}>
                        <TableCell className="text-fg-heading">{row.student.fullName}</TableCell>
                        <TableCell>{row.student.registrationNo}</TableCell>

                        {d.columns.map((col) => {
                          const key = cellKey(row.student.id, col.id)
                          const reason = rejected[key]
                          const stored = row.scores[col.id]
                          return (
                            <TableCell key={col.id}>
                              <Input
                                type="number"
                                min={0}
                                max={col.maxPoints}
                                // A published column locks: visible, not hidden,
                                // so it never reads as data loss.
                                disabled={!col.editable}
                                aria-label={`${col.label} for ${row.student.fullName}`}
                                aria-invalid={reason !== undefined}
                                value={edits[key] ?? (stored === null ? '' : String(stored))}
                                onChange={(e) =>
                                  setEdits((prev) => ({ ...prev, [key]: e.target.value }))
                                }
                                className={cn(
                                  'h-9 w-20',
                                  reason && 'border-danger',
                                  edits[key] !== undefined && !reason && 'border-brand-600',
                                )}
                              />
                              {reason && (
                                <span role="alert" className="mt-1 block text-danger">
                                  {reason}
                                </span>
                              )}
                            </TableCell>
                          )
                        })}

                        {/* Null until every column is in — a partial sum reads
                            like a fail to a student who has not sat the final. */}
                        <TableCell className="text-link text-fg-heading">
                          {row.total ?? '—'}
                        </TableCell>
                        <TableCell className="text-link text-brand-700">
                          {row.grade ?? '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </div>
        )
      }}
    </QueryState>
  )
}
