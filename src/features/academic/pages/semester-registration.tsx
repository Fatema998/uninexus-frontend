import { useState } from 'react'
import { UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { QueryState } from '@/components/states'
import { useSemesterRegistration } from '../api'

/** Semester Registration — Figma 6:11107. */
export function SemesterRegistration() {
  const query = useSemesterRegistration()
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <QueryState query={query}>
      {(d) => {
        // Default to whichever semester is actually open.
        const active = selected ?? d.semesters.find((s) => s.state === 'OPEN')?.name ?? null

        return (
          <div className="flex flex-col gap-6">
            <PageHeader title="Semester Registration" subtitle="Register for an upcoming semester." />

            <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
              <Card>
                <CardHeader title="Available Semesters" />
                <CardBody className="flex flex-col gap-3">
                  {d.semesters.map((s) => {
                    const open = s.state === 'OPEN'
                    const isActive = active === s.name

                    return (
                      <button
                        key={s.name}
                        type="button"
                        disabled={!open}
                        onClick={() => setSelected(s.name)}
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
                          <p className="text-fg-muted">{s.window}</p>
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
                    <p className="text-fg-muted">{d.advisor.dept}</p>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader title="Registration Summary" />
                  <CardBody className="flex flex-col gap-2">
                    {d.summary.map((s) => (
                      <div key={s.label} className="flex items-baseline justify-between gap-3">
                        <span className="text-fg-muted">{s.label}</span>
                        <span className="text-link text-fg-heading">{s.value}</span>
                      </div>
                    ))}
                    <Button disabled={!active} className="mt-3 h-11 w-full text-body">
                      Submit registration
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
