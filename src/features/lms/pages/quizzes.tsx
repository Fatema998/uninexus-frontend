import { Link } from 'react-router'
import { Sparkles } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useQuizzes, type Quiz } from '../api'

const TONE: Record<Quiz['state'], BadgeTone> = {
  AVAILABLE: 'brand',
  COMPLETED: 'success',
  LOCKED: 'neutral',
}

/** LMS Quizzes — Figma 6:3564. */
export function Quizzes() {
  const query = useQuizzes()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Quizzes" subtitle="Practice and graded quizzes across your courses." />

          <div className="rounded-card border border-accent-600/20 bg-accent-600/5 p-4">
            <p className="mb-1 flex items-center gap-2 text-link text-accent-600">
              <Sparkles className="size-4" aria-hidden />
              {d.revision.title}
            </p>
            <p className="text-fg-body">{d.revision.body}</p>
          </div>

          <Card>
            <CardHeader title="All Quizzes" />
            <CardBody className="flex flex-col gap-3">
              {d.quizzes.map((q) => (
                <div
                  key={q.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-border-strong bg-surface p-4"
                >
                  <div className="min-w-0">
                    <p className="text-link text-fg-heading">{q.title}</p>
                    <p className="text-fg-muted">
                      {q.course} • {q.questions} questions • {q.minutes} min
                      {q.score && ` • Scored ${q.score}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={TONE[q.state]}>{q.state}</Badge>
                    {q.state === 'AVAILABLE' && (
                      <Link
                        to={`/student/lms/quizzes/${q.id}/practice`}
                        className="text-link text-brand-700 hover:underline"
                      >
                        Start
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}
    </QueryState>
  )
}
