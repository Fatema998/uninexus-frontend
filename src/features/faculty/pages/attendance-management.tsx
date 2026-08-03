import { useState } from 'react'
import { Search } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { QueryState } from '@/components/states'
import { useFacultyAttendance } from '../api'

/**
 * Faculty Attendance Management — Figma 1:2938.
 * Take attendance for a session: per-student toggles, mark-all, live present
 * count. The count is derived, never a second piece of state.
 */
export function AttendanceManagement() {
  const query = useFacultyAttendance()
  const [marks, setMarks] = useState<Record<string, boolean> | null>(null)
  const [q, setQ] = useState('')
  const [saved, setSaved] = useState(false)

  return (
    <QueryState query={query}>
      {(d) => {
        const current = marks ?? Object.fromEntries(d.students.map((s) => [s.id, s.present]))
        const present = Object.values(current).filter(Boolean).length
        const term = q.trim().toLowerCase()
        const shown = term
          ? d.students.filter(
              (s) => s.name.toLowerCase().includes(term) || s.id.includes(term),
            )
          : d.students

        const setAll = (value: boolean) => {
          setSaved(false)
          setMarks(Object.fromEntries(d.students.map((s) => [s.id, value])))
        }

        return (
          <div className="flex flex-col gap-6">
            <PageHeader
              title="Attendance"
              subtitle={`${d.session} • ${d.lastSession}`}
              action={
                <Button
                  onClick={() => setSaved(true)}
                  className="h-11 text-body"
                >
                  {saved ? 'Saved' : `Save (${present}/${d.students.length})`}
                </Button>
              }
            />

            <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
              <Card>
                <CardHeader title={`Present: ${present} of ${d.students.length}`}>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setAll(true)}>
                      All present
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setAll(false)}>
                      Clear
                    </Button>
                  </div>
                </CardHeader>
                <CardBody className="flex flex-col gap-3">
                  <label className="relative flex items-center">
                    <Search className="pointer-events-none absolute left-3 size-4.5 text-fg-muted" aria-hidden />
                    <span className="sr-only">Search by student name or ID</span>
                    <Input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search by Student Name or ID"
                      className="h-10 pl-10"
                    />
                  </label>

                  {shown.map((s) => (
                    <label
                      key={s.id}
                      className="flex cursor-pointer items-center gap-3 rounded-control border border-border-strong bg-surface p-3 hover:bg-surface-subtle"
                    >
                      <Checkbox
                        checked={current[s.id]}
                        onCheckedChange={(v) => {
                          setSaved(false)
                          setMarks({ ...current, [s.id]: v === true })
                        }}
                      />
                      <span className="flex-1 text-fg-heading">{s.name}</span>
                      <span className="text-fg-muted">{s.id}</span>
                    </label>
                  ))}
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Upcoming Notices" />
                <CardBody className="flex flex-col gap-3">
                  {d.notices.map((n) => (
                    <div key={n.title} className="border-l-2 border-nav-active-student pl-3">
                      <p className="text-eyebrow uppercase text-fg-muted">{n.time}</p>
                      <p className="text-link text-fg-heading">{n.title}</p>
                      <p className="text-fg-muted">{n.place}</p>
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
