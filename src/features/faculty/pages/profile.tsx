import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QueryState } from '@/components/states'
import { ApiError } from '@/hooks/use-api'
import { useFacultyProfile, useUpdateProfile } from '../api'

/**
 * Faculty Profile — Figma 1:868.
 *
 * Three fields are self-editable; name, designation and email belong to the
 * registrar. The read-only ones stay visible and locked rather than hidden —
 * and the server returns 403 rather than silently dropping them, so a
 * mistaken edit surfaces instead of appearing to work.
 */
export function FacultyProfile() {
  const query = useFacultyProfile()
  const update = useUpdateProfile()

  const [editing, setEditing] = useState(false)
  const [phone, setPhone] = useState<string | null>(null)
  const [officeRoom, setOfficeRoom] = useState<string | null>(null)

  const error = update.error instanceof ApiError ? update.error : null

  return (
    <QueryState query={query}>
      {(d) => {
        function save() {
          update.mutate(
            { phone: phone ?? d.phone ?? '', officeRoom: officeRoom ?? d.officeRoom ?? '' },
            { onSuccess: () => setEditing(false) },
          )
        }

        return (
          <div className="flex flex-col gap-6">
            <PageHeader
              title="My Profile"
              subtitle={`${d.designation} • ${d.email}`}
              action={
                editing ? undefined : (
                  <Button variant="outline" onClick={() => setEditing(true)} className="h-11 text-body">
                    <Pencil className="size-4" aria-hidden />
                    Edit contact details
                  </Button>
                )
              }
            />

            <div className="grid gap-6 sm:grid-cols-2">
              {d.metrics.map((m) => (
                <MetricCard key={m.label} label={m.label} value={m.value} tone={m.tone} />
              ))}
            </div>

            <Card>
              <CardHeader title="Details" />
              <CardBody className="flex flex-col gap-4">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <ReadOnly label="Full Legal Name" value={d.fullName} />
                  <ReadOnly label="Designation" value={d.designation} />
                  <ReadOnly label="Official Email" value={d.email} />
                  <ReadOnly label="Specialization" value={d.specializations.join(', ')} />

                  {editing ? (
                    <>
                      <label className="flex flex-col gap-1.5">
                        <span className="text-eyebrow uppercase text-fg-muted">Contact Number</span>
                        <Input
                          value={phone ?? d.phone ?? ''}
                          onChange={(e) => setPhone(e.target.value)}
                          className="h-10"
                        />
                      </label>
                      <label className="flex flex-col gap-1.5">
                        <span className="text-eyebrow uppercase text-fg-muted">Office Room</span>
                        <Input
                          value={officeRoom ?? d.officeRoom ?? ''}
                          onChange={(e) => setOfficeRoom(e.target.value)}
                          className="h-10"
                        />
                      </label>
                    </>
                  ) : (
                    <>
                      <ReadOnly label="Contact Number" value={d.phone ?? '—'} />
                      <ReadOnly label="Office Room" value={d.officeRoom ?? '—'} />
                    </>
                  )}
                </dl>

                {update.isError && (
                  <p role="alert" className="text-danger">
                    {error?.detail ?? 'Could not save your changes.'}
                  </p>
                )}

                {editing && (
                  <div className="flex gap-2">
                    <Button disabled={update.isPending} onClick={save} className="h-11 text-body">
                      {update.isPending ? 'Saving…' : 'Save'}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={update.isPending}
                      onClick={() => {
                        setEditing(false)
                        setPhone(null)
                        setOfficeRoom(null)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Education" />
              <CardBody className="flex flex-col gap-3">
                {d.education.map((e) => (
                  <div key={e.id} className="border-l-2 border-nav-active-student pl-3">
                    <p className="text-link text-fg-heading">{e.degree}</p>
                    <p className="text-fg-muted">{e.institution}</p>
                    <p className="text-fg-muted">{e.note}</p>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>
        )
      }}
    </QueryState>
  )
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-eyebrow uppercase text-fg-muted">{label}</dt>
      <dd className="text-link text-fg-heading">{value}</dd>
    </div>
  )
}
