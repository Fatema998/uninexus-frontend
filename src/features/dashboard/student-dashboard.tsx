import { CalendarPlus, Send, Sparkles } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { HeroBanner } from '@/components/patterns/hero-banner'
import { MetricCard } from '@/components/patterns/metric-card'
import { Badge } from '@/components/patterns/badge'
import { Button } from '@/components/ui/button'
import { QueryState } from '@/components/states'
import { useStudentDashboard } from './api'
import { iconFor } from './icon-map'

/**
 * Student Dashboard — Figma 9:6820.
 *
 * Section structure (hero → summary cards → centre + right rail) is taken
 * from the frame. Inner content follows the Academic Overview frame (6:7179),
 * which shares the same card vocabulary — the 9:6820 render could not be
 * retrieved. This is the least-verified of the three dashboards; check it
 * against the frame before Phase 4.
 */
export function StudentDashboard() {
  const query = useStudentDashboard()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <HeroBanner badge={d.hero.badge} heading={d.hero.heading}>
            {d.hero.body}
          </HeroBanner>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {d.metrics.map((m) => (
              <MetricCard
                key={m.label}
                label={m.label}
                value={m.value}
                unit={m.unit}
                tone={m.tone}
                icon={iconFor(m.icon)}
                progress={m.progress}
              />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
            <Card>
              <CardHeader title="Active Courses" action={{ label: 'View Schedule', to: '/student/academic/routine' }} />
              <CardBody className="flex flex-col gap-4">
                {d.courses.map((c) => (
                  <div
                    key={c.name}
                    className="flex items-center gap-6 rounded-control border border-border-strong bg-surface p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-link text-fg-heading">{c.name}</p>
                      <p className="truncate text-fg-muted">{c.teacher}</p>
                    </div>
                    <div className="text-right">
                      <Badge tone={c.status === 'ENROLLED' ? 'success' : 'neutral'}>{c.status}</Badge>
                      <p className={c.grade === 'N/A' ? 'mt-1 text-fg-muted' : 'mt-1 text-link text-fg-heading'}>
                        Grade: {c.grade}
                      </p>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>

            <aside className="flex flex-col gap-6">
              <Card>
                <CardHeader title="Upcoming Deadlines" />
                <CardBody className="flex flex-col gap-4">
                  {d.deadlines.map((dl) => (
                    <div key={dl.title} className="flex gap-4">
                      <div className="w-10 shrink-0 text-center">
                        <p className={dl.overdue ? 'text-card-title text-danger' : 'text-card-title'}>{dl.day}</p>
                        <p className="text-eyebrow uppercase text-fg-muted">{dl.month}</p>
                      </div>
                      <div className="border-l border-sidebar-line pl-4">
                        <p className="text-link text-fg-heading">{dl.title}</p>
                        <p className="text-fg-muted">{dl.meta}</p>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-control border-2 border-dashed border-sidebar-line p-4 text-link text-fg-muted hover:bg-surface-subtle"
                  >
                    <CalendarPlus className="size-4" aria-hidden />
                    Add Reminder
                  </button>
                </CardBody>
              </Card>

              <AssistantPanel assistant={d.assistant} />
            </aside>
          </div>
        </div>
      )}
    </QueryState>
  )
}

/** AIAssistantPanel — design.md §3. Composer is inert until PRD §6.8 is settled. */
function AssistantPanel({
  assistant,
}: {
  assistant: { messages: { from: 'ai' | 'me'; text: string }[]; suggestions: string[] }
}) {
  return (
    <Card>
      <CardHeader title="Academic AI" icon={Sparkles}>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-success-dot" aria-hidden />
          <span className="text-eyebrow uppercase text-fg-muted">Always Online</span>
        </span>
      </CardHeader>

      <CardBody className="flex flex-col gap-3">
        {assistant.messages.map((m, i) => (
          <p
            key={i}
            className={
              m.from === 'ai'
                ? 'max-w-[85%] rounded-control bg-surface-subtle p-3 text-fg-body'
                : 'ml-auto max-w-[85%] rounded-control bg-brand-600/10 p-3 text-fg-heading'
            }
          >
            {m.text}
          </p>
        ))}

        <div className="mt-1 flex flex-wrap gap-2">
          {assistant.suggestions.map((s) => (
            <button
              key={s}
              type="button"
              className="rounded-full border border-border-strong px-3 py-1 text-link text-fg-body hover:bg-surface-subtle"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-2 flex gap-2">
          <label className="flex-1">
            <span className="sr-only">Ask the assistant</span>
            <input
              placeholder="Ask anything…"
              className="h-10 w-full rounded-control border border-border-strong bg-surface px-3 outline-none focus-visible:border-brand-600"
            />
          </label>
          <Button size="icon-lg" aria-label="Send">
            <Send className="size-4" aria-hidden />
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}
