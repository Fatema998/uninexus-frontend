import { useState } from 'react'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardBody, CardHeader } from '@/components/patterns/card'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QueryState } from '@/components/states'
import { money } from '@/lib/format'
import { useMakePayment } from '../api'

/**
 * Make Payment — Figma 1:9415.
 * Confirmation step before anything is charged (docs/prd.md §4.5).
 */
export function MakePayment() {
  const query = useMakePayment()
  const [mode, setMode] = useState<'full' | 'custom'>('full')
  const [custom, setCustom] = useState('')
  const [method, setMethod] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  return (
    <QueryState query={query}>
      {(d) => {
        const amount = mode === 'full' ? d.outstanding : Number(custom) || 0
        const valid = amount > 0 && amount <= d.outstanding && method !== null

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
                      <p className="text-fg-muted">All pending dues for {d.term}</p>
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
                          min={1}
                          max={d.outstanding}
                          value={custom}
                          onFocus={() => setMode('custom')}
                          onChange={(e) => setCustom(e.target.value)}
                          placeholder="0.00"
                          className="h-10"
                        />
                      </label>
                      <p className="mt-1 text-fg-muted">Enter a specific amount to pay now</p>
                      {mode === 'custom' && amount > d.outstanding && (
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
                        key={m.label}
                        type="button"
                        onClick={() => setMethod(m.label)}
                        className={cn(
                          'rounded-control border p-4 text-left transition-colors',
                          method === m.label
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
                      <span className="text-link text-fg-heading">{method ?? '—'}</span>
                    </div>

                    {confirming ? (
                      <div className="mt-2 rounded-control border border-warning/40 bg-warning/5 p-3">
                        <p className="text-fg-body">
                          Confirm a payment of <strong>{money(amount)}</strong> via {method}?
                        </p>
                        <div className="mt-3 flex gap-2">
                          <Button className="flex-1" disabled>
                            Confirm
                          </Button>
                          <Button variant="outline" onClick={() => setConfirming(false)}>
                            Cancel
                          </Button>
                        </div>
                        <p className="mt-2 text-fg-muted">
                          Gateway not connected — this is the confirmation step only.
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
