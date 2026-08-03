import { useState } from 'react'
import { useParams } from 'react-router'
import { KeyRound, Laptop, MapPin, ShieldCheck } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/patterns/badge'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { MetricCard } from '@/components/patterns/metric-card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { QueryState } from '@/components/states'
import { ApiError } from '@/hooks/use-api'
import { dateTime, relative } from '@/lib/format'
import {
  useChangeUserStatus,
  useRevokeSession,
  useSecurityProfile,
  useSendPasswordReset,
} from '../api'
import type { ApiErrorBody } from '@/types'
import type { UserStatus } from '@/types/admin'

const STATUS_TONE: Record<UserStatus, BadgeTone> = {
  ACTIVE: 'success',
  SUSPENDED: 'warning',
  INVITED: 'info',
  DEACTIVATED: 'neutral',
}

const STATUSES: UserStatus[] = ['ACTIVE', 'SUSPENDED', 'DEACTIVATED']

/**
 * ERP User Management & Security Profile — Figma 7:15889.
 *
 * The only screen that reads PII. Every action here locks a real person out
 * or resets their credentials, so none is optimistic and each confirms with
 * what the server actually recorded. See docs/api/admin.md §3.2.
 */
export function SecurityProfile() {
  const { id = '' } = useParams()
  const query = useSecurityProfile(id)

  const changeStatus = useChangeUserStatus(id)
  const revoke = useRevokeSession(id)
  const resetPassword = useSendPasswordReset(id)

  const [nextStatus, setNextStatus] = useState<string>('')
  const [reason, setReason] = useState('')

  const statusError =
    changeStatus.error instanceof ApiError ? (changeStatus.error.body as ApiErrorBody) : null
  const revokeError = revoke.error instanceof ApiError ? (revoke.error.body as ApiErrorBody) : null

  return (
    <QueryState query={query}>
      {(d) => (
        <div className="flex flex-col gap-6">
          <PageHeader
            title={d.user.fullName}
            subtitle={`${d.user.role} • ${d.user.department?.name ?? 'No department'} • ${d.user.reference}`}
            action={<Badge tone={STATUS_TONE[d.user.status]}>{d.user.status}</Badge>}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            {d.stats.map((s) => (
              <MetricCard key={s.label} label={s.label} value={s.value} tone={s.tone} />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title="Active Sessions" icon={Laptop} />
              <CardBody className="flex flex-col gap-3">
                {d.sessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-3 rounded-control border border-border-strong bg-surface p-4"
                  >
                    <div className="min-w-0">
                      <p className="text-link text-fg-heading">{s.deviceLabel}</p>
                      <p className="truncate text-fg-muted">
                        {s.location ?? 'Unknown location'} • {relative(s.lastSeenAt)}
                      </p>
                    </div>
                    {/* The current session cannot be revoked — locking yourself
                        out of the console mid-incident is not recoverable. */}
                    {s.isCurrent ? (
                      <Badge tone="success">CURRENT</Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={revoke.isPending}
                        onClick={() => revoke.mutate(s.id)}
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}

                {revoke.isError && (
                  <p role="alert" className="text-danger">
                    {revokeError?.detail ?? 'Could not revoke that session.'}
                  </p>
                )}
                {revoke.isSuccess && (
                  <p role="status" className="text-success">
                    {revoke.data.summary} — recorded {relative(revoke.data.at)}.
                  </p>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Security Overview" icon={ShieldCheck} />
              <CardBody className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-fg-muted">
                  <MapPin className="size-4 shrink-0" aria-hidden />
                  {d.contact.phone ?? 'No phone on file'}
                </div>

                {d.notes.map((n) => (
                  <div key={n.id} className="border-l-2 border-nav-active-student pl-3">
                    <p className="text-link text-fg-heading">{n.label}</p>
                    <p className="text-fg-muted">{n.body}</p>
                  </div>
                ))}

                <div className="mt-2 border-t border-border pt-3">
                  <p className="mb-2 text-eyebrow uppercase text-fg-muted">Recent logins</p>
                  {d.recentLogins.map((l) => (
                    <p key={l.id} className={l.success ? 'text-fg-muted' : 'text-danger'}>
                      {dateTime(l.at)} • {l.location ?? 'Unknown'} •{' '}
                      {l.success ? 'success' : 'failed'}
                    </p>
                  ))}
                </div>

                <Button
                  variant="outline"
                  disabled={resetPassword.isPending}
                  onClick={() => resetPassword.mutate()}
                  className="mt-2 self-start"
                >
                  <KeyRound className="size-4" aria-hidden />
                  {resetPassword.isPending ? 'Sending…' : 'Send password reset'}
                </Button>
                {resetPassword.isSuccess && (
                  <p role="status" className="text-success">
                    {resetPassword.data.summary}
                  </p>
                )}
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader title="Account Status" />
            <CardBody className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-3">
                <Select value={nextStatus} onValueChange={setNextStatus}>
                  <SelectTrigger className="h-10 w-[200px]" aria-label="New status">
                    <SelectValue placeholder="Change status to…" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.filter((s) => s !== d.user.status).map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* A restriction with no recorded reason is indistinguishable
                  from a mistake three months later. */}
              {nextStatus && nextStatus !== 'ACTIVE' && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-link text-fg-heading">Reason (recorded in the audit log)</span>
                  <Textarea
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Why is this account being restricted?"
                  />
                </label>
              )}

              {changeStatus.isError && (
                <p role="alert" className="text-danger">
                  {statusError?.reason ?? statusError?.detail ?? 'Could not change the status.'}
                </p>
              )}
              {changeStatus.isSuccess && (
                <p role="status" className="text-success">
                  {changeStatus.data.audit.summary} — recorded by{' '}
                  {changeStatus.data.audit.actorName} {relative(changeStatus.data.audit.at)}.
                </p>
              )}

              <Button
                variant={nextStatus === 'ACTIVE' ? 'default' : 'destructive'}
                disabled={
                  !nextStatus ||
                  changeStatus.isPending ||
                  (nextStatus !== 'ACTIVE' && reason.trim().length < 10)
                }
                onClick={() => changeStatus.mutate({ status: nextStatus as UserStatus, reason })}
                className="h-11 self-start text-body"
              >
                {changeStatus.isPending ? 'Applying…' : `Set to ${nextStatus || '…'}`}
              </Button>
            </CardBody>
          </Card>
        </div>
      )}
    </QueryState>
  )
}
