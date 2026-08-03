import { useParams } from 'react-router'
import { CheckCircle2, Play } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { ProgressBar } from '@/components/patterns/progress-bar'
import { QueryState } from '@/components/states'
import { useLectures } from '../api'
import { duration } from '@/lib/format'

/** LMS Video Lectures — Figma 6:1451. */
export function Lectures() {
  const { id = '' } = useParams()
  const query = useLectures(id)

  return (
    <QueryState query={query}>
      {(d) => {
        const watched = d.lectures.filter((l) => l.watched).length
        const pct = Math.round((watched / d.lectures.length) * 100)

        return (
          <div className="flex flex-col gap-6">
            <PageHeader title="Video Lectures" subtitle={id} />

            <Card>
              <CardHeader title={d.moduleTitle} />
              <CardBody>
                <p className="text-fg-body">{d.summary}</p>
                <ProgressBar value={pct} label="Lectures watched" className="mt-4" />
                <p className="mt-2 text-fg-muted">
                  {watched} of {d.lectures.length} watched
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Lectures" />
              <CardBody className="flex flex-col gap-3">
                {d.lectures.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center gap-4 rounded-control border border-border-strong bg-surface p-4"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-control bg-brand-600/10 text-brand-700">
                      {l.watched ? (
                        <CheckCircle2 className="size-4 text-success" aria-hidden />
                      ) : (
                        <Play className="size-4" aria-hidden />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-link text-fg-heading">{l.title}</p>
                      <p className="text-fg-muted">
                        {duration(l.durationSeconds, 'clock')}
                        {!l.watched && l.positionSeconds > 0 &&
                          ` • resumes at ${duration(l.positionSeconds, 'clock')}`}
                      </p>
                    </div>
                    {l.watched && <span className="text-fg-muted">Watched</span>}
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
