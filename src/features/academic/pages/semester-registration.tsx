import { useState } from 'react'
import { UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge, type BadgeTone } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { QueryState } from '@/components/states'
import { useSemesterRegistration } from '../api'
import { date, money } from '@/lib/format'
import type { AdvisorApprovalState } from '@/types'

const APPROVAL_TONE: Record<AdvisorApprovalState, BadgeTone> = {
  NOT_SUBMITTED: 'neutral',
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
}

/** Semester Registration — Figma 6:11107. */
export function SemesterRegistration() {
  const query = useSemesterRegistration()
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <QueryState query={query}>
      {(d) => {
        // Default to whichever semester is actually open.
        const active = selected ?? d.terms.find((s) => s.state === 'OPEN')?.id ?? null

        return (
          <div className="flex flex-col gap-6">
            <PageHeader title="Semester Registration" subtitle="Register for an upcoming semester." />

            <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
              <Card>
                <CardHeader title="Available Semesters" />
                <CardBody className="flex flex-col gap-3">
                  {d.terms.map((s) => {
                    const open = s.state === 'OPEN'
                    const isActive = active === s.id

                    return (
                      <button
                        key={s.id}
                        type="button"
                        disabled={!open}
                        onClick={() => setSelected(s.id)}
                        className={cn(
                          'flex items-center justify-between gap-3 rounded-control border p-4 text-left transition-colors',
                          isActive
                            ? 'border-brand-600 bg-brand-600/5'
                            : 'border-border-strong bg-surface',
                          open ? 'hover:bg-surface-subtle' : 'cursor-not-allowed opacity-60',
                        )}
                      >
                        <div>
                          <p className="text-link text-fg-heading">{s.name}</p>
                          <p className="text-fg-muted">
                            {open
                              ? `Registration open until ${date(s.closesAt)}`
                              : `Opens ${date(s.opensAt)}`}
                          </p>
                        </div>
                        <Badge tone={open ? 'success' : 'neutral'}>{s.state}</Badge>
                      </button>
                    )
                  })}
                </CardBody>
              </Card>

              <aside className="flex flex-col gap-6">
                <Card>
                  <CardHeader title="Academic Advisor" icon={UserRound} />
                  <CardBody>
                    <p className="text-link text-fg-heading">{d.advisor.name}</p>
                    <p className="text-fg-muted">{d.advisor.department}</p>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader title="Registration Summary" />
                  <CardBody className="flex flex-col gap-2">
                    <Row label="Courses selected" value={String(d.selection.courseCount)} />
                    <Row label="Total credits" value={String(d.selection.totalCredits)} />
                    <Row label="Estimated fee" value={money(d.selection.estimatedFee)} />
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-fg-muted">Advisor approval</span>
                      <Badge tone={APPROVAL_TONE[d.approval]}>{d.approval.replace('_', ' ')}</Badge>
                    </div>

                    <Button
                      disabled={!active || d.selection.courseCount === 0 || d.approval === 'PENDING'}
                      className="mt-3 h-11 w-full text-body"
                    >
                      {d.approval === 'PENDING' ? 'Awaiting advisor' : 'Submit registration'}
                    </Button>
                  </CardBody>
                </Card>
              </aside>
            </div>
          </div>
        )
      }}
    </QueryState>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-fg-muted">{label}</span>
      <span className="text-link text-fg-heading">{value}</span>
    </div>
  )
}
