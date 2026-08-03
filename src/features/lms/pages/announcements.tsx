import { Paperclip, Sparkles } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useAnnouncements } from '../api'

/** LMS Course Announcements — Figma 6:6849. */
export function Announcements() {
  const query = useAnnouncements()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Course Announcements" subtitle="Updates from your instructors." />

          <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader title={d.featured.title} />
                <CardBody className="flex flex-col gap-4">
                  <div>
                    <p className="text-link text-fg-heading">{d.featured.from}</p>
                    <p className="text-fg-muted">{d.featured.role}</p>
                  </div>

                  {d.featured.body.map((p) => (
                    <p key={p} className="text-fg-body">{p}</p>
                  ))}

                  <a
                    href="#download"
                    className="flex items-center gap-3 rounded-control border border-border-strong bg-surface p-3 hover:bg-surface-subtle"
                  >
                    <Paperclip className="size-4.5 shrink-0 text-fg-muted" aria-hidden />
                    <span className="min-w-0">
                      <span className="block truncate text-link text-brand-700">
                        {d.featured.attachment.name}
                      </span>
                      <span className="block text-fg-muted">{d.featured.attachment.meta}</span>
                    </span>
                  </a>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Recent Updates" />
                <CardBody className="flex flex-col gap-4">
                  {d.recent.map((r) => (
                    <div key={r.title} className="border-l-2 border-nav-active-student pl-3">
                      <p className="text-link text-fg-heading">{r.title}</p>
                      <p className="text-fg-muted">{r.body}</p>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </div>

            <div className="rounded-card border border-accent-600/20 bg-accent-600/5 p-4">
              <p className="mb-1 flex items-center gap-2 text-link text-accent-600">
                <Sparkles className="size-4" aria-hidden />
                Smart Summary
              </p>
              <p className="text-fg-body">{d.summary}</p>
            </div>
          </div>
        </div>
      )}
    </QueryState>
  )
}
