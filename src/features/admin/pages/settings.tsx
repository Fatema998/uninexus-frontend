import { useState } from 'react'
import { Building2, CalendarRange } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { QueryState } from '@/components/states'
import { useAdminSettings } from '../api-ops'

/**
 * Institutional Settings — no Figma frame exists; composed from tokens only.
 *
 * The toggles here change behaviour for every user in the institution, so
 * saving is explicit: nothing applies until "Save changes" is pressed, and
 * the button only enables when something actually differs.
 */
export function AdminSettings() {
  const query = useAdminSettings()
  const [changed, setChanged] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState(false)

  return (
    <QueryState query={query}>
      {(d) => {
        const stateOf = (key: string, fallback: boolean) => changed[key] ?? fallback
        const pending = d.toggles.filter((t) => changed[t.key] !== undefined && changed[t.key] !== t.on)

        return (
          <div className="flex flex-col gap-6">
            <PageHeader
              title="Settings"
              subtitle="Institution-wide configuration."
              action={
                <Button
                  disabled={pending.length === 0}
                  onClick={() => {
                    setChanged({})
                    setSaved(true)
                  }}
                  className="h-11 text-body"
                >
                  {saved && pending.length === 0
                    ? 'Saved'
                    : pending.length === 0
                      ? 'Save changes'
                      : `Save ${pending.length} change${pending.length > 1 ? 's' : ''}`}
                </Button>
              }
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader title="Institution" icon={Building2} />
                <CardBody>
                  <dl className="flex flex-col gap-3">
                    {d.institution.map((f) => (
                      <div key={f.label} className="flex justify-between gap-3">
                        <dt className="text-fg-muted">{f.label}</dt>
                        <dd className="text-right text-link text-fg-heading">{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Active Term" icon={CalendarRange} />
                <CardBody>
                  <dl className="flex flex-col gap-3">
                    {d.term.map((f) => (
                      <div key={f.label} className="flex justify-between gap-3">
                        <dt className="text-fg-muted">{f.label}</dt>
                        <dd className="text-right text-link text-fg-heading">{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                </CardBody>
              </Card>
            </div>

            <Card>
              <CardHeader title="Platform Controls" />
              <CardBody className="flex flex-col gap-4">
                {d.toggles.map((t) => (
                  <div
                    key={t.key}
                    className="flex flex-wrap items-center gap-4 rounded-control border border-border-strong bg-surface p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-link text-fg-heading">{t.label}</p>
                      <p className="text-fg-muted">{t.note}</p>
                    </div>
                    <Switch
                      checked={stateOf(t.key, t.on)}
                      onCheckedChange={(v) => {
                        setSaved(false)
                        setChanged((prev) => ({ ...prev, [t.key]: v }))
                      }}
                      aria-label={t.label}
                    />
                  </div>
                ))}

                {pending.length > 0 && (
                  <p className="text-fg-muted">
                    {pending.length} unsaved change{pending.length > 1 ? 's' : ''}. Nothing applies
                    until you save.
                  </p>
                )}
              </CardBody>
            </Card>
          </div>
        )
      }}
    </QueryState>
  )
}
