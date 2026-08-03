import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { QueryState } from '@/components/states'
import { useFacultyExams } from '../api'

/** Faculty Examination Management — Figma 1:3320. */
export function FacultyExams() {
  const query = useFacultyExams()

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="Examination" subtitle="Duties, evaluation, and question papers." />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {d.metrics.map((m) => (
              <MetricCard key={m.label} label={m.label} value={m.value} tone={m.tone} />
            ))}
          </div>

          <Card>
            <CardHeader title="Course" />
            <CardBody>
              <label className="flex max-w-md flex-col gap-1.5">
                <span className="text-link text-fg-heading">Select Course</span>
                <Select defaultValue={d.courses[0]}>
                  <SelectTrigger className="h-10" aria-label="Select Course">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {d.courses.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Exam Duties" />
            <CardBody className="flex flex-col gap-3">
              {d.duties.map((x) => (
                <div
                  key={x.title}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-border-strong bg-surface p-4"
                >
                  <div>
                    <p className="text-link text-fg-heading">{x.title}</p>
                    <p className="text-fg-muted">{x.place}</p>
                  </div>
                  <p className="text-link text-brand-700">{x.when}</p>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}
    </QueryState>
  )
}
