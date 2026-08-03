/**
 * Wire-format primitives shared by every persona.
 *
 * These describe what crosses the network, not what a component renders.
 * Nothing here is pre-formatted for display: dates are ISO-8601, money is a
 * decimal string, enums are SCREAMING_SNAKE. Formatting happens at the edge
 * with `src/lib/format.ts`.
 *
 * See docs/api/student.md §1 for the reasoning.
 */

// --------------------------------------------------------------- scalars

/** ISO-8601 date, no time: `2026-05-25`. Use for anything without a clock. */
export type ISODate = string

/** ISO-8601 instant in UTC: `2026-05-25T18:00:00Z`. Always UTC, always `Z`. */
export type ISODateTime = string

/** Local wall-clock time, no date, no zone: `14:30`. Timetable slots only. */
export type TimeOfDay = string

/**
 * Decimal amount as a string: `"48500.00"`.
 *
 * DRF serialises `DecimalField` to a string by default and we keep it that
 * way — floats lose paisa on sums. Render with `money()`, never with `+`.
 */
export type Money = string

/** Server-assigned opaque identifier. Never parse it, never sort on it. */
export type Id = string

/** ISO-4217. The portal is single-currency today; the field exists so a
 *  second campus does not become a migration. */
export type CurrencyCode = 'BDT'

// ------------------------------------------------------------- envelopes

/**
 * DRF's `PageNumberPagination` shape — the backend's default, so we take it
 * as-is rather than inventing a wrapper it would have to be configured into.
 *
 * `next` / `previous` are absolute URLs or null. Pass them straight back to
 * `apiFetch`; do not rebuild them from `page` params.
 */
export type Paginated<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

/**
 * Cursor pagination, for feeds where rows are inserted while you page
 * (forum threads, payment history). Offsets skip or repeat rows there.
 */
export type Cursored<T> = {
  results: T[]
  /** Opaque; pass as `?cursor=`. Null means the end. */
  nextCursor: string | null
}

/**
 * DRF's error body. Field errors and the non-field `detail` arrive in the
 * same object, which is why the value type is a union.
 *
 *   { "detail": "Not found." }
 *   { "amount": ["Ensure this value is less than or equal to 48500.00."] }
 */
export type ApiErrorBody = {
  detail?: string
  /** Machine-readable reason, for branching. Absent on generic 4xx. */
  code?: string
  [field: string]: string | string[] | undefined
}

// -------------------------------------------------------------- presentation

/**
 * Status colour, decided server-side.
 *
 * This is the one presentation concept that stays on the wire: the threshold
 * that makes 74% attendance `warning` and 92% `success` is institutional
 * policy, not a frontend constant. Kept identical to `MetricTone` in
 * `components/patterns/metric-card` so a wire value is always renderable.
 */
export type Tone = 'brand' | 'accent' | 'info' | 'success' | 'warning' | 'danger'

/** `Tone` plus the greyed-out variant only `Badge` supports. */
export type BadgeTone = Tone | 'neutral'

/** A server-computed summary tile. `icon` is a lucide-react export name. */
export type Metric = {
  label: string
  /** Pre-rounded for display — the server owns the rounding rule. */
  value: string
  tone: Tone
  icon?: string
  /** Suffix rendered small next to the value: `/ 120`. */
  unit?: string
  /** 0–100, drives the ring/bar when present. */
  progress?: number
  badge?: { label: string; tone: BadgeTone }
}

// -------------------------------------------------------------------- auth

export type Role = 'student' | 'faculty' | 'admin'

/** `POST /api/token/` */
export type TokenRequest = { username: string; password: string }
export type TokenResponse = { access: string; refresh: string }

/** `POST /api/token/refresh/` */
export type RefreshRequest = { refresh: string }
export type RefreshResponse = { access: string }

/** `GET /api/me/` — the full profile the JWT claims only summarise. */
export type Me = {
  id: Id
  role: Role
  fullName: string
  email: string
  avatarUrl: string | null
  /** `21-44390-1` — the registrar's number, not the database id. */
  registrationNo: string | null
  department: string | null
  programme: string | null
  /** Currently active term, so screens do not each ask for it. */
  currentTerm: Term | null
}

export type Term = {
  id: Id
  /** `Spring 2026` */
  name: string
  startsOn: ISODate
  endsOn: ISODate
  isCurrent: boolean
}
