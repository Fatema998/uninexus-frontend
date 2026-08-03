import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { Send, Sparkles } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QueryState } from '@/components/states'
import { useAuth } from '@/features/auth/auth-context'
import { relative } from '@/lib/format'
import { useAiStream, useConversation } from '../api'

/**
 * AI Chat Workspace — Figma 1:6099.
 *
 * The reply streams over SSE (docs/api/student.md §7.2): the student's message
 * appears immediately, the assistant's fills in token by token. This is the
 * one place a `tmp-` row is meant to stay visible while it resolves.
 */
export function AiChat() {
  const [params] = useSearchParams()
  const conversationId = params.get('c') ?? 'conv-1'

  const query = useConversation(conversationId)
  const { appended, streaming, error, send } = useAiStream(conversationId)
  const { user } = useAuth()
  const [draft, setDraft] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text || streaming) return
    setDraft('')
    void send(text)
  }

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="AI Chat Workspace" subtitle={`Welcome back, ${user?.name ?? 'there'}`} />

          <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
            <Card>
              <CardHeader title={d.title} icon={Sparkles} />
              <CardBody className="flex flex-col gap-3">
                {[...d.messages, ...appended].map((m) => (
                  <p
                    key={m.id}
                    className={
                      m.from === 'ai'
                        ? 'max-w-[85%] rounded-control bg-surface-subtle p-3 text-fg-body'
                        : 'ml-auto max-w-[85%] rounded-control bg-brand-600/10 p-3 text-fg-heading'
                    }
                  >
                    {m.text}
                    {m.pending && <span className="animate-pulse text-fg-muted"> ▍</span>}
                  </p>
                ))}

                {error && (
                  <p role="alert" className="text-danger">
                    {error}
                  </p>
                )}

                <form onSubmit={onSubmit} className="mt-2 flex gap-2">
                  <label className="flex-1">
                    <span className="sr-only">Ask anything about your courses</span>
                    <Input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Ask anything about your courses…"
                      className="h-10"
                    />
                  </label>
                  <Button
                    type="submit"
                    size="icon-lg"
                    aria-label="Send"
                    disabled={!draft.trim() || streaming}
                  >
                    <Send className="size-4" aria-hidden />
                  </Button>
                </form>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Conversation" />
              <CardBody className="flex flex-col gap-3">
                <p className="text-fg-muted">
                  {d.messages.length + appended.length} messages
                  {d.messages[0] && ` • started ${relative(d.messages[0].createdAt)}`}
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </QueryState>
  )
}
