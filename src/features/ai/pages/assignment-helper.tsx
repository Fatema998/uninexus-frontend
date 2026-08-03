import { BookMarked, PenLine } from 'lucide-react'
import { Badge } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Textarea } from '@/components/ui/textarea'
import { QueryState } from '@/components/states'
import { useAssignmentHelper } from '../api'

/** AI Assignment Helper — Figma 1:7430. */
export function AssignmentHelper() {
  const query = useAssignmentHelper()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="AI Assignment Helper" subtitle="Draft, refine, and cite your work." />

          <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader title="Outline" />
                <CardBody>
                  <ol className="flex flex-col gap-2">
                    {d.outline.map((o) => (
                      <li key={o} className="text-fg-body">{o}</li>
                    ))}
                  </ol>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Draft" icon={PenLine} />
                <CardBody>
                  <Textarea rows={8} defaultValue={d.draft} aria-label="Assignment draft" />
                </CardBody>
              </Card>
            </div>

            <Card>
              <CardHeader title="Suggestions" icon={BookMarked} />
              <CardBody className="flex flex-col gap-3">
                {d.suggestions.map((s) => (
                  <div
                    key={s.text}
                    className="rounded-control border border-border-strong bg-surface p-3"
                  >
                    <Badge tone={s.kind === 'STYLE' ? 'accent' : 'brand'}>{s.kind}</Badge>
                    <p className="mt-2 text-fg-body">{s.text}</p>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </QueryState>
  )
}
