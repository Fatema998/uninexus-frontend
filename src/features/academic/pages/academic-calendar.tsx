import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { EmptyState, QueryState } from '@/components/states'
import { useAcademicCalendar } from '../api'
import type { Tone } from '@/types'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const EVENT_TONE: Record<Tone, string> = {
  brand: 'text-brand-700',
  accent: 'text-accent-600',
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
}

const MONTH_LABEL = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' })

/** `YYYY-MM` shifted by n months. */
function shiftMonth(month: string, n: number): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(Date.UTC(y!, m! - 1 + n, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

/** Days in the month, and the weekday (1 = Mon) its 1st falls on. */
function gridFor(month: string) {
  const [y, m] = month.split('-').map(Number)
  const first = new Date(Date.UTC(y!, m! - 1, 1))
  return {
    days: new Date(Date.UTC(y!, m!, 0)).getUTCDate(),
    // getUTCDay is 0 = Sunday; the grid starts on Monday.
    firstWeekday: ((first.getUTCDay() + 6) % 7) + 1,
    label: MONTH_LABEL.format(first),
  }
}

const thisMonth = () => new Date().toISOString().slice(0, 7)

/**
 * Academic Calendar — Figma 6:9314.
 *
 * The grid shape is computed here rather than sent: days-in-month and the
 * starting weekday are arithmetic, and shipping them would let a cached
 * response render a wrong calendar.
 */
export function AcademicCalendar() {
  const [month, setMonth] = useState(thisMonth)
  const query = useAcademicCalendar(month)

  const { days, firstWeekday, label } = gridFor(month)
  const today = new Date().toISOString().slice(0, 10)

  return (
    <QueryState query={query}>
      {(d) => {
        // Several events can land on one day, so index by date, not by day.
        const byDate = new Map(d.events.map((e) => [e.date, e]))
        const cells: (number | null)[] = [
          ...Array<null>(firstWeekday - 1).fill(null),
          ...Array.from({ length: days }, (_, i) => i + 1),
        ]
        const dateOf = (day: number) => `${month}-${String(day).padStart(2, '0')}`

        return (
          <div className="flex flex-col gap-6">
            <PageHeader
              title="Academic Calendar"
              subtitle={label}
              action={
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon-lg"
                    aria-label="Previous month"
                    onClick={() => setMonth((m) => shiftMonth(m, -1))}
                  >
                    <ChevronLeft className="size-4" aria-hidden />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-lg"
                    aria-label="Next month"
                    onClick={() => setMonth((m) => shiftMonth(m, 1))}
                  >
                    <ChevronRight className="size-4" aria-hidden />
                  </Button>
                </div>
              }
            />

            <Card>
              <CardHeader title={label} />
              <CardBody>
                <div className="grid grid-cols-7 gap-1">
                  {WEEKDAYS.map((w) => (
                    <div key={w} className="p-2 text-center text-eyebrow uppercase text-fg-muted">
                      {w}
                    </div>
                  ))}

                  {cells.map((day, i) => {
                    if (day === null) return <div key={`b${i}`} />
                    const iso = dateOf(day)
                    const event = byDate.get(iso)
                    const isToday = iso === today

                    return (
                      <div
                        key={day}
                        className={cn(
                          'min-h-[76px] rounded-control border border-border p-2',
                          isToday ? 'border-brand-600 bg-brand-600/5' : 'bg-surface',
                        )}
                      >
                        <span
                          className={cn('text-link', isToday ? 'text-brand-700' : 'text-fg-heading')}
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
                {d.events.length === 0 ? (
                  <EmptyState title="Nothing scheduled this month" />
                ) : (
                  d.events.map((e) => (
                    <div key={e.id} className="flex items-center gap-4">
                      <span className="w-8 text-center text-link text-fg-heading">
                        {Number(e.date.slice(-2))}
                      </span>
                      <span className="flex-1 text-fg-body">{e.label}</span>
                      <Badge tone={e.tone}>{e.kind}</Badge>
                    </div>
                  ))
                )}
              </CardBody>
            </Card>
          </div>
        )
      }}
    </QueryState>
  )
}
