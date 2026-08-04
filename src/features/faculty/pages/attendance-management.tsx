import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { CalendarOff, Search } from 'lucide-react'
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
import { EmptyState, QueryState } from '@/components/states'
import { ApiError } from '@/hooks/use-api'
import { date, timeRange } from '@/lib/format'
import { useAssignedSections, useAttendanceSheet, useSubmitAttendance } from '../api'
import type { AttendanceMark } from '@/types'

const MARKS: { id: AttendanceMark; label: string; tone: string }[] = [
  { id: 'PRESENT', label: 'Present', tone: 'border-success bg-success/10 text-success' },
  { id: 'LATE', label: 'Late', tone: 'border-warning bg-warning/10 text-warning' },
  { id: 'EXCUSED', label: 'Excused', tone: 'border-info bg-info/10 text-info' },
  { id: 'ABSENT', label: 'Absent', tone: 'border-danger bg-danger/10 text-danger' },
]

const today = () => new Date().toISOString().slice(0, 10)

/**
 * Faculty Attendance Management — Figma 1:2938.
 *
 * Four marks, not a checkbox. A checkbox can only say present/absent, and the
 * institution distinguishes LATE and EXCUSED — collapsing them loses the
 * distinction that decides a student's exam eligibility.
 */
export function AttendanceManagement() {
  const sections = useAssignedSections()
  const [params, setParams] = useSearchParams()
  const sectionId = params.get('section')
  const day = params.get('date') ?? today()

  return (
    <QueryState query={sections}>
      {(s) => {
        const activeId = sectionId ?? s.sections[0]?.id
        if (!activeId) return <EmptyState title="No sections assigned" />

        return (
          <Sheet
            sectionId={activeId}
            date={day}
            sections={s.sections.map((x) => ({ id: x.id, label: `${x.course.code} Sec ${x.name}` }))}
            onPick={(next) => setParams({ section: next.section, date: next.date })}
          />
        )
      }}
    </QueryState>
  )
}

function Sheet({
  sectionId,
  date: day,
  sections,
  onPick,
}: {
  sectionId: string
  date: string
  sections: { id: string; label: string }[]
  onPick: (next: { section: string; date: string }) => void
}) {
  const query = useAttendanceSheet(sectionId, day)
  const key = ['faculty', 'attendance', sectionId, day]
  const [marks, setMarks] = useState<Record<string, AttendanceMark> | null>(null)
  const [q, setQ] = useState('')

  const sessionId = query.data?.session?.id ?? ''
  const submit = useSubmitAttendance(sessionId, key)
  const error = submit.error instanceof ApiError ? submit.error : null

  return (
    <QueryState query={query}>
      {(d) => {
        const current =
          marks ?? Object.fromEntries(d.roster.map((r) => [r.student.id, r.mark]))
        // LATE counts as attendance; the institution treats it as a policy
        // distinction, not an absence.
        const present = Object.values(current).filter((m) => m === 'PRESENT' || m === 'LATE').length

        const term = q.trim().toLowerCase()
        const shown = term
          ? d.roster.filter(
              (r) =>
                r.student.fullName.toLowerCase().includes(term) ||
                r.student.registrationNo.includes(term),
            )
          : d.roster

        const setAll = (mark: AttendanceMark) =>
          setMarks(Object.fromEntries(d.roster.map((r) => [r.student.id, mark])))

        function save() {
          // The whole roster goes up, always — a partial submit cannot say
          // "unmarked" vs "absent". See docs/api/faculty.md §2.5.
          submit.mutate({
            marks: d.roster.map((r) => ({
              studentId: r.student.id,
              mark: current[r.student.id] ?? 'ABSENT',
            })),
          })
        }

        return (
          <div className="flex flex-col gap-6">
            <PageHeader
              title="Attendance"
              subtitle={
                d.lastSession
                  ? `Last session ${date(d.lastSession.date)} — ${d.lastSession.presentCount}/${d.lastSession.totalCount} present`
                  : 'No previous session on record.'
              }
              action={
                d.session ? (
                  <Button disabled={submit.isPending} onClick={save} className="h-11 text-body">
                    {submit.isPending
                      ? 'Saving…'
                      : `${d.submitted ? 'Update' : 'Submit'} (${present}/${d.roster.length})`}
                  </Button>
                ) : undefined
              }
            />

            <div className="flex flex-wrap gap-3">
              <Select value={sectionId} onValueChange={(v) => onPick({ section: v, date: day })}>
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

              <label>
                <span className="sr-only">Session date</span>
                <Input
                  type="date"
                  value={day}
                  onChange={(e) => onPick({ section: sectionId, date: e.target.value })}
                  className="h-10 w-[180px]"
                />
              </label>
            </div>

            {/* No class scheduled is rendered as such. An empty roster on a
                holiday is how phantom absences get recorded. */}
            {d.session === null ? (
              <Card>
                <CardBody>
                  <EmptyState
                    title="No class scheduled"
                    description={`${d.section.course.code} Sec ${d.section.name} does not meet on ${date(day)}.`}
                    icon={CalendarOff}
                  />
                </CardBody>
              </Card>
            ) : (
              <Card>
                <CardHeader title={`Present: ${present} of ${d.roster.length}`}>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setAll('PRESENT')}>
                      All present
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setAll('ABSENT')}>
                      All absent
                    </Button>
                  </div>
                </CardHeader>
                <CardBody className="flex flex-col gap-3">
                  <p className="text-fg-muted">
                    {timeRange(d.session.startsAt, d.session.endsAt)}
                    {d.submitted && ' • already submitted, saving again will update it'}
                  </p>

                  <label className="relative flex items-center">
                    <Search
                      className="pointer-events-none absolute left-3 size-4.5 text-fg-muted"
                      aria-hidden
                    />
                    <span className="sr-only">Search by student name or ID</span>
                    <Input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search by student name or ID"
                      className="h-10 pl-10"
                    />
                  </label>

                  {shown.map((r) => (
                    <div
                      key={r.student.id}
                      className="flex flex-wrap items-center gap-3 rounded-control border border-border-strong bg-surface p-3"
                    >
                      <span className="min-w-0 flex-1 truncate text-fg-heading">
                        {r.student.fullName}
                      </span>
                      <span className="text-fg-muted">{r.student.registrationNo}</span>
                      <div className="flex gap-1" role="group" aria-label={`Mark ${r.student.fullName}`}>
                        {MARKS.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            aria-pressed={current[r.student.id] === m.id}
                            onClick={() => setMarks({ ...current, [r.student.id]: m.id })}
                            className={cn(
                              'rounded-control border px-2.5 py-1 text-link transition-colors',
                              current[r.student.id] === m.id
                                ? m.tone
                                : 'border-border-strong text-fg-muted hover:bg-surface-subtle',
                            )}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {submit.isError && (
                    <p role="alert" className="text-danger">
                      {error?.fieldError('marks') ?? error?.detail ?? 'Could not submit attendance.'}
                    </p>
                  )}
                  {submit.isSuccess && (
                    <p role="status" className="text-success">
                      Submitted — {submit.data.presentCount} of {submit.data.totalCount} present.
                    </p>
                  )}
                </CardBody>
              </Card>
            )}
          </div>
        )
      }}
    </QueryState>
  )
}
