import { Sparkles } from 'lucide-react'
import { Badge } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useRecommendations } from '../api'

/** AI Course Recommendation — Figma 1:8101. */
export function Recommendations() {
  const query = useRecommendations()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Course Recommendations" subtitle={`Target track: ${d.track}`} />

          <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
            <div className="flex flex-col gap-6">
              {d.primary.map((c) => (
                <Card key={c.id}>
                  <CardHeader title={c.course.title}>
                    <Badge tone="success">{c.matchPercent}% Match</Badge>
                  </CardHeader>
                  <CardBody>
                    <p className="text-fg-muted">
                      {c.course.code} • {c.course.credits} Credits
                    </p>
                    {c.why && (
                      <>
                        <p className="mt-2 text-eyebrow uppercase text-fg-muted">Why this course?</p>
                        <p className="mt-1 text-fg-body">{c.why}</p>
                      </>
                    )}
                  </CardBody>
                </Card>
              ))}

              <Card>
                <CardHeader title="Also Worth Considering" />
                <CardBody className="flex flex-col gap-3">
                  {d.others.map((o) => (
                    <div
                      key={o.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-border-strong bg-surface p-4"
                    >
                      <p className="text-link text-fg-heading">{o.course.title}</p>
                      <p className="text-fg-muted">
                        {o.matchPercent}% Match • {o.course.credits} Credits
                      </p>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </div>

            <aside className="flex flex-col gap-6">
              <Card>
                <CardHeader title="Future Ready Profile" />
                <CardBody>
                  <p className="text-fg-body">{d.futureReady}</p>
                </CardBody>
              </Card>

              <div className="rounded-card border border-accent-600/20 bg-accent-600/5 p-4">
                <p className="mb-1 flex items-center gap-2 text-link text-accent-600">
                  <Sparkles className="size-4" aria-hidden />
                  AI Advice
                </p>
                <p className="text-fg-body">{d.advice}</p>
              </div>
            </aside>
          </div>
        </div>
      )}
    </QueryState>
  )
}
