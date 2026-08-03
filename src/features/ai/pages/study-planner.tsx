import { useState } from 'react'
import { CalendarClock } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EmptyState, QueryState } from '@/components/states'
import { date, duration, relative } from '@/lib/format'
import { useGenerateStudyPlan, useStudyPlannerOptions } from '../api'

/**
 * AI Study Planner — Figma 1:6424.
 *
 * Nothing is generated on mount: a model call costs money and the student has
 * not asked for one yet. The form is the screen until they press Generate.
 */
export function StudyPlanner() {
  const query = useStudyPlannerOptions()
  const generate = useGenerateStudyPlan()

  const [examId, setExamId] = useState('')
  const [targetGrade, setTargetGrade] = useState('')
  const [dailyHours, setDailyHours] = useState('')

  return (
    <QueryState query={query}>
      {(d) => {
        const exam = d.exams.find((e) => e.id === examId) ?? d.exams[0]
        const ready = Boolean(examId && targetGrade && dailyHours)
        const plan = generate.data

        return (
          <div className="flex flex-col gap-6">
            <PageHeader
              title="AI Study Planner"
              subtitle={exam ? `Next exam: ${relative(exam.startsAt)}` : 'No exams scheduled.'}
            />

            <Card>
              <CardHeader title="Plan Settings" />
              <CardBody className="grid gap-4 sm:grid-cols-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-link text-fg-heading">Exam Selection</span>
                  <Select value={examId} onValueChange={setExamId}>
                    <SelectTrigger className="h-10" aria-label="Exam Selection">
                      <SelectValue placeholder="Choose an exam" />
                    </SelectTrigger>
                    <SelectContent>
                      {d.exams.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-link text-fg-heading">Target Grade</span>
                  <Select value={targetGrade} onValueChange={setTargetGrade}>
                    <SelectTrigger className="h-10" aria-label="Target Grade">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {d.targetGrades.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-link text-fg-heading">Daily Goal</span>
                  <Select value={dailyHours} onValueChange={setDailyHours}>
                    <SelectTrigger className="h-10" aria-label="Daily Goal">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {d.dailyHourChoices.map((h) => (
                        <SelectItem key={h} value={String(h)}>
                          {h} Hrs
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>

                <Button
                  className="h-11 text-body sm:col-span-3"
                  disabled={!ready || generate.isPending}
                  onClick={() =>
                    generate.mutate({ examId, targetGrade, dailyHours: Number(dailyHours) })
                  }
                >
                  {generate.isPending ? 'Building your plan…' : 'Generate plan'}
                </Button>

                {generate.isError && (
                  <p role="alert" className="text-danger sm:col-span-3">
                    Could not build a plan right now. Try again.
                  </p>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="This Week" icon={CalendarClock} />
              <CardBody className="flex flex-col gap-4">
                {!plan ? (
                  <EmptyState
                    title="No plan yet"
                    description="Choose an exam, a target grade, and a daily goal to generate one."
                  />
                ) : (
                  plan.days.map((day) => (
                    <div
                      key={day.date}
                      className="rounded-control border border-border-strong bg-surface p-4"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-link text-fg-heading">{date(day.date)}</p>
                        <p className="text-fg-muted">{day.topic}</p>
                      </div>

                      {day.blocks.length > 0 && (
                        <ul className="mt-3 flex flex-col gap-3">
                          {day.blocks.map((b) => (
                            <li
                              key={b.startsAt}
                              className="flex gap-3 border-l-2 border-brand-600/30 pl-3"
                            >
                              <div className="w-20 shrink-0">
                                <p className="text-link text-brand-700">{b.startsAt}</p>
                                <p className="text-fg-muted">
                                  {b.durationMinutes === null
                                    ? '—'
                                    : duration(b.durationMinutes * 60)}
                                </p>
                              </div>
                              <p className="text-fg-body">{b.note}</p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))
                )}
              </CardBody>
            </Card>
          </div>
        )
      }}
    </QueryState>
  )
}
