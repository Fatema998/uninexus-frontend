import { useState } from 'react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { QueryState } from '@/components/states'
import { useGradebook, type GradeRow } from '../api'

type Edits = Record<string, Record<string, string>>

/**
 * Faculty Grade Book — Figma 2:169.
 * Bulk entry grid. Unsaved edits are tracked so the save button reflects real
 * pending work rather than always being enabled.
 */
export function FacultyGradebook() {
  const query = useGradebook()
  const [edits, setEdits] = useState<Edits>({})
  const [saved, setSaved] = useState(false)

  const set = (id: string, field: string, value: string) => {
    setSaved(false)
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }

  const valueOf = (row: GradeRow, field: 'midterm' | 'assignment' | 'final') =>
    edits[row.id]?.[field] ?? (row[field] === null ? '' : String(row[field]))

  return (
    <QueryState query={query}>
      {(d) => {
        const pending = Object.values(edits).reduce((n, f) => n + Object.keys(f).length, 0)

        return (
          <div className="flex flex-col gap-6">
            <PageHeader
              title="Grade Book"
              subtitle="Enter and publish marks for your students."
              action={
                <Button
                  disabled={pending === 0}
                  onClick={() => {
                    setEdits({})
                    setSaved(true)
                  }}
                  className="h-11 text-body"
                >
                  {saved ? 'Saved' : `Save ${pending || ''} changes`.trim()}
                </Button>
              }
            />

            <Card>
              <CardHeader title="Filters" />
              <CardBody className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
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
                <label className="flex flex-col gap-1.5">
                  <span className="text-link text-fg-heading">Assessment Type</span>
                  <Select defaultValue={d.assessments[0]}>
                    <SelectTrigger className="h-10" aria-label="Assessment Type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {d.assessments.map((a) => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Marks" />
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-surface-subtle hover:bg-surface-subtle">
                      {['Student', 'ID', 'Midterm /30', 'Assignment /20', 'Final /50'].map((h) => (
                        <TableHead key={h} className="h-auto px-6 py-3 text-eyebrow uppercase text-fg-muted">
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {d.rows.map((r) => (
                      <TableRow key={r.id} className="border-border">
                        <TableCell className="px-6 py-3 text-body text-fg-heading">{r.name}</TableCell>
                        <TableCell className="px-6 py-3 text-body text-fg-body">{r.id}</TableCell>
                        {(['midterm', 'assignment', 'final'] as const).map((field) => (
                          <TableCell key={field} className="px-6 py-3">
                            <Input
                              type="number"
                              min={0}
                              value={valueOf(r, field)}
                              onChange={(e) => set(r.id, field, e.target.value)}
                              className="h-9 w-24"
                              aria-label={`${r.name} ${field}`}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <CardBody className="border-t border-border text-center">
                <Button variant="outline">Load {d.remaining} more students</Button>
              </CardBody>
            </Card>
          </div>
        )
      }}
    </QueryState>
  )
}
