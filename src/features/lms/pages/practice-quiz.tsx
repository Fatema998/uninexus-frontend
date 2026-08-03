import { useState } from 'react'
import { useParams } from 'react-router'
import { Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { ProgressBar } from '@/components/patterns/progress-bar'
import { Button } from '@/components/ui/button'
import { QueryState } from '@/components/states'
import { usePracticeQuiz } from '../api'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

/** LMS Practice Quiz — Figma 6:4278. */
export function PracticeQuiz() {
  const { id = '' } = useParams()
  const query = usePracticeQuiz(id)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [graded, setGraded] = useState(false)

  return (
    <QueryState query={query}>
      {(d) => {
        const answered = Object.keys(answers).length
        const correct = d.questions.filter((q) => answers[q.id] === q.answer).length
        const pct = Math.round((answered / d.questions.length) * 100)

        return (
          <div className="flex flex-col gap-6">
            <PageHeader title={d.title} subtitle="Practice quiz — not graded." />

            <Card>
              <CardHeader title="Progress" />
              <CardBody>
                <ProgressBar value={pct} label="Questions answered" />
                <p className="mt-2 text-fg-muted">
                  {answered} of {d.questions.length} answered
                  {graded && ` • ${correct} correct`}
                </p>
              </CardBody>
            </Card>

            {d.questions.map((q, qi) => (
              <Card key={q.id}>
                <CardBody>
                  <p className="text-link text-fg-heading">
                    {qi + 1}. {q.prompt}
                  </p>

                  <RadioGroup
                    className="mt-3 flex flex-col gap-2"
                    value={answers[q.id]?.toString() ?? ''}
                    onValueChange={(v) => setAnswers((prev) => ({ ...prev, [q.id]: Number(v) }))}
                    disabled={graded}
                  >
                    {q.options.map((opt, oi) => {
                      const picked = answers[q.id] === oi
                      const isRight = oi === q.answer
                      return (
                        <label
                          key={opt}
                          className={cn(
                            'flex cursor-pointer items-center gap-3 rounded-control border p-3 transition-colors',
                            graded && isRight && 'border-success bg-success/5',
                            graded && picked && !isRight && 'border-danger bg-danger/5',
                            !graded && picked && 'border-brand-600 bg-brand-600/5',
                            !graded && !picked && 'border-border-strong bg-surface hover:bg-surface-subtle',
                            graded && !isRight && !picked && 'border-border-strong bg-surface',
                          )}
                        >
                          <RadioGroupItem value={oi.toString()} />
                          <span className="text-fg-body">{opt}</span>
                        </label>
                      )
                    })}
                  </RadioGroup>
                </CardBody>
              </Card>
            ))}

            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="flex items-center gap-2 text-fg-muted">
                <Trophy className="size-4 text-warning" aria-hidden />
                {d.rank}
              </p>
              <Button
                disabled={answered < d.questions.length || graded}
                onClick={() => setGraded(true)}
                className="h-11 text-body"
              >
                {graded ? `Scored ${correct}/${d.questions.length}` : 'Check answers'}
              </Button>
            </div>
          </div>
        )
      }}
    </QueryState>
  )
}
