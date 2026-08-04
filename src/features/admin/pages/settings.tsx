import { useState } from 'react'
import { Building2, CalendarRange } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { QueryState } from '@/components/states'
import { ApiError } from '@/hooks/use-api'
import { date } from '@/lib/format'
import { useAdminSettings, useSaveSettings } from '../api-ops'

/**
 * Institutional Settings — no Figma frame exists; composed from tokens only.
 *
 * The toggles here change behaviour for every user in the institution, so
 * saving is explicit: nothing applies until "Save changes" is pressed, and
 * the button only enables when something actually differs.
 */
export function AdminSettings() {
  const query = useAdminSettings()
  const save = useSaveSettings()
  const [changed, setChanged] = useState<Record<string, boolean>>({})

  const error = save.error instanceof ApiError ? save.error : null
  // 409 stale_version: another admin saved first. Reloading is the only
  // correct response — silently winning would revert their change.
  const stale = error?.code === 'stale_version'

  return (
    <QueryState query={query}>
      {(d) => {
        const stateOf = (key: string, fallback: boolean) => changed[key] ?? fallback
        const pending = d.toggles.filter(
          (t) => changed[t.key] !== undefined && changed[t.key] !== t.enabled,
        )

        return (
          <div className="flex flex-col gap-6">
            <PageHeader
              title="Settings"
              subtitle="Institution-wide configuration."
              action={
                <Button
                  disabled={pending.length === 0 || save.isPending}
                  onClick={() =>
                    save.mutate(
                      {
                        // The version is the optimistic lock — see
                        // docs/api/admin.md §5.
                        version: d.version,
                        institution: d.institution,
                        term: {
                          activeTermId: d.term.activeTermId,
                          startsOn: d.term.startsOn,
                          endsOn: d.term.endsOn,
                          fullTimeCreditMinimum: d.term.fullTimeCreditMinimum,
                        },
                        toggles: d.toggles.map((t) => ({
                          key: t.key,
                          enabled: stateOf(t.key, t.enabled),
                        })),
                      },
                      { onSuccess: () => setChanged({}) },
                    )
                  }
                  className="h-11 text-body"
                >
                  {save.isPending
                    ? 'Saving…'
                    : pending.length === 0
                      ? save.isSuccess
                        ? 'Saved'
                        : 'Save changes'
                      : `Save ${pending.length} change${pending.length > 1 ? 's' : ''}`}
                </Button>
              }
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader title="Institution" icon={Building2} />
                <CardBody>
                  <dl className="flex flex-col gap-3">
                    {[
                      { label: 'Institution Name', value: d.institution.name },
                      { label: 'Short Code', value: d.institution.shortCode },
                      { label: 'Primary Contact', value: d.institution.contactEmail },
                      { label: 'Timezone', value: d.institution.timezone },
                    ].map((f) => (
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
                    {[
                      { label: 'Active Semester', value: d.term.activeTermName },
                      { label: 'Term Starts', value: date(d.term.startsOn) },
                      { label: 'Term Ends', value: date(d.term.endsOn) },
                      { label: 'Full-time Credit Minimum', value: String(d.term.fullTimeCreditMinimum) },
                    ].map((f) => (
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
                      checked={stateOf(t.key, t.enabled)}
                      disabled={save.isPending}
                      onCheckedChange={(v) => setChanged((prev) => ({ ...prev, [t.key]: v }))}
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

                {stale ? (
                  <div role="alert" className="rounded-control border border-warning/40 bg-warning/5 p-3">
                    <p className="text-link text-warning">Someone else saved first</p>
                    <p className="text-fg-body">
                      {error?.detail} Your changes have not been applied.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setChanged({})
                        void query.refetch()
                      }}
                    >
                      Reload settings
                    </Button>
                  </div>
                ) : (
                  save.isError && (
                    <p role="alert" className="text-danger">
                      {error?.detail ?? 'Could not save settings.'}
                    </p>
                  )
                )}
              </CardBody>
            </Card>
          </div>
        )
      }}
    </QueryState>
  )
}
