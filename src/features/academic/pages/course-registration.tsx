import { useState } from 'react'
import { AlertTriangle, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge, type BadgeTone } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { EmptyState, QueryState } from '@/components/states'
import { useCourseRegistration, type OfferedCourse } from '../api'

const NOTE_TONE: Record<OfferedCourse['noteTone'], BadgeTone> = {
  neutral: 'neutral',
  brand: 'brand',
  warning: 'warning',
}

const MAX_CREDITS = 18

/** Course Registration — Figma 6:10774. */
export function CourseRegistration() {
  const query = useCourseRegistration()
  const [dept, setDept] = useState('All Departments')
  const [q, setQ] = useState('')
  const [picked, setPicked] = useState<string[]>([])

  return (
    <QueryState query={query}>
      {(d) => {
        const term = q.trim().toLowerCase()
        const shown = d.courses.filter(
          (c) =>
            (dept === 'All Departments' || c.dept === dept) &&
            (!term || c.name.toLowerCase().includes(term) || c.code.toLowerCase().includes(term)),
        )

        const chosen = d.courses.filter((c) => picked.includes(c.code))
        const credits = chosen.reduce((sum, c) => sum + c.credits, 0)
        const overLimit = credits > MAX_CREDITS

        const toggle = (code: string) =>
          setPicked((prev) =>
            prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
          )

        return (
          <div className="flex flex-col gap-6">
            <PageHeader
              title="Course Registration"
              subtitle="Pick your courses for the upcoming term."
            />

            <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
              <Card>
                <CardHeader title="Available Courses" />
                <CardBody className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-3">
                    <label className="relative flex flex-1 items-center">
                      <Search className="pointer-events-none absolute left-3 size-4.5 text-fg-muted" aria-hidden />
                      <span className="sr-only">Search courses</span>
                      <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search by course code or title (e.g., CS301)…"
                        className="h-10 w-full rounded-control border border-border-strong bg-surface pl-10 pr-3 outline-none focus-visible:border-brand-600"
                      />
                    </label>

                    <label>
                      <span className="sr-only">Filter by department</span>
                      <select
                        value={dept}
                        onChange={(e) => setDept(e.target.value)}
                        className="h-10 rounded-control border border-border-strong bg-surface px-3 outline-none focus-visible:border-brand-600"
                      >
                        {d.departments.map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {shown.length === 0 ? (
                    <EmptyState
                      title="No courses match"
                      description="Try a different department or search term."
                    />
                  ) : (
                    shown.map((c) => {
                      const isPicked = picked.includes(c.code)
                      return (
                        <label
                          key={c.code}
                          className={cn(
                            'flex cursor-pointer items-start gap-3 rounded-control border p-4 transition-colors',
                            isPicked
                              ? 'border-brand-600 bg-brand-600/5'
                              : 'border-border-strong bg-surface hover:bg-surface-subtle',
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isPicked}
                            onChange={() => toggle(c.code)}
                            className="mt-1 size-4 accent-brand-700"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-link text-fg-heading">{c.name}</p>
                            <p className="text-fg-muted">
                              {c.code} • {c.credits} credits • {c.seats} seats
                            </p>
                            <Badge tone={NOTE_TONE[c.noteTone]} className="mt-2">
                              {c.note}
                            </Badge>
                          </div>
                        </label>
                      )
                    })
                  )}
                </CardBody>
              </Card>

              <aside>
                <Card className="xl:sticky xl:top-24">
                  <CardHeader title="Your Selection" />
                  <CardBody className="flex flex-col gap-3">
                    {chosen.length === 0 ? (
                      <p className="text-fg-muted">No courses selected yet.</p>
                    ) : (
                      chosen.map((c) => (
                        <div key={c.code} className="flex items-baseline justify-between gap-3">
                          <span className="min-w-0 truncate text-fg-body">{c.name}</span>
                          <span className="shrink-0 text-fg-muted">{c.credits} cr</span>
                        </div>
                      ))
                    )}

                    <div className="mt-2 flex items-baseline justify-between border-t border-border pt-3">
                      <span className="text-eyebrow uppercase text-fg-muted">Total credits</span>
                      <span className={cn('text-link', overLimit ? 'text-danger' : 'text-fg-heading')}>
                        {credits} / {MAX_CREDITS}
                      </span>
                    </div>

                    {overLimit && (
                      <p role="alert" className="flex items-start gap-2 text-danger">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
                        Over the {MAX_CREDITS}-credit limit. Remove a course to continue.
                      </p>
                    )}

                    <Button disabled={chosen.length === 0 || overLimit} className="mt-2 h-11 w-full text-body">
                      Register {chosen.length > 0 && `(${chosen.length})`}
                    </Button>
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
