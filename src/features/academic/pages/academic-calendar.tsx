import { cn } from '@/lib/utils'
import { Badge } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useAcademicCalendar } from '../api'
import type { MetricTone } from '@/components/patterns/metric-card'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const EVENT_TONE: Record<MetricTone, string> = {
  brand: 'text-brand-700',
  accent: 'text-accent-600',
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
}

/** Academic Calendar — Figma 6:9314. */
export function AcademicCalendar() {
  const query = useAcademicCalendar()

  return (
    <QueryState query={query}>
      {(d) => {
        // Leading blanks so day 1 lands on its real weekday.
        const cells: (number | null)[] = [
          ...Array<null>(d.firstWeekday - 1).fill(null),
          ...Array.from({ length: d.days }, (_, i) => i + 1),
        ]

        return (
          <div className="flex flex-col gap-6">
            <PageHeader title="Academic Calendar" subtitle={d.month} />

            <Card>
              <CardHeader title={d.month} />
              <CardBody>
                <div className="grid grid-cols-7 gap-1">
                  {WEEKDAYS.map((w) => (
                    <div key={w} className="p-2 text-center text-eyebrow uppercase text-fg-muted">
                      {w}
                    </div>
                  ))}

                  {cells.map((day, i) => {
                    if (day === null) return <div key={`b${i}`} />
                    const event = d.events[day]
                    const isToday = day === d.today

                    return (
                      <div
                        key={day}
                        className={cn(
                          'min-h-[76px] rounded-control border border-border p-2',
                          isToday ? 'border-brand-600 bg-brand-600/5' : 'bg-surface',
                        )}
                      >
                        <span
                          className={cn(
                            'text-link',
                            isToday ? 'text-brand-700' : 'text-fg-heading',
                          )}
                        >
                          {day}
                        </span>
                        {isToday && <span className="sr-only">Today</span>}
                        {event && (
                          <p className={cn('mt-1 text-eyebrow normal-case', EVENT_TONE[event.tone])}>
                            {event.label}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Events This Month" />
              <CardBody className="flex flex-col gap-3">
                {Object.entries(d.events).map(([day, e]) => (
                  <div key={day} className="flex items-center gap-4">
                    <span className="w-8 text-center text-link text-fg-heading">{day}</span>
                    <span className="flex-1 text-fg-body">{e.label}</span>
                    <Badge tone={e.tone === 'danger' ? 'danger' : e.tone === 'warning' ? 'warning' : 'brand'}>
                      {d.month.split(' ')[0]}
                    </Badge>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>
        )
      }}
    </QueryState>
  )
}
