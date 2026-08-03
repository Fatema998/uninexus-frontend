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
import { QueryState } from '@/components/states'
import { useQuizGenerator } from '../api'

/** AI Quiz Generator — Figma 1:7161. */
export function QuizGenerator() {
  const query = useQuizGenerator()
  const [picked, setPicked] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader title="AI Quiz Generator" subtitle="Generate practice questions on any topic." />

          <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader title="Generate" />
                <CardBody className="grid gap-4 sm:grid-cols-2">
                  {[
                    { label: 'Course Select', options: d.courses },
                    { label: 'Question Count', options: d.counts },
                    { label: 'Question Type', options: d.types },
                    { label: 'Difficulty', options: d.difficulties },
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
                  <Button className="h-11 text-body sm:col-span-2">Generate questions</Button>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Sample Question" />
                <CardBody>
                  <p className="text-link text-fg-heading">{d.sample.prompt}</p>

                  <RadioGroup
                    className="mt-3 flex flex-col gap-2"
                    value={picked?.toString() ?? ''}
                    onValueChange={(v) => setPicked(Number(v))}
                    disabled={checked}
                  >
                    {d.sample.options.map((opt, oi) => {
                      const isRight = oi === d.sample.answer
                      return (
                        <label
                          key={opt}
                          className={cn(
                            'flex cursor-pointer items-center gap-3 rounded-control border p-3 transition-colors',
                            checked && isRight && 'border-success bg-success/5',
                            checked && picked === oi && !isRight && 'border-danger bg-danger/5',
                            !checked && picked === oi && 'border-brand-600 bg-brand-600/5',
                            (!checked && picked !== oi) || (checked && !isRight && picked !== oi)
                              ? 'border-border-strong bg-surface'
                              : '',
                          )}
                        >
                          <RadioGroupItem value={oi.toString()} />
                          <span className="text-fg-body">{opt}</span>
                        </label>
                      )
                    })}
                  </RadioGroup>

                  <Button
                    className="mt-4 h-11 text-body"
                    disabled={picked === null || checked}
                    onClick={() => setChecked(true)}
                  >
                    {checked
                      ? picked === d.sample.answer
                        ? 'Correct'
                        : 'Incorrect'
                      : 'Check answer'}
                  </Button>
                </CardBody>
              </Card>
            </div>

            <aside className="flex flex-col gap-6">
              <Card>
                <CardHeader title="Current Focus" icon={Flame} />
                <CardBody>
                  <p className="text-link text-fg-heading">{d.focus.course}</p>
                  <p className="text-fg-muted">{d.focus.streak}</p>
                </CardBody>
              </Card>

              <div className="rounded-card border border-accent-600/20 bg-accent-600/5 p-4">
                <p className="mb-1 flex items-center gap-2 text-link text-accent-600">
                  <Sparkles className="size-4" aria-hidden />
                  Quiz Insight
                </p>
                <p className="text-fg-body">{d.insight}</p>
              </div>
            </aside>
          </div>
        </div>
      )}
    </QueryState>
  )
}
