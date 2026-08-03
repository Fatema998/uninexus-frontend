import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useNotes } from '../api'

/** LMS Notes — Figma 6:4677. */
export function Notes() {
  const query = useNotes()
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <QueryState query={query}>
      {(d) => {
        const selected = openId ?? d.notes[0]?.id

        return (
          <div className="flex flex-col gap-6">
            <PageHeader title="Notes" subtitle="Your saved study notes." />

            <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
              <Card>
                <CardHeader title="All Notes" />
                <CardBody className="flex flex-col gap-2">
                  {d.notes.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => setOpenId(n.id)}
                      className={cn(
                        'rounded-control border p-3 text-left transition-colors',
                        selected === n.id
                          ? 'border-brand-600 bg-brand-600/5'
                          : 'border-border-strong bg-surface hover:bg-surface-subtle',
                      )}
                    >
                      <p className="text-link text-fg-heading">{n.title}</p>
                      <p className="line-clamp-2 text-fg-muted">{n.snippet}</p>
                    </button>
                  ))}
                </CardBody>
              </Card>

              <Card>
                <CardHeader title={d.open.title}>
                  <Badge tone="brand">{d.open.tag}</Badge>
                </CardHeader>
                <CardBody className="flex flex-col gap-4">
                  {d.open.body.map((p) => (
                    <p key={p} className="text-fg-body">{p}</p>
                  ))}

                  <dl className="grid gap-2 rounded-control bg-surface-subtle p-4 sm:grid-cols-3">
                    {d.open.facts.map((f) => (
                      <div key={f.label}>
                        <dt className="text-eyebrow uppercase text-fg-muted">{f.label}</dt>
                        <dd className="text-link text-fg-heading">{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                </CardBody>
              </Card>
            </div>
          </div>
        )
      }}
    </QueryState>
  )
}
