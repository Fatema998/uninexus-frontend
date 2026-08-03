import { useState } from 'react'
import { MessageSquare, Pin, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState, QueryState } from '@/components/states'
import { relative } from '@/lib/format'
import { useForumThread, useForumThreads, useReplyToThread } from '../api'

/** LMS Discussion Forum — Figma 6:3933. */
export function Forum() {
  const query = useForumThreads()
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <QueryState query={query}>
      {(d) => {
        const selectedId = openId ?? d.results[0]?.id ?? null

        return (
          <div className="flex flex-col gap-6">
            <PageHeader title="Discussion Forum" subtitle="Ask, answer, and follow course threads." />

            <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
              <Card>
                <CardHeader title="Threads" icon={MessageSquare} />
                <CardBody className="flex flex-col gap-3">
                  {d.results.length === 0 ? (
                    <EmptyState title="No threads yet" />
                  ) : (
                    d.results.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setOpenId(t.id)}
                        className={cn(
                          'flex flex-wrap items-center gap-4 rounded-control border p-4 text-left transition-colors',
                          selectedId === t.id
                            ? 'border-brand-600 bg-brand-600/5'
                            : 'border-border-strong bg-surface hover:bg-surface-subtle',
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-2 text-link text-fg-heading">
                            {t.pinned && (
                              <Pin className="size-3.5 shrink-0 text-brand-700" aria-hidden />
                            )}
                            <span className="truncate">{t.title}</span>
                          </p>
                          <p className="truncate text-fg-muted">
                            {t.course.code} • {t.excerpt}
                          </p>
                          <p className="text-fg-muted">
                            {t.authorName} • {relative(t.lastActivityAt)}
                          </p>
                        </div>
                        <span className="shrink-0 text-fg-muted">{t.replyCount} replies</span>
                      </button>
                    ))
                  )}
                </CardBody>
              </Card>

              {selectedId ? <ThreadPanel threadId={selectedId} /> : null}
            </div>
          </div>
        )
      }}
    </QueryState>
  )
}

/**
 * Split out so the reply mutation is keyed to one thread. `useReplyToThread`
 * patches that thread's cache optimistically; a shared hook at the parent
 * would patch whichever thread happened to be open when it mounted.
 */
function ThreadPanel({ threadId }: { threadId: string }) {
  const query = useForumThread(threadId)
  const reply = useReplyToThread(threadId)
  const [draft, setDraft] = useState('')

  return (
    <QueryState query={query}>
      {(d) => (
        <Card>
          <CardHeader title={d.thread.title} />
          <CardBody className="flex flex-col gap-3">
            <p className="rounded-control bg-surface-subtle p-3 text-fg-body">{d.body}</p>

            {d.replies.map((r) => (
              <div
                key={r.id}
                className={cn(
                  'rounded-control border border-border-strong p-3',
                  r.isMine ? 'bg-brand-600/5' : 'bg-surface',
                  // Optimistic replies are dimmed until the server confirms.
                  r.id.startsWith('tmp-') && 'opacity-60',
                )}
              >
                <p className="text-link text-fg-heading">{r.authorName}</p>
                <p className="text-fg-body">{r.body}</p>
                <p className="text-fg-muted">{relative(r.createdAt)}</p>
              </div>
            ))}

            {reply.isError && (
              <p role="alert" className="text-danger">
                Your reply did not post. It is still in the box below.
              </p>
            )}

            <form
              className="mt-2 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                const body = draft.trim()
                if (!body) return
                // Cleared on success only — a failed reply keeps the text.
                reply.mutate({ body }, { onSuccess: () => setDraft('') })
              }}
            >
              <label className="flex-1">
                <span className="sr-only">Write a reply</span>
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write a reply…"
                  className="h-10"
                />
              </label>
              <Button type="submit" size="icon-lg" aria-label="Post reply" disabled={!draft.trim()}>
                <Send className="size-4" aria-hidden />
              </Button>
            </form>
          </CardBody>
        </Card>
      )}
    </QueryState>
  )
}
