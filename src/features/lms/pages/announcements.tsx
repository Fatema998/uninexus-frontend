import { useState } from 'react'
import { Paperclip } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { EmptyState, QueryState } from '@/components/states'
import { fileSize, relative } from '@/lib/format'
import { useAnnouncements, useMarkAnnouncementRead } from '../api'

/** LMS Course Announcements — Figma 6:6849. */
export function Announcements() {
  const query = useAnnouncements()
  const markRead = useMarkAnnouncementRead()
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <QueryState query={query}>
      {(d) => {
        // The pinned one leads, as in the design; everything else is "recent".
        const featured =
          d.announcements.find((a) => a.id === openId) ??
          d.announcements.find((a) => a.pinned) ??
          d.announcements[0] ??
          null
        const rest = d.announcements.filter((a) => a.id !== featured?.id)

        function open(id: string, read: boolean) {
          setOpenId(id)
          // Fire-and-forget: a missed read-receipt is invisible, and a toast
          // about one is noise. See docs/api/student.md §6.3.
          if (!read) markRead.mutate(id)
        }

        return (
          <div className="flex flex-col gap-6">
            <PageHeader
              title="Course Announcements"
              subtitle={
                d.unreadCount > 0
                  ? `${d.unreadCount} unread update${d.unreadCount === 1 ? '' : 's'}.`
                  : 'You are up to date.'
              }
            />

            {featured === null ? (
              <Card>
                <CardBody>
                  <EmptyState title="No announcements" />
                </CardBody>
              </Card>
            ) : (
              <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
                <Card>
                  <CardHeader title={featured.title}>
                    {!featured.read && <Badge tone="brand">NEW</Badge>}
                  </CardHeader>
                  <CardBody className="flex flex-col gap-4">
                    <div>
                      <p className="text-link text-fg-heading">{featured.authorName}</p>
                      <p className="text-fg-muted">
                        {featured.authorRole}
                        {featured.course && ` • ${featured.course.code}`} •{' '}
                        {relative(featured.publishedAt)}
                      </p>
                    </div>

                    <p className="whitespace-pre-wrap text-fg-body">{featured.body}</p>

                    {featured.attachments.map((att) => (
                      <a
                        key={att.id}
                        href={att.url}
                        download
                        className="flex items-center gap-3 rounded-control border border-border-strong bg-surface p-3 hover:bg-surface-subtle"
                      >
                        <Paperclip className="size-4.5 shrink-0 text-fg-muted" aria-hidden />
                        <span className="min-w-0">
                          <span className="block truncate text-link text-brand-700">
                            {att.filename}
                          </span>
                          <span className="block text-fg-muted">
                            {fileSize(att.sizeBytes)} • uploaded {relative(att.uploadedAt)}
                          </span>
                        </span>
                      </a>
                    ))}
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader title="Recent Updates" />
                  <CardBody className="flex flex-col gap-3">
                    {rest.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => open(a.id, a.read)}
                        className={cn(
                          'border-l-2 pl-3 text-left',
                          a.read ? 'border-border' : 'border-nav-active-student',
                        )}
                      >
                        <p className="text-link text-fg-heading">
                          {a.title}
                          {!a.read && <span className="ml-2 text-brand-700">•</span>}
                        </p>
                        <p className="line-clamp-2 text-fg-muted">{a.body}</p>
                      </button>
                    ))}
                  </CardBody>
                </Card>
              </div>
            )}
          </div>
        )
      }}
    </QueryState>
  )
}
