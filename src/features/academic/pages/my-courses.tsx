import { useState } from 'react'
import { Search } from 'lucide-react'
import { AssistantPanel } from '@/components/patterns/assistant-panel'
import { Badge } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { ProgressBar } from '@/components/patterns/progress-bar'
import { EmptyState, QueryState } from '@/components/states'
import { useMyCourses } from '../api'

/** My Courses — Figma 6:11399. */
export function MyCourses() {
  const query = useMyCourses()
  const [filter, setFilter] = useState('')

  return (
    <QueryState query={query}>
      {(d) => {
        const term = filter.trim().toLowerCase()
        const shown = term
          ? d.courses.filter(
              (c) => c.name.toLowerCase().includes(term) || c.code.toLowerCase().includes(term),
            )
          : d.courses

        return (
          <div className="flex flex-col gap-6">
            <PageHeader title="My Courses" subtitle="Everything you are enrolled in this term." />

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {d.metrics.map((m) => (
                <MetricCard key={m.label} label={m.label} value={m.value} tone={m.tone} />
              ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
              <Card>
                <CardHeader title="Enrolled Courses" />
                <CardBody className="flex flex-col gap-4">
                  <label className="relative flex items-center">
                    <Search className="pointer-events-none absolute left-3 size-4.5 text-fg-muted" aria-hidden />
                    <span className="sr-only">Filter courses</span>
                    <input
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      placeholder="Filter by code or name"
                      className="h-10 w-full rounded-control border border-border-strong bg-surface pl-10 pr-3 outline-none focus-visible:border-brand-600"
                    />
                  </label>

                  {shown.length === 0 ? (
                    <EmptyState
                      title="No matching courses"
                      description={`Nothing matches “${filter}”. Try a different code or name.`}
                    />
                  ) : (
                    shown.map((c) => (
                      <article
                        key={c.code}
                        className="rounded-control border border-border-strong bg-surface p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-link text-fg-heading">{c.name}</p>
                            <p className="text-fg-muted">
                              {c.code} • {c.teacher} • {c.credits} credits
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge tone={c.status === 'ENROLLED' ? 'success' : 'neutral'}>
                              {c.status}
                            </Badge>
                            <p
                              className={
                                c.grade === 'N/A' ? 'mt-1 text-fg-muted' : 'mt-1 text-link text-fg-heading'
                              }
                            >
                              Grade: {c.grade}
                            </p>
                          </div>
                        </div>
                        <ProgressBar
                          value={c.progress}
                          tone={c.status === 'PENDING' ? 'warning' : 'brand'}
                          label={`${c.name} progress`}
                          className="mt-3"
                        />
                      </article>
                    ))
                  )}
                </CardBody>
              </Card>

              <AssistantPanel {...d.assistant} />
            </div>
          </div>
        )
      }}
    </QueryState>
  )
}
