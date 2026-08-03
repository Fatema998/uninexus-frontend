import { useState } from 'react'
import { Plus, Search, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState, QueryState } from '@/components/states'
import { relative } from '@/lib/format'
import { useCreateNote, useDeleteNote, useNotes } from '../api'

/**
 * LMS Notes — Figma 6:4677.
 *
 * Create and delete are optimistic (docs/api/student.md §5.2). A row whose id
 * still starts with `tmp-` has no server identity yet, so its actions stay
 * disabled — deleting one would 404 and roll back the wrong row.
 */
export function Notes() {
  const [q, setQ] = useState('')
  const query = useNotes(q.trim())
  const create = useCreateNote(q.trim())
  const remove = useDeleteNote(q.trim())

  const [openId, setOpenId] = useState<string | null>(null)
  const [composing, setComposing] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  function save() {
    create.mutate(
      { title: title.trim(), body: body.trim() },
      {
        onSuccess: () => {
          setTitle('')
          setBody('')
          setComposing(false)
        },
      },
    )
  }

  return (
    <QueryState query={query}>
      {(d) => {
        const selected = d.results.find((n) => n.id === openId) ?? d.results[0] ?? null

        return (
          <div className="flex flex-col gap-6">
            <PageHeader
              title="Notes"
              subtitle="Your saved study notes."
              action={
                <Button onClick={() => setComposing((v) => !v)} className="h-11 text-body">
                  <Plus className="size-4" aria-hidden />
                  New note
                </Button>
              }
            />

            {composing && (
              <Card>
                <CardHeader title="New Note" />
                <CardBody className="flex flex-col gap-3">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-link text-fg-heading">Title</span>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. AVL rotations"
                      className="h-10"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-link text-fg-heading">Body</span>
                    <Textarea
                      rows={5}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="What do you want to remember?"
                    />
                  </label>
                  {create.isError && (
                    <p role="alert" className="text-danger">
                      Could not save the note. It has been removed from the list.
                    </p>
                  )}
                  <Button
                    disabled={!title.trim() || create.isPending}
                    onClick={save}
                    className="h-11 self-start text-body"
                  >
                    Save note
                  </Button>
                </CardBody>
              </Card>
            )}

            <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
              <Card>
                <CardHeader title={`All Notes (${d.count})`} />
                <CardBody className="flex flex-col gap-2">
                  <label className="relative flex items-center">
                    <Search
                      className="pointer-events-none absolute left-3 size-4.5 text-fg-muted"
                      aria-hidden
                    />
                    <span className="sr-only">Search notes</span>
                    <Input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search notes…"
                      className="mb-2 h-10 pl-10"
                    />
                  </label>

                  {d.results.length === 0 ? (
                    <EmptyState title="No notes yet" description="Create one to get started." />
                  ) : (
                    d.results.map((n) => {
                      const pending = n.id.startsWith('tmp-')
                      return (
                        <div
                          key={n.id}
                          className={cn(
                            'flex items-start gap-2 rounded-control border p-3 transition-colors',
                            selected?.id === n.id
                              ? 'border-brand-600 bg-brand-600/5'
                              : 'border-border-strong bg-surface',
                            pending && 'opacity-60',
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => setOpenId(n.id)}
                            className="min-w-0 flex-1 text-left"
                          >
                            <p className="truncate text-link text-fg-heading">{n.title}</p>
                            <p className="line-clamp-2 text-fg-muted">{n.body}</p>
                          </button>
                          <button
                            type="button"
                            aria-label={`Delete ${n.title}`}
                            disabled={pending}
                            onClick={() => remove.mutate(n.id)}
                            className="shrink-0 text-fg-muted hover:text-danger disabled:opacity-40"
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </button>
                        </div>
                      )
                    })
                  )}
                </CardBody>
              </Card>

              <Card>
                {selected ? (
                  <>
                    <CardHeader title={selected.title}>
                      {selected.tag && <Badge tone="brand">{selected.tag}</Badge>}
                    </CardHeader>
                    <CardBody className="flex flex-col gap-4">
                      <p className="whitespace-pre-wrap text-fg-body">{selected.body}</p>
                      <p className="text-fg-muted">Updated {relative(selected.updatedAt)}</p>
                    </CardBody>
                  </>
                ) : (
                  <CardBody>
                    <EmptyState title="Nothing selected" />
                  </CardBody>
                )}
              </Card>
            </div>
          </div>
        )
      }}
    </QueryState>
  )
}
