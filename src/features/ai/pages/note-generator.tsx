import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useNoteGenerator } from '../api'

/** AI Note Generator — Figma 1:6831. */
export function NoteGenerator() {
  const query = useNoteGenerator()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="AI Note Generator" subtitle={d.title} />

          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            <Card>
              <CardHeader title="Table of Contents" />
              <CardBody>
                <ol className="flex flex-col gap-2">
                  {d.toc.map((t, i) => (
                    <li key={t} className="flex gap-2 text-fg-body">
                      <span className="text-fg-muted">{i + 1}.</span>
                      {t}
                    </li>
                  ))}
                </ol>
              </CardBody>
            </Card>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader title={d.title} />
                <CardBody className="flex flex-col gap-4">
                  <p className="text-fg-body">{d.intro}</p>

                  {d.facts.map((f) => (
                    <div key={f.formula} className="rounded-control bg-surface-subtle p-4">
                      <p className="text-card-title text-brand-700">{f.formula}</p>
                      <p className="mt-1 text-fg-muted">{f.note}</p>
                    </div>
                  ))}
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Recent Generation" />
                <CardBody className="flex flex-col gap-2">
                  {d.recent.map((r) => (
                    <p key={r} className="rounded-control border border-border-strong bg-surface p-3 text-fg-body">
                      {r}
                    </p>
                  ))}
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      )}
    </QueryState>
  )
}
