import { useState } from 'react'
import { useParams } from 'react-router'
import { Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { ProgressBar } from '@/components/patterns/progress-bar'
import { Button } from '@/components/ui/button'
import { QueryState } from '@/components/states'
import { percent } from '@/lib/format'
import { usePracticeQuiz, useSubmitQuizAttempt } from '../api'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

/**
 * LMS Practice Quiz — Figma 6:4278.
 *
 * Practice quizzes ship `correctOptionId`, so grading is instant and works
 * offline. A graded quiz sends null there and the server owns the score —
 * see docs/api/student.md §6.4. The attempt is still POSTed either way, for
 * the analytics that drive the recommendation engine.
 */
export function PracticeQuiz() {
  const { id = '' } = useParams()
  const query = usePracticeQuiz(id)
  const submit = useSubmitQuizAttempt(id)

  /** questionId -> chosen optionId. */
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [startedAt] = useState(() => Date.now())
  const [graded, setGraded] = useState(false)

  return (
    <QueryState query={query}>
      {(d) => {
        const answered = Object.keys(answers).length
        const correct = d.questions.filter((q) => answers[q.id] === q.correctOptionId).length
        const answeredPct = Math.round((answered / d.questions.length) * 100)

        function check() {
          setGraded(true)
          submit.mutate({
            answers: Object.entries(answers).map(([questionId, optionId]) => ({
              questionId,
              optionId,
            })),
            elapsedSeconds: Math.round((Date.now() - startedAt) / 1000),
          })
        }

        return (
          <div className="flex flex-col gap-6">
            <PageHeader title={d.title} subtitle="Practice quiz — not graded." />

            <Card>
              <CardHeader title="Progress" />
              <CardBody>
                <ProgressBar value={answeredPct} label="Questions answered" />
                <p className="mt-2 text-fg-muted">
                  {answered} of {d.questions.length} answered
                  {graded && ` • ${correct} correct (${percent((correct / d.questions.length) * 100)})`}
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
                    value={answers[q.id] ?? ''}
                    onValueChange={(v) => setAnswers((prev) => ({ ...prev, [q.id]: v }))}
                    disabled={graded}
                  >
                    {q.options.map((opt) => {
                      const picked = answers[q.id] === opt.id
                      const isRight = opt.id === q.correctOptionId
                      return (
                        <label
                          key={opt.id}
                          className={cn(
                            'flex cursor-pointer items-center gap-3 rounded-control border p-3 transition-colors',
                            graded && isRight
                              ? 'border-success bg-success/5'
                              : graded && picked
                                ? 'border-danger bg-danger/5'
                                : !graded && picked
                                  ? 'border-brand-600 bg-brand-600/5'
                                  : 'border-border-strong bg-surface hover:bg-surface-subtle',
                          )}
                        >
                          <RadioGroupItem value={opt.id} />
                          <span className="text-fg-body">{opt.text}</span>
                        </label>
                      )
                    })}
                  </RadioGroup>
                </CardBody>
              </Card>
            ))}

            <div className="flex flex-wrap items-center justify-between gap-4">
              {d.rankNote && (
                <p className="flex items-center gap-2 text-fg-muted">
                  <Trophy className="size-4 text-warning" aria-hidden />
                  {d.rankNote}
                </p>
              )}
              <Button
                disabled={answered < d.questions.length || graded}
                onClick={check}
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
