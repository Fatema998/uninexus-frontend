import { useState } from 'react'
import { Award, Download, Flame, Search } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState, QueryState } from '@/components/states'
import { useCertificates } from './api'

/** Certificates & Achievements — Figma 6:5438. */
export function Certificates() {
  const query = useCertificates()
  const [q, setQ] = useState('')

  return (
    <QueryState query={query}>
      {(d) => {
        const term = q.trim().toLowerCase()
        const shown = term
          ? d.certificates.filter(
              (c) =>
                c.title.toLowerCase().includes(term) ||
                c.issued.toLowerCase().includes(term) ||
                c.id.toLowerCase().includes(term),
            )
          : d.certificates

        return (
          <div className="flex flex-col gap-6">
            <PageHeader title="Certificates & Achievements" subtitle="Everything you have earned." />

            <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
              <Card>
                <CardHeader title="My Certificates" icon={Award} />
                <CardBody className="flex flex-col gap-4">
                  <label className="relative flex items-center">
                    <Search className="pointer-events-none absolute left-3 size-4.5 text-fg-muted" aria-hidden />
                    <span className="sr-only">Search certificates</span>
                    <Input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search certificates by name or issue date…"
                      className="h-10 pl-10"
                    />
                  </label>

                  {shown.length === 0 ? (
                    <EmptyState title="No certificates match" description={`Nothing matches “${q}”.`} />
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {shown.map((c) => (
                        <article
                          key={c.id}
                          className="rounded-control border border-border-strong bg-surface p-4"
                        >
                          <span className="grid size-10 place-items-center rounded-control bg-brand-600/10 text-brand-700">
                            <Award className="size-4.5" aria-hidden />
                          </span>
                          <p className="mt-3 text-link text-fg-heading">{c.title}</p>
                          <p className="text-fg-muted">{c.issuer}</p>
                          <p className="mt-1 text-fg-muted">{c.issued} • {c.id}</p>
                          <Button variant="outline" size="sm" className="mt-3">
                            <Download className="size-3.5" aria-hidden />
                            Download
                          </Button>
                        </article>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>

              <aside className="flex flex-col gap-6">
                <Card>
                  <CardHeader title="Study Streak" icon={Flame} />
                  <CardBody>
                    <p className="text-metric text-warning">{d.streak.days}</p>
                    <p className="text-fg-muted">{d.streak.note}</p>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader title="Notices" />
                  <CardBody className="flex flex-col gap-3">
                    {d.notices.map((n) => (
                      <div key={n.title} className="border-l-2 border-nav-active-student pl-3">
                        <p className="text-link text-fg-heading">{n.title}</p>
                        <p className="text-fg-muted">{n.body}</p>
                      </div>
                    ))}
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader title="Need a printed copy?" />
                  <CardBody>
                    <p className="text-fg-body">{d.printNote}</p>
                    <Button variant="outline" className="mt-3 w-full">Order transcripts</Button>
                  </CardBody>
                </Card>
              </aside>
            </div>
          </div>
        )
      }}
    </QueryState>
  )
}
