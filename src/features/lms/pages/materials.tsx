import { useParams } from 'react-router'
import { FolderOpen } from 'lucide-react'
import { Card, CardBody } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useMaterials } from '../api'
import type { MetricTone } from '@/components/patterns/metric-card'

const TILE: Record<MetricTone, string> = {
  brand: 'bg-brand-600/10 text-brand-700',
  accent: 'bg-accent-600/10 text-accent-600',
  info: 'bg-info/10 text-info',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
}

/** LMS Course Materials — Figma 6:2191. */
export function Materials() {
  const { id = '' } = useParams()
  const query = useMaterials(id)

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Course Materials" subtitle={id} />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {d.groups.map((g) => (
              <Card key={g.label}>
                <CardBody>
                  <span className={`grid size-10 place-items-center rounded-control ${TILE[g.tone]}`}>
                    <FolderOpen className="size-4.5" aria-hidden />
                  </span>
                  <p className="mt-4 text-link text-fg-heading">{g.label}</p>
                  <p className="text-fg-muted">{g.files} Files • {g.size}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}
    </QueryState>
  )
}
