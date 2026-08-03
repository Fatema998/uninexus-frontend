import { FileText, Wifi } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AssistantPanel } from '@/components/patterns/assistant-panel'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { ProgressBar } from '@/components/patterns/progress-bar'
import { QueryState } from '@/components/states'
import { useClassRoutine } from '../api'
import type { MetricTone } from '@/components/patterns/metric-card'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

const SLOT_TONE: Record<MetricTone, string> = {
  brand: 'border-brand-600/30 bg-brand-600/10',
  accent: 'border-accent-600/30 bg-accent-600/10',
  info: 'border-info/30 bg-info/10',
  success: 'border-success/30 bg-success/10',
  warning: 'border-warning/30 bg-warning/10',
  danger: 'border-danger/30 bg-danger/10',
}

/** Class Routine — Figma 6:8554. */
export function ClassRoutine() {
  const query = useClassRoutine()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Class Routine" subtitle="Your weekly timetable." />

          <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
            <Card>
              <CardHeader title="This Week" />
              <CardBody>
                {/* Days scroll horizontally rather than squashing on narrow screens. */}
                <div className="overflow-x-auto">
                  <div className="grid min-w-[640px] grid-cols-5 gap-3">
                    {DAYS.map((day) => (
                      <div key={day}>
                        <p className="mb-2 text-eyebrow uppercase text-fg-muted">{day}</p>
                        <div className="flex flex-col gap-2">
                          {d.slots
                            .filter((s) => s.day === day)
                            .map((s) => (
                              <div
                                key={`${s.day}-${s.start}`}
                                className={cn('rounded-control border p-3', SLOT_TONE[s.tone])}
                              >
                                <p className="text-eyebrow uppercase text-fg-muted">{s.start}</p>
                                <p className="text-link text-fg-heading">{s.title}</p>
                                <p className="text-fg-muted">{s.room}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>

            <aside className="flex flex-col gap-6">
              <Card>
                <CardHeader title="Daily Goal" />
                <CardBody>
                  <p className="text-metric text-brand-700">{d.dailyGoal}%</p>
                  <ProgressBar value={d.dailyGoal} label="Daily study goal" className="mt-3" />
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Recent Files" icon={FileText} />
                <CardBody className="flex flex-col gap-3">
                  {d.files.map((f) => (
                    <div key={f.name} className="flex items-center gap-3">
                      <FileText className="size-4.5 shrink-0 text-fg-muted" aria-hidden />
                      <div className="min-w-0">
                        <p className="truncate text-link text-fg-heading">{f.name}</p>
                        <p className="truncate text-fg-muted">{f.meta}</p>
                      </div>
                    </div>
                  ))}
                  <p className="mt-1 flex items-center gap-2 border-t border-border pt-3 text-fg-muted">
                    <Wifi className="size-4" aria-hidden />
                    {d.wifi}
                  </p>
                </CardBody>
              </Card>

              <AssistantPanel {...d.assistant} />
            </aside>
          </div>
        </div>
      )}
    </QueryState>
  )
}
