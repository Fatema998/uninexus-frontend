import { Link } from 'react-router'
import { MessageSquare, Sparkles } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useAiOverview } from '../api'

/** AI Assistant Overview — Figma 1:5657. */
export function AiOverview() {
  const query = useAiOverview()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader
            title="AI Assistant"
            subtitle="Your academic copilot across every course."
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {d.metrics.map((m) => (
              <MetricCard key={m.label} label={m.label} value={m.value} tone={m.tone} />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
            <Card>
              <CardHeader title="Quick Academic Actions" />
              <CardBody className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {d.actions.map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    className="rounded-control border border-border-strong bg-surface p-4 text-left transition-colors hover:bg-surface-subtle"
                  >
                    <p className="text-link text-fg-heading">{a.label}</p>
                    <p className="text-fg-muted">{a.note}</p>
                  </button>
                ))}
              </CardBody>
            </Card>

            <aside className="flex flex-col gap-6">
              <Card>
                <CardHeader
                  title="Recent Chats"
                  icon={MessageSquare}
                  action={{ label: 'Open chat', to: '/student/ai/chat' }}
                />
                <CardBody className="flex flex-col gap-3">
                  {d.recent.map((r) => (
                    <Link
                      key={r.title}
                      to="/student/ai/chat"
                      className="rounded-control border border-border-strong bg-surface p-3 hover:bg-surface-subtle"
                    >
                      <p className="truncate text-link text-fg-heading">{r.title}</p>
                      <p className="truncate text-fg-muted">{r.snippet}</p>
                    </Link>
                  ))}
                </CardBody>
              </Card>

              <div className="rounded-card border border-accent-600/20 bg-accent-600/5 p-4">
                <p className="mb-1 flex items-center gap-2 text-link text-accent-600">
                  <Sparkles className="size-4" aria-hidden />
                  AI Training Status
                </p>
                <p className="text-fg-body">{d.trainingStatus}</p>
              </div>
            </aside>
          </div>
        </div>
      )}
    </QueryState>
  )
}
