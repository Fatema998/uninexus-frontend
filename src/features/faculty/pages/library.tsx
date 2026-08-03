import { BookOpen } from 'lucide-react'
import { Badge } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useFacultyLibrary } from '../api'

/** Faculty Library Resources — Figma 1:5381. */
export function FacultyLibrary() {
  const query = useFacultyLibrary()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Library Resources" subtitle="Titles available to faculty." />

          <Card>
            <CardHeader title="Catalogue" icon={BookOpen} />
            <CardBody className="grid gap-3 md:grid-cols-2">
              {d.items.map((i) => (
                <div
                  key={i.title}
                  className="flex items-start justify-between gap-3 rounded-control border border-border-strong bg-surface p-4"
                >
                  <div className="min-w-0">
                    <p className="text-link text-fg-heading">{i.title}</p>
                    <p className="truncate text-fg-muted">{i.author}</p>
                  </div>
                  <Badge tone="brand">{i.kind}</Badge>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}
    </QueryState>
  )
}
