import { MapPin } from 'lucide-react'
import { AssistantPanel } from '@/components/patterns/assistant-panel'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { QueryState } from '@/components/states'
import { useExamSchedule } from '../api'

/** My Exam Schedule — Figma 1:9040. */
export function ExamSchedule() {
  const query = useExamSchedule()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="My Exam Schedule" subtitle={`Time to next exam: ${d.nextIn}`} />

          <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
            <Card>
              <CardHeader title="Scheduled Exams" />
              <CardBody className="flex flex-col gap-3">
                {d.exams.map((e) => (
                  <article
                    key={e.code}
                    className="rounded-control border border-border-strong bg-surface p-4"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-link text-fg-heading">{e.name}</p>
                      <span className="text-fg-muted">{e.code}</span>
                    </div>
                    <p className="mt-1 text-fg-muted">{e.date} • {e.time}</p>
                    <p className="mt-2 flex items-center gap-1.5 text-fg-muted">
                      <MapPin className="size-3.5 shrink-0" aria-hidden />
                      {e.venue} • {e.room}
                    </p>
                  </article>
                ))}
              </CardBody>
            </Card>

            <AssistantPanel {...d.assistant} />
          </div>
        </div>
      )}
    </QueryState>
  )
}
