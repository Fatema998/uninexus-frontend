import { useState } from 'react'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QueryState } from '@/components/states'
import { ApiError } from '@/hooks/use-api'
import { money } from '@/lib/format'
import { useCreatePayment, usePaymentOptions } from '../api'
import type { ApiErrorBody, PaymentMethod } from '@/types'

/**
 * Make Payment — Figma 1:9415.
 *
 * Never optimistic (docs/api/student.md §5.3). The flow is
 * confirm → POST intent → gateway redirect, and every state shown is one the
 * server has actually reported.
 */
export function MakePayment() {
  const query = usePaymentOptions()
  const create = useCreatePayment()

  const [mode, setMode] = useState<'full' | 'custom'>('full')
  const [custom, setCustom] = useState('')
  const [method, setMethod] = useState<PaymentMethod | null>(null)
  const [confirming, setConfirming] = useState(false)

  /**
   * One key per attempt, regenerated only after a completed attempt. A retry
   * of the same payment reuses it, so a double-click cannot double-charge.
   */
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID())

  const fieldErrors = create.error instanceof ApiError ? (create.error.body as ApiErrorBody) : null

  return (
    <QueryState query={query}>
      {(d) => {
        // Compared as numbers for the UI gate only; the server decides.
        const outstanding = Number(d.outstanding)
        const minimum = Number(d.minimumPayable)
        const amount = mode === 'full' ? outstanding : Number(custom) || 0
        const valid = amount >= minimum && amount <= outstanding && method !== null

        function onConfirm() {
          if (!method) return
          create.mutate(
            {
              amount: amount.toFixed(2),
              methodId: method.id,
              invoiceIds: d.openInvoices.map((i) => i.id),
              idempotencyKey,
            },
            {
              onSuccess: (intent) => {
                setIdempotencyKey(crypto.randomUUID())
                // The gateway owns the next step. Hand off and stop.
                if (intent.redirectUrl) window.location.assign(intent.redirectUrl)
              },
            },
          )
        }

        return (
          <div className="flex flex-col gap-6">
            <PageHeader
              title="Secure Payment Portal"
              subtitle="Complete your academic transaction securely using our encrypted gateway."
            />

            <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
              <div className="flex flex-col gap-6">
                <Card>
                  <CardHeader title="Amount" />
                  <CardBody className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => setMode('full')}
                      className={cn(
                        'rounded-control border p-4 text-left transition-colors',
                        mode === 'full'
                          ? 'border-brand-600 bg-brand-600/5'
                          : 'border-border-strong bg-surface hover:bg-surface-subtle',
                      )}
                    >
                      <p className="text-link text-fg-heading">Full Outstanding</p>
                      <p className="text-metric text-brand-700">{money(d.outstanding)}</p>
                      <p className="text-fg-muted">All pending dues for {d.termName}</p>
                    </button>

                    <div
                      className={cn(
                        'rounded-control border p-4 transition-colors',
                        mode === 'custom'
                          ? 'border-brand-600 bg-brand-600/5'
                          : 'border-border-strong bg-surface',
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setMode('custom')}
                        className="text-link text-fg-heading"
                      >
                        Custom Amount
                      </button>
                      <label className="mt-2 block">
                        <span className="sr-only">Custom amount</span>
                        <Input
                          type="number"
                          min={minimum}
                          max={outstanding}
                          step="0.01"
                          value={custom}
                          onFocus={() => setMode('custom')}
                          onChange={(e) => setCustom(e.target.value)}
                          placeholder="0.00"
                          className="h-10"
                        />
                      </label>
                      <p className="mt-1 text-fg-muted">
                        Minimum {money(d.minimumPayable)}, maximum {money(d.outstanding)}
                      </p>
                      {mode === 'custom' && amount > 0 && amount < minimum && (
                        <p role="alert" className="mt-1 text-danger">
                          Below the {money(d.minimumPayable)} minimum.
                        </p>
                      )}
                      {mode === 'custom' && amount > outstanding && (
                        <p role="alert" className="mt-1 text-danger">
                          Cannot exceed the outstanding balance.
                        </p>
                      )}
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader title="Payment Method" />
                  <CardBody className="grid gap-3 sm:grid-cols-3">
                    {d.methods.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        disabled={!m.enabled}
                        onClick={() => setMethod(m)}
                        className={cn(
                          'rounded-control border p-4 text-left transition-colors disabled:opacity-50',
                          method?.id === m.id
                            ? 'border-brand-600 bg-brand-600/5'
                            : 'border-border-strong bg-surface hover:bg-surface-subtle',
                        )}
                      >
                        <p className="text-eyebrow uppercase text-fg-muted">{m.label}</p>
                        <p className="mt-1 text-fg-body">{m.note}</p>
                      </button>
                    ))}
                  </CardBody>
                </Card>
              </div>

              <aside>
                <Card className="xl:sticky xl:top-24">
                  <CardHeader title="Summary" />
                  <CardBody className="flex flex-col gap-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-fg-muted">Amount</span>
                      <span className="text-link text-fg-heading">{money(amount)}</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-fg-muted">Method</span>
                      <span className="text-link text-fg-heading">{method?.label ?? '—'}</span>
                    </div>

                    {create.isError && (
                      <p role="alert" className="text-danger">
                        {fieldErrors?.amount ?? fieldErrors?.detail ?? 'Payment could not be started.'}
                      </p>
                    )}

                    {confirming ? (
                      <div className="mt-2 rounded-control border border-warning/40 bg-warning/5 p-3">
                        <p className="text-fg-body">
                          Confirm a payment of <strong>{money(amount)}</strong> via {method?.label}?
                        </p>
                        <div className="mt-3 flex gap-2">
                          <Button
                            className="flex-1"
                            disabled={create.isPending}
                            onClick={onConfirm}
                          >
                            {create.isPending ? 'Starting…' : 'Confirm'}
                          </Button>
                          <Button
                            variant="outline"
                            disabled={create.isPending}
                            onClick={() => setConfirming(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                        <p className="mt-2 text-fg-muted">
                          You will be redirected to the payment gateway to complete this.
                        </p>
                      </div>
                    ) : (
                      <Button
                        disabled={!valid}
                        onClick={() => setConfirming(true)}
                        className="mt-2 h-11 w-full text-body"
                      >
                        <Lock className="size-4" aria-hidden />
                        Continue
                      </Button>
                    )}
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
