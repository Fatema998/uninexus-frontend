import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, XAxis } from 'recharts'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { MetricCard, type MetricTone } from '@/components/patterns/metric-card'
import { ProgressBar } from '@/components/patterns/progress-bar'
import { QueryState } from '@/components/states'
import { dateShort, money, relative, time } from '@/lib/format'
import { useAdminDashboard } from './api'
import { iconFor } from './icon-map'

/** Chart colours must come from tokens — read them off the document. */
const TONE_VAR: Record<MetricTone, string> = {
  brand: '--color-brand-600',
  accent: '--color-accent-600',
  info: '--color-info',
  success: '--color-success',
  warning: '--color-warning',
  danger: '--color-danger',
}

const toneColor = (tone: MetricTone) =>
  getComputedStyle(document.documentElement).getPropertyValue(TONE_VAR[tone]).trim()

/** Admin Executive Dashboard — Figma 7:15548. */
export function AdminDashboard() {
  const query = useAdminDashboard()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-card-title">Executive Dashboard</h1>
            <p className="text-fg-muted">Institution-wide health at a glance.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {d.metrics.map((m) => (
              <MetricCard
                key={m.label}
                label={m.label}
                value={m.value}
                tone={m.tone}
                icon={iconFor(m.icon)}
                badge={m.badge}
              />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader title="Enrollment Overview" />
              <CardBody>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={d.enrolment} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                      <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="var(--color-border)" />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        interval={1}
                        tick={{ fill: 'var(--color-fg-muted)', fontSize: 12 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="students"
                        stroke={toneColor('brand')}
                        strokeWidth={2.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader title="Student Distribution" />
                <CardBody className="flex items-center gap-6">
                  <div className="relative size-[120px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={d.distribution}
                          dataKey="value"
                          innerRadius={42}
                          outerRadius={58}
                          startAngle={90}
                          endAngle={-270}
                          stroke="none"
                        >
                          {d.distribution.map((s) => (
                            <Cell key={s.label} fill={toneColor(s.tone)} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
                      <p className="text-card-title">{(d.totalStudents / 1000).toFixed(1)}k</p>
                      <p className="text-eyebrow uppercase text-fg-muted">Total</p>
                    </div>
                  </div>

                  <ul className="flex flex-col gap-2">
                    {d.distribution.map((s) => (
                      <li key={s.label} className="flex items-center gap-2">
                        <span
                          className="size-2 rounded-full"
                          style={{ background: toneColor(s.tone) }}
                          aria-hidden
                        />
                        <span className="text-fg-body">{s.label}</span>
                        <span className="ml-auto text-link text-fg-heading">{s.value}%</span>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Recent Announcements" />
                <CardBody className="flex flex-col gap-4">
                  {d.announcements.map((a) => (
                    <div key={a.id} className="border-l-2 border-nav-active-student pl-3">
                      <p className="text-link text-fg-heading">{a.title}</p>
                      <p className="text-fg-muted">
                        {a.note} • {relative(a.publishedAt)}
                      </p>
                    </div>
                  ))}

                  <div className="mt-2 grid grid-cols-3 gap-3 border-t border-border pt-4">
                    {d.systems.map((s) => (
                      <div
                        key={s.id}
                        className="grid place-items-center gap-1 rounded-control bg-success-bg/60 p-3"
                      >
                        <span
                          className={s.healthy ? 'size-2 rounded-full bg-success' : 'size-2 rounded-full bg-danger'}
                          aria-hidden
                        />
                        <span className="text-eyebrow uppercase text-fg-muted">{s.label}</span>
                        <span className="sr-only">{s.healthy ? 'Healthy' : 'Degraded'}</span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader title="Financial (YTD)" />
              <CardBody>
                <p className="text-fg-muted">Year-to-Date Fee Collection Status</p>
                <p className="mt-4 text-eyebrow uppercase text-fg-muted">Collected</p>
                <div className="flex items-baseline justify-between">
                  <p className="text-metric text-fg-heading">{money(d.financial.collected)}</p>
                  <p className="text-link text-brand-700">{d.financial.percent}% Goal</p>
                </div>
                <ProgressBar
                  value={d.financial.percent}
                  className="mt-3"
                  label="Fee collection against target"
                />
                <p className="mt-2 text-right text-fg-muted">
                  Target: {money(d.financial.target)}
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Top Departments" />
              <CardBody className="flex flex-col gap-4">
                {d.departments.map((row) => (
                  <div key={row.department.id}>
                    <div className="mb-1.5 flex items-baseline justify-between">
                      <span className="text-link text-fg-heading">{row.department.name}</span>
                      <span className="text-fg-muted">
                        {row.students.toLocaleString()} students
                      </span>
                    </div>
                    <ProgressBar
                      value={row.percent}
                      tone={row.tone}
                      label={`${row.department.name} enrolment`}
                    />
                  </div>
                ))}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Upcoming Events" />
              <CardBody className="flex flex-col gap-4">
                {d.events.map((e) => {
                  // `25 May` -> ['25', 'May'] for the two-line date block.
                  const [day, month] = dateShort(e.startsAt).split(' ')
                  return (
                    <div key={e.id} className="flex gap-4">
                      <div className="grid size-12 shrink-0 place-content-center rounded-control bg-brand-700 text-center text-brand-fg">
                        <span className="text-eyebrow uppercase">{month}</span>
                        <span className="text-link">{day}</span>
                      </div>
                      <div>
                        <p className="text-link text-fg-heading">{e.title}</p>
                        <p className="text-fg-muted">
                          {e.note} • {time(e.startsAt)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </QueryState>
  )
}
