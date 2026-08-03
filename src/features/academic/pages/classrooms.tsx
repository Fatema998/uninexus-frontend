import { Users } from 'lucide-react'
import { AssistantPanel } from '@/components/patterns/assistant-panel'
import { Badge } from '@/components/patterns/badge'
import { Card, CardBody } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useClassrooms } from '../api'

/** Classroom Information — Figma 6:8199. */
export function Classrooms() {
  const query = useClassrooms()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Classroom Information" subtitle="Rooms, capacity, and what is running right now." />

          <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
            <div className="grid gap-4 md:grid-cols-2">
              {d.rooms.map((r) => (
                <Card key={r.name}>
                  <CardBody>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-link text-fg-heading">{r.name}</p>
                        <p className="text-fg-muted">{r.building}</p>
                      </div>
                      <Badge tone={r.session ? 'warning' : 'success'}>
                        {r.session ? 'In Session' : 'Free'}
                      </Badge>
                    </div>

                    <p className="mt-3 flex items-center gap-1.5 text-fg-muted">
                      <Users className="size-4" aria-hidden />
                      Capacity {r.capacity}
                    </p>

                    {r.session && (
                      <div className="mt-3 rounded-control bg-surface-subtle p-3">
                        <p className="text-eyebrow uppercase text-fg-muted">Current Session</p>
                        <p className="text-link text-fg-heading">{r.session.title}</p>
                        <p className="text-fg-muted">{r.session.endsIn}</p>
                      </div>
                    )}
                  </CardBody>
                </Card>
              ))}
            </div>

            <AssistantPanel {...d.assistant} />
          </div>
        </div>
      )}
    </QueryState>
  )
}
