import { useState, type FormEvent } from 'react'
import { Send, Sparkles } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QueryState } from '@/components/states'
import { useAuth } from '@/features/auth/auth-context'
import { useAiChat } from '../api'

type Msg = { from: 'ai' | 'me'; text: string }

/**
 * AI Chat Workspace — Figma 1:6099.
 *
 * ponytail: replies are canned until the AI backing is chosen (prd.md §6.8).
 * The composer, optimistic append, and transcript are real, so wiring a model
 * means replacing `reply()` and nothing else.
 */
const reply = (): string =>
  'I am not connected to a model yet. Once the AI backend is configured, this reply will be generated.'

export function AiChat() {
  const query = useAiChat()
  const { user } = useAuth()
  const [extra, setExtra] = useState<Msg[]>([])
  const [draft, setDraft] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    setExtra((prev) => [...prev, { from: 'me', text }, { from: 'ai', text: reply() }])
    setDraft('')
  }

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader
            title="AI Chat Workspace"
            subtitle={`${d.greeting}, ${user?.name ?? 'there'}`}
          />

          <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
            <Card>
              <CardHeader title="Academic Workspace" icon={Sparkles} />
              <CardBody className="flex flex-col gap-3">
                <p className="rounded-control bg-surface-subtle p-3 text-fg-body">{d.intro}</p>

                {[...d.messages, ...extra].map((m, i) => (
                  <p
                    key={i}
                    className={
                      m.from === 'ai'
                        ? 'max-w-[85%] rounded-control bg-surface-subtle p-3 text-fg-body'
                        : 'ml-auto max-w-[85%] rounded-control bg-brand-600/10 p-3 text-fg-heading'
                    }
                  >
                    {m.text}
                  </p>
                ))}

                <form onSubmit={onSubmit} className="mt-2 flex gap-2">
                  <label className="flex-1">
                    <span className="sr-only">Ask anything about your courses</span>
                    <Input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Ask anything about Data Structures…"
                      className="h-10"
                    />
                  </label>
                  <Button type="submit" size="icon-lg" aria-label="Send" disabled={!draft.trim()}>
                    <Send className="size-4" aria-hidden />
                  </Button>
                </form>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Upcoming Deadlines" />
              <CardBody className="flex flex-col gap-3">
                {d.deadlines.map((x) => (
                  <div key={x.title} className="border-l-2 border-nav-active-student pl-3">
                    <p className="text-link text-fg-heading">{x.title}</p>
                    <p className="text-fg-muted">{x.due}</p>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </QueryState>
  )
}
