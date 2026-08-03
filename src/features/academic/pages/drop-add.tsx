import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AssistantPanel } from '@/components/patterns/assistant-panel'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { QueryState } from '@/components/states'
import { useDropAdd } from '../api'

const FULL_TIME_MINIMUM = 12

/** Drop/Add Course — Figma 6:10404. */
export function DropAdd() {
  const query = useDropAdd()
  const [dropping, setDropping] = useState<string[]>([])

  return (
    <QueryState query={query}>
      {(d) => {
        const remaining = d.enrolled
          .filter((c) => !dropping.includes(c.code))
          .reduce((sum, c) => sum + c.credits, 0)
        const belowMinimum = remaining < FULL_TIME_MINIMUM

        const toggle = (code: string) =>
          setDropping((prev) =>
            prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
          )

        return (
          <div className="flex flex-col gap-6">
            <PageHeader title="Drop / Add Course" subtitle="Adjust your enrolment before the deadline." />

            <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
              <Card>
                <CardHeader title="Enrolled Courses" />
                <CardBody className="flex flex-col gap-3">
                  {d.enrolled.map((c) => {
                    const marked = dropping.includes(c.code)
                    return (
                      <div
                        key={c.code}
                        className={cn(
                          'flex flex-wrap items-center justify-between gap-3 rounded-control border p-4 transition-colors',
                          marked
                            ? 'border-danger/40 bg-danger/5'
                            : 'border-border-strong bg-surface',
                        )}
                      >
                        <div className="min-w-0">
                          <p
                            className={cn(
                              'text-link text-fg-heading',
                              marked && 'line-through decoration-danger',
                            )}
                          >
                            {c.name}
                          </p>
                          <p className="text-fg-muted">
                            {c.code} • {c.teacher} • {c.credits} Credits
                          </p>
                        </div>
                        <Button
                          variant={marked ? 'outline' : 'destructive'}
                          size="sm"
                          onClick={() => toggle(c.code)}
                        >
                          {marked ? 'Undo' : 'Drop'}
                        </Button>
                      </div>
                    )
                  })}
                </CardBody>
              </Card>

              <aside className="flex flex-col gap-6">
                <Card>
                  <CardHeader title="Academic Summary" />
                  <CardBody className="flex flex-col gap-2">
                    {d.summary.map((s) => (
                      <div key={s.label} className="flex items-baseline justify-between gap-3">
                        <span className="text-fg-muted">{s.label}</span>
                        <span className="text-link text-fg-heading">{s.value}</span>
                      </div>
                    ))}

                    <div className="mt-2 flex items-baseline justify-between border-t border-border pt-3">
                      <span className="text-eyebrow uppercase text-fg-muted">After changes</span>
                      <span className={cn('text-link', belowMinimum ? 'text-danger' : 'text-success')}>
                        {remaining} credits
                      </span>
                    </div>

                    {belowMinimum && (
                      <p role="alert" className="flex items-start gap-2 text-danger">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
                        Below the {FULL_TIME_MINIMUM}-credit full-time minimum. This may affect your
                        enrolment status.
                      </p>
                    )}

                    <Button disabled={dropping.length === 0} className="mt-2 h-11 w-full text-body">
                      Confirm changes {dropping.length > 0 && `(${dropping.length})`}
                    </Button>
                  </CardBody>
                </Card>

                <AssistantPanel {...d.assistant} />
              </aside>
            </div>
          </div>
        )
      }}
    </QueryState>
  )
}
