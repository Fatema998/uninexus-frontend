import { Send, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from './card'
import { Input } from '@/components/ui/input'
import { useGetData } from '@/hooks/use-api'
import type { AssistantResponse } from '@/types'

/**
 * AIAssistantPanel — design.md §3.
 *
 * Appears in the right rail of nearly every academic screen, so it lives here
 * rather than in any one feature. The composer is inert until the AI backing
 * is settled (docs/prd.md §6.8) — wire it there, once, not per screen.
 */
export type Assistant = {
  messages: { from: 'ai' | 'me'; text: string }[]
  suggestions?: string[]
  title?: string
}

export function AssistantPanel({ messages, suggestions = [], title = 'Academic AI' }: Assistant) {
  return (
    <Card>
      <CardHeader title={title} icon={Sparkles}>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-success-dot" aria-hidden />
          <span className="text-eyebrow uppercase text-fg-muted">Always Online</span>
        </span>
      </CardHeader>

      <CardBody className="flex flex-col gap-3">
        {messages.map((m, i) => (
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

        {suggestions.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                className="rounded-full border border-border-strong px-3 py-1 text-link text-fg-body hover:bg-surface-subtle"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="mt-2 flex gap-2">
          <label className="flex-1">
            <span className="sr-only">Ask the assistant</span>
            <Input
              placeholder="Ask anything…"
              className="h-10"
            />
          </label>
          <Button size="icon-lg" aria-label="Send">
            <Send className="size-4" aria-hidden />
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}

/**
 * The panel, fetched by screen context.
 *
 * Its own request, not part of the screen payload: the copy is model-generated
 * and slow, so blocking a dashboard on it would trade a 200ms page for a 3s
 * one. `retry: false` and rendering nothing on failure are deliberate — a dead
 * model degrades the rail, never the page. See docs/api/student.md §2.2.
 */
export function ConnectedAssistant({ context }: { context: string }) {
  const { data } = useGetData<AssistantResponse>(
    `/api/student/ai/assist/?context=${encodeURIComponent(context)}`,
    ['ai', 'assist', context],
    { staleTime: 5 * 60_000, retry: false },
  )

  if (!data) return null
  return (
    <AssistantPanel
      title={data.title ?? undefined}
      messages={data.messages}
      suggestions={data.suggestions}
    />
  )
}
