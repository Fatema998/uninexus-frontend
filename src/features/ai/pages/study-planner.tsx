import { CalendarClock } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { QueryState } from '@/components/states'
import { useStudyPlanner } from '../api'

/** AI Study Planner — Figma 1:6424. */
export function StudyPlanner() {
  const query = useStudyPlanner()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="AI Study Planner" subtitle={`Next exam: ${d.nextExam}`} />

          <Card>
            <CardHeader title="Plan Settings" />
            <CardBody className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Exam Selection', options: d.exams },
                { label: 'Target Grade', options: d.grades },
                { label: 'Daily Goal', options: d.goals },
              ].map((f) => (
                <label key={f.label} className="flex flex-col gap-1.5">
                  <span className="text-link text-fg-heading">{f.label}</span>
                  <Select defaultValue={f.options[0]}>
                    <SelectTrigger className="h-10" aria-label={f.label}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {f.options.map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="This Week" icon={CalendarClock} />
            <CardBody className="flex flex-col gap-4">
              {d.days.map((day) => (
                <div key={day.day} className="rounded-control border border-border-strong bg-surface p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-link text-fg-heading">{day.day}</p>
                    <p className="text-fg-muted">{day.topic}</p>
                  </div>

                  {day.blocks.length > 0 && (
                    <ul className="mt-3 flex flex-col gap-3">
                      {day.blocks.map((b) => (
                        <li key={b.time} className="flex gap-3 border-l-2 border-brand-600/30 pl-3">
                          <div className="w-20 shrink-0">
                            <p className="text-link text-brand-700">{b.time}</p>
                            <p className="text-fg-muted">{b.length}</p>
                          </div>
                          <p className="text-fg-body">{b.note}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}
    </QueryState>
  )
}
