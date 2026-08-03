import { useState } from 'react'
import { Mail, MapPin, Search } from 'lucide-react'
import { AssistantPanel } from '@/components/patterns/assistant-panel'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { EmptyState, QueryState } from '@/components/states'
import { useFacultyDirectory } from '../api'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const initials = (name: string) =>
  name
    .replace(/^(Dr\.|Prof\.)\s*/, '')
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()

/** Faculty Directory — Figma 6:7770 (2-column grid). */
export function FacultyDirectory() {
  const query = useFacultyDirectory()
  const [q, setQ] = useState('')

  return (
    <QueryState query={query}>
      {(d) => {
        const term = q.trim().toLowerCase()
        const shown = term
          ? d.faculty.filter(
              (f) =>
                f.name.toLowerCase().includes(term) ||
                f.title.toLowerCase().includes(term) ||
                f.room.toLowerCase().includes(term),
            )
          : d.faculty

        return (
          <div className="flex flex-col gap-6">
            <PageHeader title="Faculty Directory" subtitle="Find a professor, their office, and their courses." />

            <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
              <Card>
                <CardHeader title="Faculty" />
                <CardBody className="flex flex-col gap-4">
                  <label className="relative flex items-center">
                    <Search className="pointer-events-none absolute left-3 size-4.5 text-fg-muted" aria-hidden />
                    <span className="sr-only">Search faculty</span>
                    <Input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search by name, course, or room…"
                      className="h-10 pl-10"
                    />
                  </label>

                  {shown.length === 0 ? (
                    <EmptyState
                      title="No faculty found"
                      description={`Nothing matches “${q}”.`}
                    />
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {shown.map((f) => (
                        <article
                          key={f.email}
                          className="flex gap-3 rounded-control border border-border-strong bg-surface p-4"
                        >
                          <Avatar className="size-12 shrink-0">
                            <AvatarFallback className="bg-nav-active-student text-link text-brand-700">
                              {initials(f.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-link text-fg-heading">{f.name}</p>
                            <p className="truncate text-fg-muted">{f.title}</p>
                            <p className="mt-1 flex items-center gap-1.5 text-fg-muted">
                              <MapPin className="size-3.5 shrink-0" aria-hidden />
                              {f.room}
                            </p>
                            <a
                              href={`mailto:${f.email}`}
                              className="mt-0.5 flex items-center gap-1.5 truncate text-link text-brand-700 hover:underline"
                            >
                              <Mail className="size-3.5 shrink-0" aria-hidden />
                              {f.email}
                            </a>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>

              <AssistantPanel {...d.assistant} />
            </div>
          </div>
        )
      }}
    </QueryState>
  )
}
