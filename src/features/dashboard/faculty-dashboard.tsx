import { Calendar, ClipboardCheck, FileText, Megaphone, Sparkles, Star } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { DataTable } from '@/components/patterns/data-table'
import { MetricCard } from '@/components/patterns/metric-card'
import { Badge } from '@/components/patterns/badge'
import { Button } from '@/components/ui/button'
import { QueryState } from '@/components/states'
import { useAuth } from '@/features/auth/auth-context'
import { useFacultyDashboard, type FacultyDashboard as Data } from './api'
import { iconFor } from './icon-map'

const QUICK_ACTIONS = [
  { label: 'Attendance', icon: ClipboardCheck },
  { label: 'Assignment', icon: FileText },
  { label: 'Material', icon: FileText },
  { label: 'Grades', icon: Star },
  { label: 'Post Notice', icon: Megaphone },
]

/** Faculty Dashboard — Figma 1:2. */
export function FacultyDashboard() {
  const query = useFacultyDashboard()
  const { user } = useAuth()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-card-title">Faculty Dashboard</h1>
              <p className="text-fg-muted">
                Welcome back, {user?.name ?? 'Professor'} 👋{' '}
                <span className="text-brand-700">
                  You have {d.schedule.length} classes today.
                </span>
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {d.metrics.map((m) => (
                <MetricCard
                  key={m.label}
                  label={m.label}
                  value={m.value}
                  tone={m.tone}
                  icon={iconFor(m.icon)}
                />
              ))}
            </div>

            <Card>
              <CardHeader
                title="Today's Teaching Schedule"
                action={{ label: 'View Calendar', to: '/faculty/academic' }}
              />
              <CardBody className="grid gap-4 sm:grid-cols-2">
                {d.schedule.map((s) => (
                  <div
                    key={s.title}
                    className="rounded-control border border-border-strong bg-surface-subtle p-4"
                  >
                    <Badge tone={s.state === 'CURRENT' ? 'brand' : 'neutral'}>{s.state}</Badge>
                    <p className="mt-2 text-link text-fg-heading">{s.title}</p>
                    <p className="text-fg-muted">{s.meta}</p>
                    {s.state === 'CURRENT' && (
                      <Button size="sm" className="mt-3">
                        Launch AI Assistant
                      </Button>
                    )}
                  </div>
                ))}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="My Courses" action={{ label: 'View all', to: '/faculty/courses' }} />
              <CoursesTable rows={d.courses} />
            </Card>

            <Card>
              <CardHeader title="Pending Assignment Reviews">
                <Badge tone="danger">{d.metrics[3]?.value ?? '0'} NEW</Badge>
              </CardHeader>
              <CardBody className="flex flex-col gap-3">
                {d.reviews.map((r) => (
                  <div
                    key={r.title}
                    className="flex items-center gap-4 rounded-control border border-border-strong bg-surface p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-link text-fg-heading">{r.title}</p>
                      <p className="truncate text-fg-muted">{r.meta}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Review
                    </Button>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="rounded-card bg-brand-700 p-6 text-center text-brand-fg shadow-card">
              <p className="text-card-title text-brand-fg">{user?.name ?? 'Faculty'}</p>
              <p className="text-fg-on-dark">{user?.subtitle ?? 'Dept. of Computer Science'}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/20 pt-4">
                <div>
                  <p className="text-eyebrow uppercase text-fg-on-dark">Rating</p>
                  <p className="text-link text-brand-fg">4.9/5.0</p>
                </div>
                <div>
                  <p className="text-eyebrow uppercase text-fg-on-dark">Years</p>
                  <p className="text-link text-brand-fg">12 Exp.</p>
                </div>
              </div>
            </div>

            <section>
              <h2 className="mb-3 text-eyebrow uppercase text-fg-muted">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {QUICK_ACTIONS.map(({ label, icon: Icon }, i) => (
                  <button
                    key={label}
                    type="button"
                    className={`flex flex-col items-center gap-2 rounded-control border border-border-strong bg-surface p-4 text-link text-fg-heading transition-colors hover:bg-surface-subtle ${
                      i === QUICK_ACTIONS.length - 1 ? 'col-span-2 flex-row justify-center' : ''
                    }`}
                  >
                    <Icon className="size-[18px] text-fg-muted" aria-hidden />
                    {label}
                  </button>
                ))}
              </div>
            </section>

            <Card>
              <CardHeader title="Teaching Analytics" />
              <CardBody className="text-center">
                <TeachingRing {...d.teaching} />
                <ul className="mt-4 flex flex-col gap-1 text-left">
                  <li className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-brand-600" aria-hidden />
                    <span className="text-fg-body">Completed</span>
                    <span className="ml-auto text-link text-fg-heading">{d.teaching.completed} hrs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-track" aria-hidden />
                    <span className="text-fg-body">Remaining</span>
                    <span className="ml-auto text-link text-fg-heading">{d.teaching.remaining} hrs</span>
                  </li>
                </ul>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Recent Activities" icon={Calendar} />
              <CardBody className="flex flex-col gap-4">
                {d.activity.map((a) => (
                  <div key={a.title} className="flex gap-3">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-600" aria-hidden />
                    <div>
                      <p className="text-link text-fg-heading">{a.title}</p>
                      <p className="text-fg-muted">{a.meta}</p>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>

            <div className="rounded-card border border-accent-600/20 bg-accent-600/5 p-4">
              <p className="mb-1 flex items-center gap-2 text-link text-accent-600">
                <Sparkles className="size-4" aria-hidden />
                UniGPT Insight
              </p>
              <p className="text-fg-body">{d.insight}</p>
            </div>
          </aside>
        </div>
      )}
    </QueryState>
  )
}

function CoursesTable({ rows }: { rows: Data['courses'] }) {
  return (
    <DataTable
      rows={rows}
      getRowKey={(r) => r.code}
      empty={{ title: 'No courses assigned', description: 'Assigned courses appear here each semester.' }}
      columns={[
        {
          key: 'name',
          header: 'Course Name',
          cell: (r) => (
            <span className="flex items-center gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-control bg-brand-600/10 text-eyebrow text-brand-700">
                {r.tag}
              </span>
              <span className="text-fg-heading">{r.name}</span>
            </span>
          ),
        },
        { key: 'code', header: 'ID', cell: (r) => r.code },
        { key: 'section', header: 'Section', cell: (r) => r.section },
        { key: 'students', header: 'Students', cell: (r) => r.students, className: 'text-right' },
      ]}
    />
  )
}

/** Single-value donut. A whole chart library is overkill for one arc. */
function TeachingRing({ completed, remaining }: { completed: number; remaining: number }) {
  const total = completed + remaining
  const pct = total === 0 ? 0 : completed / total
  const r = 52
  const circumference = 2 * Math.PI * r

  return (
    <div className="relative mx-auto size-[140px]">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-track)" strokeWidth="12" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="var(--color-brand-600)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${circumference * pct} ${circumference}`}
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <p className="text-metric text-fg-heading">{total}</p>
        <p className="text-eyebrow uppercase text-fg-muted">Total Hours</p>
      </div>
    </div>
  )
}
