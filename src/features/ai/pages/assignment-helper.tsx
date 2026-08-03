import { useState } from 'react'
import { BookMarked, PenLine } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EmptyState, QueryState } from '@/components/states'
import { useAssignments } from '@/features/lms/api'
import { useAssignmentHelper } from '../api'
import type { AssignmentHelperResponse } from '@/types'

const KIND_TONE: Record<AssignmentHelperResponse['suggestions'][number]['kind'], BadgeTone> = {
  STYLE: 'accent',
  CITATION: 'brand',
  STRUCTURE: 'info',
}

/** AI Assignment Helper — Figma 1:7430. */
export function AssignmentHelper() {
  // The assignment list is the source of what can be helped with — no second
  // endpoint, and it stays in step with the LMS.
  const query = useAssignments()
  const help = useAssignmentHelper()

  const [assignmentId, setAssignmentId] = useState('')
  const [draft, setDraft] = useState('')

  const result = help.data

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="AI Assignment Helper" subtitle="Draft, refine, and cite your work." />

          <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader title="Your Draft" icon={PenLine} />
                <CardBody className="flex flex-col gap-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-link text-fg-heading">Assignment</span>
                    <Select value={assignmentId} onValueChange={setAssignmentId}>
                      <SelectTrigger className="h-10" aria-label="Assignment">
                        <SelectValue placeholder="Which assignment is this for?" />
                      </SelectTrigger>
                      <SelectContent>
                        {d.assignments.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.course.code} — {a.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-link text-fg-heading">Draft</span>
                    <Textarea
                      rows={8}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Paste or write your draft here…"
                    />
                  </label>

                  <Button
                    className="h-11 self-start text-body"
                    disabled={!assignmentId || draft.trim().length < 40 || help.isPending}
                    onClick={() => help.mutate({ assignmentId, draft: draft.trim() })}
                  >
                    {help.isPending ? 'Reviewing…' : 'Review my draft'}
                  </Button>

                  {help.isError && (
                    <p role="alert" className="text-danger">
                      Could not review the draft right now. Try again.
                    </p>
                  )}
                </CardBody>
              </Card>

              {result && (
                <>
                  <Card>
                    <CardHeader title="Suggested Outline" />
                    <CardBody>
                      <ol className="flex flex-col gap-2">
                        {result.outline.map((o) => (
                          <li key={o} className="text-fg-body">
                            {o}
                          </li>
                        ))}
                      </ol>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader title="Rewritten Draft" />
                    <CardBody>
                      <p className="whitespace-pre-wrap text-fg-body">{result.rewrittenDraft}</p>
                    </CardBody>
                  </Card>
                </>
              )}
            </div>

            <Card>
              <CardHeader title="Suggestions" icon={BookMarked} />
              <CardBody className="flex flex-col gap-3">
                {!result ? (
                  <EmptyState
                    title="Nothing to review yet"
                    description="Pick an assignment and paste a draft to get suggestions."
                  />
                ) : (
                  result.suggestions.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-control border border-border-strong bg-surface p-3"
                    >
                      <Badge tone={KIND_TONE[s.kind]}>{s.kind}</Badge>
                      <p className="mt-2 text-fg-body">{s.text}</p>
                    </div>
                  ))
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </QueryState>
  )
}
