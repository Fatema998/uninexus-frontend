import { useState } from 'react'
import { AlertTriangle, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { EmptyState, QueryState } from '@/components/states'
import { ApiError } from '@/hooks/use-api'
import { useAddCourse, useCourseOfferings, useRemoveCourse } from '../api'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const DEPARTMENTS = [
  'All Departments',
  'Computer Science',
  'Mathematics',
  'General Education',
  'Business Administration',
]

const MAX_CREDITS = 18

/**
 * Course Registration — Figma 6:10774.
 *
 * Adding is a server round trip, not an optimistic patch: seats are
 * contended and a 409 is a normal outcome (docs/api/student.md §5.2).
 */
export function CourseRegistration() {
  const [dept, setDept] = useState('All Departments')
  const [q, setQ] = useState('')
  const query = useCourseOfferings(q.trim(), dept)

  const add = useAddCourse()
  const remove = useRemoveCourse()
  const busy = add.isPending || remove.isPending

  const conflict = add.error instanceof ApiError ? add.error : null

  return (
    <QueryState query={query}>
      {(d) => {
        // `canRegister === false` with "Already added." is the server telling
        // us it is in the cart — there is no second source of truth here.
        const chosen = d.results.filter((c) => c.blockedReason === 'Already added.')
        const credits = chosen.reduce((sum, c) => sum + c.course.credits, 0)
        const overLimit = credits > MAX_CREDITS

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
                      <Search
                        className="pointer-events-none absolute left-3 size-4.5 text-fg-muted"
                        aria-hidden
                      />
                      <span className="sr-only">Search courses</span>
                      <Input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search by course code or title (e.g., CS-301)…"
                        className="h-10 pl-10"
                      />
                    </label>

                    <Select value={dept} onValueChange={setDept}>
                      <SelectTrigger className="h-10 w-[200px]" aria-label="Filter by department">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map((x) => (
                          <SelectItem key={x} value={x}>
                            {x}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {conflict && (
                    <p role="alert" className="text-danger">
                      {conflict.detail ?? 'That course could not be added.'}
                    </p>
                  )}

                  {d.results.length === 0 ? (
                    <EmptyState
                      title="No courses match"
                      description="Try a different department or search term."
                    />
                  ) : (
                    d.results.map((c) => {
                      const isPicked = c.blockedReason === 'Already added.'
                      return (
                        <div
                          key={c.id}
                          className={cn(
                            'flex items-start gap-3 rounded-control border p-4 transition-colors',
                            isPicked
                              ? 'border-brand-600 bg-brand-600/5'
                              : 'border-border-strong bg-surface',
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-link text-fg-heading">{c.course.title}</p>
                            <p className="text-fg-muted">
                              {c.course.code} • {c.course.credits} credits • {c.seatsTaken} /{' '}
                              {c.seatsTotal} seats • {c.instructorName}
                            </p>
                            {c.notice && (
                              <Badge tone={c.notice.tone} className="mt-2">
                                {c.notice.text}
                              </Badge>
                            )}
                          </div>

                          {isPicked ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={busy}
                              onClick={() => remove.mutate(c.id)}
                            >
                              Remove
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              disabled={busy || !c.canRegister || overLimit}
                              // The reason is shown, not hidden — a missing
                              // row reads as a bug.
                              title={c.blockedReason ?? undefined}
                              onClick={() => add.mutate({ offeringId: c.id })}
                            >
                              Add
                            </Button>
                          )}
                        </div>
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
                        <div key={c.id} className="flex items-baseline justify-between gap-3">
                          <span className="min-w-0 truncate text-fg-body">{c.course.title}</span>
                          <span className="shrink-0 text-fg-muted">{c.course.credits} cr</span>
                        </div>
                      ))
                    )}

                    <div className="mt-2 flex items-baseline justify-between border-t border-border pt-3">
                      <span className="text-eyebrow uppercase text-fg-muted">Total credits</span>
                      <span
                        className={cn('text-link', overLimit ? 'text-danger' : 'text-fg-heading')}
                      >
                        {credits} / {MAX_CREDITS}
                      </span>
                    </div>

                    {overLimit && (
                      <p role="alert" className="flex items-start gap-2 text-danger">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
                        Over the {MAX_CREDITS}-credit limit. Remove a course to continue.
                      </p>
                    )}

                    <Button
                      disabled={chosen.length === 0 || overLimit}
                      className="mt-2 h-11 w-full text-body"
                    >
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
