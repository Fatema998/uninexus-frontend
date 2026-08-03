/**
 * Display formatting. The API sends raw values — ISO instants, decimal
 * strings, byte counts — and every one of them becomes a string here and
 * nowhere else. See docs/api/student.md §1.2.
 *
 * All `Intl`, no dependencies.
 */

import type { ISODate, ISODateTime, Money } from '@/types'

/**
 * Currency is Bangladeshi taka throughout the design (every finance frame
 * shows ৳). Resolves docs/prd.md §6.3.
 *
 * Locale is `en-GB`, not `en-BD`: en-BD suffixes the symbol (`48,500.00৳`),
 * and every finance frame prefixes it. Caught by format.test.ts.
 */
export const BDT = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'BDT',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 2,
})

/** `"48500.00"` -> `৳48,500.00`. Takes the wire's decimal string, or a number. */
export const money = (amount: Money | number) => BDT.format(Number(amount))

// ------------------------------------------------------------------ dates

const DATE = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
const DATE_SHORT = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' })
const TIME = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })

/** `2026-05-25` or an instant -> `25 May 2026`. */
export const date = (v: ISODate | ISODateTime) => DATE.format(new Date(v))

/** `25 May` — for dense rows where the year is obvious from context. */
export const dateShort = (v: ISODate | ISODateTime) => DATE_SHORT.format(new Date(v))

/** `02:00 pm`, in the viewer's local zone. */
export const time = (v: ISODateTime) => TIME.format(new Date(v))

/** `25 May 2026 • 02:00 pm` */
export const dateTime = (v: ISODateTime) => `${date(v)} • ${time(v)}`

/** `10:00 am - 11:30 am` */
export const timeRange = (from: ISODateTime, to: ISODateTime) => `${time(from)} - ${time(to)}`

const RELATIVE = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31_536_000_000],
  ['month', 2_592_000_000],
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
]

/**
 * `in 3 days`, `2 hours ago`. Picks the largest unit that yields |n| >= 1, so
 * a 90-minute gap reads "in 1 hour", not "in 90 minutes".
 *
 * Truncates rather than rounds: on a deadline, "in 1 hour" with 90 minutes
 * left is a safe understatement — "in 2 hours" with 90 minutes left is not.
 */
export function relative(v: ISODateTime, now = Date.now()): string {
  const diff = new Date(v).getTime() - now
  for (const [unit, ms] of UNITS) {
    const n = diff / ms
    if (Math.abs(n) >= 1) return RELATIVE.format(Math.trunc(n), unit)
  }
  return 'just now'
}

// ------------------------------------------------------------------ scalars

/** Seconds -> `1h 30m` / `18:24`, matching how the design labels durations. */
export function duration(seconds: number, style: 'clock' | 'words' = 'words'): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (style === 'clock') {
    const pad = (n: number) => String(n).padStart(2, '0')
    return h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
  }
  return h ? `${h}h ${m}m` : `${m}m`
}

const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB']

/** `4404019` -> `4.2 MB`. Binary units, matching what an OS reports. */
export function fileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  let n = bytes
  let i = 0
  while (n >= 1024 && i < SIZE_UNITS.length - 1) {
    n /= 1024
    i++
  }
  return `${n.toFixed(n < 10 ? 1 : 0)} ${SIZE_UNITS[i]}`
}

/** `3.88` from a number the server sent as a number. Two decimals, always. */
export const gpa = (v: number) => v.toFixed(2)

/** `78` -> `78%`. Exists so the `%` is never hand-concatenated in a component. */
export const percent = (v: number) => `${Math.round(v)}%`
