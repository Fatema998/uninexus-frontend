import { Radio, Video } from 'lucide-react'
import { Badge } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { EmptyState, QueryState } from '@/components/states'
import { useLiveClasses } from '../api'
import { dateTime, relative } from '@/lib/format'

/** LMS Live Classes — Figma 6:1780. */
export function LiveClasses() {
  const query = useLiveClasses()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Live Classes" subtitle="Join a session or catch the next one." />

          <Card>
            <CardHeader title="Happening Now" icon={Radio} />
            <CardBody className="flex flex-col gap-3">
              {d.live.length === 0 ? (
                <EmptyState title="Nothing live right now" description="Your next session appears below." />
              ) : (
                d.live.map((l) => (
                  <div
                    key={l.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-success/30 bg-success/5 p-4"
                  >
                    <div>
                      <p className="flex items-center gap-2 text-link text-fg-heading">
                        <span className="size-1.5 rounded-full bg-success-dot" aria-hidden />
                        {l.title}
                      </p>
                      <p className="text-fg-muted">
                        {l.instructorName} • started {relative(l.startedAt)}
                      </p>
                    </div>
                    <Button size="sm" asChild>
                      <a href={l.joinUrl} target="_blank" rel="noreferrer">
                        Join now
                      </a>
                    </Button>
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Upcoming" icon={Video} />
            <CardBody className="flex flex-col gap-3">
              {d.upcoming.map((u) => (
                <div
                  key={u.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-border-strong bg-surface p-4"
                >
                  <div>
                    <p className="text-link text-fg-heading">{u.title}</p>
                    <p className="text-fg-muted">
                      {dateTime(u.startsAt)} • {u.instructorName}
                    </p>
                  </div>
                  <Badge tone="neutral">Scheduled</Badge>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}
    </QueryState>
  )
}
