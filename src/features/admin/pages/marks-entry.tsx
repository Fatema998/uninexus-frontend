import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { QueryState } from '@/components/states'
import { useMarksEntry, type MarkRow } from '../api'

const MAX = 30

/**
 * ERP Marks Entry & Results Workspace — Figma 7:14290.
 * Bulk grid with per-cell validation; publishing is blocked until every
 * student has a valid mark, so a partial result set cannot go out.
 */
export function MarksEntry() {
  const query = useMarksEntry()
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [published, setPublished] = useState(false)

  const valueOf = (r: MarkRow) => edits[r.id] ?? (r.marks === null ? '' : String(r.marks))

  return (
    <QueryState query={query}>
      {(d) => {
        const values = d.rows.map((r) => valueOf(r))
        const complete = values.every((v) => v !== '')
        const anyOver = values.some((v) => Number(v) > MAX)
        const entered = values.filter((v) => v !== '').map(Number)
        const average = entered.length ? (entered.reduce((a, b) => a + b, 0) / entered.length).toFixed(1) : '—'

        return (
          <div className="flex flex-col gap-6">
            <PageHeader
              title="Marks Entry"
              subtitle={`${d.course.id} • ${d.course.students} students • Weightage ${d.course.weightage}`}
              action={
                <Button
                  disabled={!complete || anyOver || published}
                  onClick={() => setPublished(true)}
                  className="h-11 text-body"
                >
                  {published ? 'Published' : 'Publish results'}
                </Button>
              }
            />

            <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
              <Card>
                <CardHeader title={`Mid-Term Total — status: ${published ? 'Published' : d.course.status}`} />
                <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-surface-subtle hover:bg-surface-subtle">
                        {['Student', 'ID', `Marks /${MAX}`].map((h) => (
                          <TableHead key={h} className="h-auto px-6 py-3 text-eyebrow uppercase text-fg-muted">
                            {h}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {d.rows.map((r) => {
                        const v = valueOf(r)
                        const over = Number(v) > MAX
                        return (
                          <TableRow key={r.id} className="border-border">
                            <TableCell className="px-6 py-3 text-body text-fg-heading">{r.name}</TableCell>
                            <TableCell className="px-6 py-3 text-body text-fg-body">{r.id}</TableCell>
                            <TableCell className="px-6 py-3">
                              <Input
                                type="number"
                                min={0}
                                max={MAX}
                                value={v}
                                aria-label={`${r.name} marks`}
                                aria-invalid={over}
                                onChange={(e) => {
                                  setPublished(false)
                                  setEdits((prev) => ({ ...prev, [r.id]: e.target.value }))
                                }}
                                className="h-9 w-24"
                              />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
                <CardBody className="border-t border-border">
                  {anyOver && (
                    <p role="alert" className="text-danger">A mark exceeds the {MAX}-point maximum.</p>
                  )}
                  {!complete && !anyOver && (
                    <p className="text-fg-muted">Enter every mark before publishing.</p>
                  )}
                </CardBody>
              </Card>

              <aside className="flex flex-col gap-6">
                <Card>
                  <CardHeader title="Class Performance" />
                  <CardBody className="flex flex-col gap-2">
                    <div className="flex justify-between gap-3">
                      <span className="text-fg-muted">Average</span>
                      <span className="text-link text-fg-heading">{average}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-fg-muted">Entered</span>
                      <span className="text-link text-fg-heading">
                        {entered.length} / {d.rows.length}
                      </span>
                    </div>
                  </CardBody>
                </Card>

                <div className="rounded-card border border-accent-600/20 bg-accent-600/5 p-4">
                  <p className="mb-1 flex items-center gap-2 text-link text-accent-600">
                    <Sparkles className="size-4" aria-hidden />
                    Approval Log Insight
                  </p>
                  <p className="text-fg-body">{d.insight}</p>
                </div>
              </aside>
            </div>
          </div>
        )
      }}
    </QueryState>
  )
}
