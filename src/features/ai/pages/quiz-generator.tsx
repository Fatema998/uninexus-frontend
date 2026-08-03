import { useState } from 'react'
import { Flame, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EmptyState, QueryState } from '@/components/states'
import { useGenerateQuiz, useQuizGeneratorOptions } from '../api'
import type { GenerateQuizRequest } from '@/types'

/** AI Quiz Generator — Figma 1:7161. */
export function QuizGenerator() {
  const query = useQuizGeneratorOptions()
  const generate = useGenerateQuiz()

  const [courseId, setCourseId] = useState('')
  const [count, setCount] = useState('')
  const [type, setType] = useState('')
  const [difficulty, setDifficulty] = useState('')

  /** questionId -> chosen optionId. Practice quizzes grade client-side. */
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)

  const quiz = generate.data

  return (
    <QueryState query={query}>
      {(d) => {
        const ready = Boolean(courseId && count && type && difficulty)

        return (
          <div className="flex flex-col gap-6">
            <PageHeader
              title="AI Quiz Generator"
              subtitle="Generate practice questions on any topic."
            />

            <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
              <div className="flex flex-col gap-6">
                <Card>
                  <CardHeader title="Generate" />
                  <CardBody className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-link text-fg-heading">Course</span>
                      <Select value={courseId} onValueChange={setCourseId}>
                        <SelectTrigger className="h-10" aria-label="Course">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {d.courses.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.code} — {c.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>

                    <label className="flex flex-col gap-1.5">
                      <span className="text-link text-fg-heading">Question Count</span>
                      <Select value={count} onValueChange={setCount}>
                        <SelectTrigger className="h-10" aria-label="Question Count">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {d.questionCounts.map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>

                    <label className="flex flex-col gap-1.5">
                      <span className="text-link text-fg-heading">Question Type</span>
                      <Select value={type} onValueChange={setType}>
                        <SelectTrigger className="h-10" aria-label="Question Type">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {d.types.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>

                    <label className="flex flex-col gap-1.5">
                      <span className="text-link text-fg-heading">Difficulty</span>
                      <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger className="h-10" aria-label="Difficulty">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {d.difficulties.map((x) => (
                            <SelectItem key={x.id} value={x.id}>
                              {x.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>

                    <Button
                      className="h-11 text-body sm:col-span-2"
                      disabled={!ready || generate.isPending}
                      onClick={() => {
                        setAnswers({})
                        setChecked(false)
                        generate.mutate({
                          courseId,
                          questionCount: Number(count),
                          type: type as GenerateQuizRequest['type'],
                          difficulty: difficulty as GenerateQuizRequest['difficulty'],
                        })
                      }}
                    >
                      {generate.isPending ? 'Writing questions…' : 'Generate questions'}
                    </Button>

                    {generate.isError && (
                      <p role="alert" className="text-danger sm:col-span-2">
                        Could not generate questions right now. Try again.
                      </p>
                    )}
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader title="Questions" />
                  <CardBody className="flex flex-col gap-6">
                    {!quiz ? (
                      <EmptyState
                        title="No questions yet"
                        description="Pick a course and difficulty, then generate a set."
                      />
                    ) : (
                      <>
                        {quiz.questions.map((q) => (
                          <div key={q.id}>
                            <p className="text-link text-fg-heading">{q.prompt}</p>

                            <RadioGroup
                              className="mt-3 flex flex-col gap-2"
                              value={answers[q.id] ?? ''}
                              onValueChange={(v) => setAnswers((p) => ({ ...p, [q.id]: v }))}
                              disabled={checked}
                            >
                              {q.options.map((opt) => {
                                const isRight = opt.id === q.correctOptionId
                                const isPicked = answers[q.id] === opt.id
                                return (
                                  <label
                                    key={opt.id}
                                    className={cn(
                                      'flex cursor-pointer items-center gap-3 rounded-control border p-3 transition-colors',
                                      checked && isRight
                                        ? 'border-success bg-success/5'
                                        : checked && isPicked
                                          ? 'border-danger bg-danger/5'
                                          : !checked && isPicked
                                            ? 'border-brand-600 bg-brand-600/5'
                                            : 'border-border-strong bg-surface',
                                    )}
                                  >
                                    <RadioGroupItem value={opt.id} />
                                    <span className="text-fg-body">{opt.text}</span>
                                  </label>
                                )
                              })}
                            </RadioGroup>
                          </div>
                        ))}

                        <Button
                          className="h-11 self-start text-body"
                          disabled={Object.keys(answers).length < quiz.questions.length || checked}
                          onClick={() => setChecked(true)}
                        >
                          {checked ? 'Answers revealed' : 'Check answers'}
                        </Button>
                      </>
                    )}
                  </CardBody>
                </Card>
              </div>

              <aside className="flex flex-col gap-6">
                {d.focus && (
                  <Card>
                    <CardHeader title="Current Focus" icon={Flame} />
                    <CardBody>
                      <p className="text-link text-fg-heading">{d.focus.courseName}</p>
                      <p className="text-fg-muted">{d.focus.streakNote}</p>
                    </CardBody>
                  </Card>
                )}

                {quiz?.insight && (
                  <div className="rounded-card border border-accent-600/20 bg-accent-600/5 p-4">
                    <p className="mb-1 flex items-center gap-2 text-link text-accent-600">
                      <Sparkles className="size-4" aria-hidden />
                      Quiz Insight
                    </p>
                    <p className="text-fg-body">{quiz.insight}</p>
                  </div>
                )}
              </aside>
            </div>
          </div>
        )
      }}
    </QueryState>
  )
}
