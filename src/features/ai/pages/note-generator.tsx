import { useState } from 'react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EmptyState } from '@/components/states'
import { useGenerateNote } from '../api'
import type { GenerateNoteRequest } from '@/types'

const DEPTHS: { id: GenerateNoteRequest['depth']; label: string }[] = [
  { id: 'BRIEF', label: 'Brief' },
  { id: 'STANDARD', label: 'Standard' },
  { id: 'DEEP', label: 'Deep dive' },
]

/**
 * AI Note Generator — Figma 1:6831.
 *
 * Generation is on demand, never on mount — see study-planner.tsx.
 */
export function NoteGenerator() {
  const generate = useGenerateNote()
  const [topic, setTopic] = useState('')
  const [depth, setDepth] = useState<GenerateNoteRequest['depth']>('STANDARD')

  const note = generate.data

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="AI Note Generator"
        subtitle={note?.title ?? 'Turn any topic into structured notes.'}
      />

      <Card>
        <CardHeader title="Generate" />
        <CardBody className="grid gap-4 sm:grid-cols-[1fr_180px_auto]">
          <label className="flex flex-col gap-1.5">
            <span className="text-link text-fg-heading">Topic</span>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Quantum Mechanics: wave-particle duality"
              className="h-10"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-link text-fg-heading">Depth</span>
            <Select value={depth} onValueChange={(v) => setDepth(v as GenerateNoteRequest['depth'])}>
              <SelectTrigger className="h-10" aria-label="Depth">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPTHS.map((x) => (
                  <SelectItem key={x.id} value={x.id}>
                    {x.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <Button
            className="h-10 self-end text-body"
            disabled={!topic.trim() || generate.isPending}
            onClick={() => generate.mutate({ topic: topic.trim(), depth })}
          >
            {generate.isPending ? 'Writing…' : 'Generate notes'}
          </Button>

          {generate.isError && (
            <p role="alert" className="text-danger sm:col-span-3">
              Could not generate notes right now. Try again.
            </p>
          )}
        </CardBody>
      </Card>

      {!note ? (
        <Card>
          <CardBody>
            <EmptyState
              title="No notes yet"
              description="Enter a topic above and the assistant will write structured notes for it."
            />
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <Card>
            <CardHeader title="Table of Contents" />
            <CardBody>
              <ol className="flex flex-col gap-2">
                {note.tableOfContents.map((t, i) => (
                  <li key={t} className="flex gap-2 text-fg-body">
                    <span className="text-fg-muted">{i + 1}.</span>
                    {t}
                  </li>
                ))}
              </ol>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={note.title} />
            <CardBody className="flex flex-col gap-4">
              <p className="text-fg-body">{note.intro}</p>

              {note.keyFacts.map((f) => (
                <div key={f.formula} className="rounded-control bg-surface-subtle p-4">
                  <p className="text-card-title text-brand-700">{f.formula}</p>
                  <p className="mt-1 text-fg-muted">{f.note}</p>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}
