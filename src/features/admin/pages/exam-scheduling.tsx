import { AlertTriangle } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { DataTable } from '@/components/patterns/data-table'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { QueryState } from '@/components/states'
import { ApiError } from '@/hooks/use-api'
import { dateTime } from '@/lib/format'
import { useAssignSlot, useExamSchedule } from '../api'
import type { ExamScheduleResponse, SlotState } from '@/types/admin'

const TONE: Record<SlotState, BadgeTone> = {
  CONFIRMED: 'success',
  PENDING: 'warning',
  UNASSIGNED: 'neutral',
  CONFLICT: 'danger',
}

/**
 * ERP Exam Scheduling & Timetable Matrix — Figma 7:16290.
 * Wide and dense: the table scrolls inside its own container so the page
 * never scrolls horizontally.
 */
export function ExamScheduling() {
  const query = useExamSchedule()

  return (
    <QueryState query={query}>
      {(d) => {
        const conflicts = d.slots.filter((s) => s.state === 'CONFLICT')

        return (
          <div className="flex flex-col gap-6">
            <PageHeader title="Exam Scheduling" subtitle="Halls, proctors, and conflicts." />

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {d.metrics.map((m) => (
                <MetricCard key={m.label} label={m.label} value={m.value} tone={m.tone} />
              ))}
            </div>

            {/* Conflicts lead. A clash buried in row 40 of a dense grid is a
                clash nobody sees until exam morning. */}
            {conflicts.length > 0 && (
              <div className="rounded-card border border-danger/20 bg-danger/5 p-4">
                <p className="mb-1 flex items-center gap-2 text-link text-danger">
                  <AlertTriangle className="size-4" aria-hidden />
                  {conflicts.length} scheduling conflict{conflicts.length === 1 ? '' : 's'}
                </p>
                {conflicts.map((s) => (
                  <p key={s.id} className="text-fg-body">
                    {s.course.code} — {s.conflictReason}
                  </p>
                ))}
              </div>
            )}

            <Card>
              <CardHeader title="Timetable Matrix" />
              <DataTable
                rows={d.slots}
                getRowKey={(r) => r.id}
                empty={{ title: 'Nothing scheduled yet' }}
                columns={[
                  { key: 'code', header: 'Code', cell: (r) => r.course.code },
                  {
                    key: 'name',
                    header: 'Course',
                    cell: (r) => <span className="text-fg-heading">{r.course.title}</span>,
                  },
                  { key: 'when', header: 'When', cell: (r) => dateTime(r.startsAt) },
                  {
                    key: 'hall',
                    header: 'Hall',
                    cell: (r) => <SlotAssign slot={r} halls={d.halls} proctors={d.proctors} field="hall" />,
                  },
                  {
                    key: 'proctor',
                    header: 'Proctor',
                    cell: (r) => <SlotAssign slot={r} halls={d.halls} proctors={d.proctors} field="proctor" />,
                  },
                  {
                    key: 'state',
                    header: 'Status',
                    cell: (r) => <Badge tone={TONE[r.state]}>{r.state}</Badge>,
                  },
                ]}
              />
              <CardBody className="border-t border-border">
                <p className="text-fg-muted">
                  Assigning a hall re-checks the whole grid — a change here can resolve or create a
                  clash in another row.
                </p>
              </CardBody>
            </Card>
          </div>
        )
      }}
    </QueryState>
  )
}

/**
 * One cell, one mutation. Keyed per slot so a 409 hall clash surfaces against
 * the row that caused it rather than as a page-level banner.
 */
function SlotAssign({
  slot,
  halls,
  proctors,
  field,
}: {
  slot: ExamScheduleResponse['slots'][number]
  halls: ExamScheduleResponse['halls']
  proctors: ExamScheduleResponse['proctors']
  field: 'hall' | 'proctor'
}) {
  const assign = useAssignSlot(slot.id)
  const error = assign.error instanceof ApiError ? assign.error : null

  const hallId = halls.find((h) => h.name === slot.hall)?.id ?? ''
  const proctorId = proctors.find((p) => p.name === slot.proctorName)?.id ?? ''
  const options = field === 'hall' ? halls : proctors
  const value = field === 'hall' ? hallId : proctorId

  return (
    <div className="min-w-[150px]">
      <Select
        value={value}
        disabled={assign.isPending}
        onValueChange={(v) =>
          assign.mutate({
            hallId: field === 'hall' ? v : hallId || null,
            proctorId: field === 'proctor' ? v : proctorId || null,
          })
        }
      >
        <SelectTrigger className="h-9" aria-label={`${field} for ${slot.course.code}`}>
          <SelectValue placeholder="Unassigned" />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.id} value={o.id}>
              {o.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {assign.isError && (
        <span role="alert" className="mt-1 block text-danger">
          {error?.detail ?? 'Could not assign.'}
        </span>
      )}
    </div>
  )
}
