import { Printer, ShieldAlert } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { QueryState } from '@/components/states'
import { date, timeRange } from '@/lib/format'
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
            subtitle={
              d.readinessPercent !== null ? `Exam readiness: ${d.readinessPercent}%` : undefined
            }
            action={
              d.card ? (
                <Button onClick={() => window.print()} className="h-11 text-body print:hidden">
                  <Printer className="size-4" aria-hidden />
                  Print
                </Button>
              ) : undefined
            }
          />

          {/* A blocked card must say why. A blank one the night before an exam
              is the worst thing this screen can do to a student. */}
          {d.card === null ? (
            <div className="rounded-card border border-danger/20 bg-danger/5 p-6">
              <p className="mb-1 flex items-center gap-2 text-card-title text-danger">
                <ShieldAlert className="size-4.5" aria-hidden />
                Admit card not issued
              </p>
              <p className="text-fg-body">
                {d.blockedReason ?? 'Contact the examination office for details.'}
              </p>
            </div>
          ) : (
            <Card>
              <CardHeader title="Candidate Details" />
              <CardBody>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <Field label="Candidate Name" value={d.card.candidateName} />
                  <Field label="Student ID / Roll No." value={d.card.registrationNo} />
                  <Field label="Degree Programme" value={d.card.programme} />
                  <Field label="Department" value={d.card.department} />
                  <Field label="Exam Center" value={d.card.examCenter} />
                  <Field label="Date of Issue" value={date(d.card.issuedOn)} />
                </dl>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader title="Permitted Exams" />
            <CardBody className="flex flex-col gap-3">
              {d.exams.map((e) => (
                <div
                  key={e.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-border-strong bg-surface p-4"
                >
                  <div>
                    <p className="text-link text-fg-heading">{e.course.title}</p>
                    <p className="text-fg-muted">
                      {e.course.code} • {e.venue}
                      {e.seatNo && ` • Seat ${e.seatNo}`}
                    </p>
                  </div>
                  <p className="text-fg-muted">
                    {date(e.startsAt)} • {timeRange(e.startsAt, e.endsAt)}
                  </p>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}
    </QueryState>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-eyebrow uppercase text-fg-muted">{label}</dt>
      <dd className="text-link text-fg-heading">{value}</dd>
    </div>
  )
}
