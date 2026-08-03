import { Download, FileText } from 'lucide-react'
import { Badge } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useDownloads } from '../api'

/** LMS Downloads — Figma 6:5838. */
export function Downloads() {
  const query = useDownloads()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Offline Downloads" subtitle="Materials saved for offline study." />

          <Card>
            <CardHeader title="Downloads" icon={Download} />
            <CardBody className="flex flex-col gap-3">
              {d.files.map((f) => (
                <div
                  key={f.name}
                  className="flex flex-wrap items-center gap-4 rounded-control border border-border-strong bg-surface p-4"
                >
                  <FileText className="size-4.5 shrink-0 text-fg-muted" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-link text-fg-heading">{f.name}</p>
                    <p className="text-fg-muted">{f.course} • {f.size}</p>
                  </div>
                  <Badge tone={f.done ? 'success' : 'warning'}>
                    {f.done ? 'Available offline' : 'Downloading'}
                  </Badge>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}
    </QueryState>
  )
}
