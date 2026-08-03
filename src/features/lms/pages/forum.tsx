import { MessageSquare, Pin } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { QueryState } from '@/components/states'
import { useForum } from '../api'

/** LMS Discussion Forum — Figma 6:3933. */
export function Forum() {
  const query = useForum()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader
            title="Discussion Forum"
            subtitle="Ask, answer, and follow course threads."
            action={<Button className="h-11 text-body">New thread</Button>}
          />

          <Card>
            <CardHeader title="Threads" icon={MessageSquare} />
            <CardBody className="flex flex-col gap-3">
              {d.threads.map((t) => (
                <article
                  key={t.title}
                  className="flex flex-wrap items-center gap-4 rounded-control border border-border-strong bg-surface p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-link text-fg-heading">
                      {t.pinned && <Pin className="size-3.5 shrink-0 text-brand-700" aria-hidden />}
                      <span className="truncate">{t.title}</span>
                    </p>
                    <p className="truncate text-fg-muted">{t.course} • {t.snippet}</p>
                  </div>
                  <span className="shrink-0 text-fg-muted">{t.replies} replies</span>
                </article>
              ))}
            </CardBody>
          </Card>
        </div>
      )}
    </QueryState>
  )
}
