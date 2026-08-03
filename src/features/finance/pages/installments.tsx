import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge, type BadgeTone } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { money } from '@/lib/format'
import { useInstallments } from '../api'

const TONE: Record<string, BadgeTone> = {
  CLEARED: 'success',
  DUE: 'warning',
  UPCOMING: 'neutral',
}

/** Installment Plan — Figma 1:12857. */
export function Installments() {
  const query = useInstallments()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader
            title="Installment Plan"
            subtitle={`${d.student.name} • ID: ${d.student.id}`}
          />

          <Card>
            <CardHeader title="Plan Steps" />
            <CardBody>
              <ol className="flex flex-col">
                {d.steps.map((s, i) => (
                  <li key={s.step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          'mt-1.5 size-3 shrink-0 rounded-full',
                          s.state === 'CLEARED' && 'bg-success',
                          s.state === 'DUE' && 'bg-warning ring-4 ring-warning/20',
                          s.state === 'UPCOMING' && 'bg-track',
                        )}
                        aria-hidden
                      />
                      {i < d.steps.length - 1 && <span className="w-px flex-1 bg-border" aria-hidden />}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-eyebrow uppercase text-fg-muted">{s.step}</p>
                        <Badge tone={TONE[s.state]}>{s.state}</Badge>
                      </div>
                      <p className="text-link text-fg-heading">{s.label}</p>
                      <p className="text-metric text-brand-700">{money(s.amount)}</p>
                      <p className="text-fg-muted">{s.note}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardBody>
          </Card>

          <div className="rounded-card border border-accent-600/20 bg-accent-600/5 p-4">
            <p className="flex items-start gap-2 text-fg-body">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-accent-600" aria-hidden />
              {d.tip}
            </p>
          </div>
        </div>
      )}
    </QueryState>
  )
}
