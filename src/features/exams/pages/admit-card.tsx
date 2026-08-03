import { Printer, Sparkles } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { QueryState } from '@/components/states'
import { useAdmitCard } from '../api'

/**
 * Admit Card — Figma 1:10550.
 * Printable: the shell chrome is hidden at print via `print:hidden` on the
 * actions, so a browser print gives a clean card.
 */
export function AdmitCard() {
  const query = useAdmitCard()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader
            title="Admit Card"
            subtitle={d.readiness}
            action={
              <Button onClick={() => window.print()} className="h-11 text-body print:hidden">
                <Printer className="size-4" aria-hidden />
                Print
              </Button>
            }
          />

          <Card>
            <CardHeader title="Candidate Details" />
            <CardBody>
              <dl className="grid gap-4 sm:grid-cols-2">
                {d.fields.map((f) => (
                  <div key={f.label}>
                    <dt className="text-eyebrow uppercase text-fg-muted">{f.label}</dt>
                    <dd className="text-link text-fg-heading">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Permitted Exams" />
            <CardBody className="flex flex-col gap-3">
              {d.exams.map((e) => (
                <div
                  key={e.code}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-border-strong bg-surface p-4"
                >
                  <div>
                    <p className="text-link text-fg-heading">{e.name}</p>
                    <p className="text-fg-muted">{e.code} • {e.venue}</p>
                  </div>
                  <p className="text-fg-muted">{e.date} • {e.time}</p>
                </div>
              ))}
            </CardBody>
          </Card>

          <div className="rounded-card border border-accent-600/20 bg-accent-600/5 p-4 print:hidden">
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
