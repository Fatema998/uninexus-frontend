# API Conventions

Rules that hold for **every** persona. The per-persona contracts
([student.md](student.md), [faculty.md](faculty.md), [admin.md](admin.md))
cover only what is specific to them and reference this document for the rest.

- **Types:** [`src/types/common.ts`](../../src/types/common.ts) — the wire primitives every contract is built from
- **Mock server:** `bun run mock` → `http://localhost:8787`
- **Check it:** `bun run mock:test`

---

## 1. Base, versioning, trailing slashes

```
{VITE_API_URL}/api/student/<module>/<resource>/
```

- **Trailing slash is mandatory.** Django's `APPEND_SLASH` 301-redirects
  otherwise, and a redirected POST loses its body in some clients.
- **No `/v1/`.** One frontend, one backend, deployed together. A version
  segment we never bump is decoration. When a breaking change is genuinely
  needed, add `/api/v2/<that endpoint>` — per endpoint, not per API.
- `VITE_API_URL` unset → the app uses relative URLs and the dev login in
  [`src/lib/dev-auth.ts`](../../src/lib/dev-auth.ts). Set it to point at the
  mock server or the real backend.

## 2. Data formats

The wire carries values. The UI carries strings. Nothing arrives
pre-formatted — `'Oct 24, 2023'` and `'৳48,500.00'` are UI output, not API
output. Everything renders through [`src/lib/format.ts`](../../src/lib/format.ts).

| Concept | Wire | Type | Renders with |
|---|---|---|---|
| Instant | `"2026-05-25T18:00:00Z"` — always UTC, always `Z` | `ISODateTime` | `dateTime()`, `time()`, `relative()` |
| Calendar date | `"2026-05-25"` | `ISODate` | `date()`, `dateShort()` |
| Wall-clock time | `"14:30"` — timetable slots, no zone | `TimeOfDay` | rendered as-is |
| Money | `"48500.00"` — decimal **string** | `Money` | `money()` |
| Duration | `5400` — seconds | `number` | `duration()` |
| File size | `4404019` — bytes | `number` | `fileSize()` |
| Percent | `78` — 0–100, never 0–1 | `number` | `percent()` |
| GPA / points | `3.88` — number | `number` | `gpa()` |
| Enum | `"DUE_SOON"` — SCREAMING_SNAKE | union type | mapped in the component |
| Id | `"asg-2"` — opaque string | `Id` | never displayed |

**Why money is a string.** DRF serialises `DecimalField` to a string by
default, and floats lose paisa when summed: `0.1 + 0.2 !== 0.3`. `money()`
takes `Money | number`, so nothing at the call site changes. Never do
arithmetic on the client — if you need a total, the server sends one.

**Why UTC only.** The portal is single-campus today, but a student on
exchange reading `18:00` for a `18:00 Asia/Dhaka` exam is a missed exam.
`Intl` converts to the viewer's zone for free.

**Nulls, not sentinels.** An ungraded course sends `grade: null`, not
`"N/A"`. `"N/A"` is a language choice; `null` is a fact. Optional fields are
`T | null` in responses (always present, sometimes empty) and `?:` in request
bodies (omittable).

**Two id fields where humans read one.** `Invoice.id` is `"inv-2"`;
`Invoice.number` is `"INV-4402"`. The first addresses the row, the second is
printed on the document. Never route on the human one.

## 3. Envelopes

Single resources are returned bare — no `{ "data": ... }` wrapper. The status
code already says whether it worked, and a wrapper is a field to unwrap on
every one of 61 endpoints.

Lists that can outgrow a screen use DRF's `PageNumberPagination` shape,
because that is what the backend produces by default:

```ts
Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] }
```

`next`/`previous` are absolute URLs. Pass them back to `apiFetch` verbatim;
do not rebuild them from a page number.

Feeds where rows are inserted while you page — forum threads, payment
history — use `Cursored<T>` instead. Offset pagination on a live feed either
skips a row or shows it twice.

Bounded lists (six metrics, five timetable slots, four installment steps) are
plain arrays inside the screen payload. Paginating them would be ceremony.

## 4. Transport: JSON, and compression at the edge

**Wire format is JSON.** Not MessagePack, not protobuf. The largest student
payload is the faculty directory at ~6 KB uncompressed; `JSON.parse` is
native and faster than any userland decoder at this size, DRF speaks it
natively, and it is debuggable in the network tab. A binary format here would
cost a schema pipeline and buy nothing measurable.

**Compression is HTTP-level and not the application's job.** Set it on the
reverse proxy (nginx / Cloudflare):

```
Content-Encoding: br      # gzip fallback for older clients
Vary: Accept-Encoding
gzip_min_length 1024      # below this, framing costs more than it saves
```

JSON compresses 6–10× because it is mostly repeated keys. Never compress in
a Django view — you would lose streaming, break `Content-Length`, and
duplicate what the proxy already does.

The mock server implements exactly this rule (`GZIP_MIN_BYTES = 1024`,
`Vary: Accept-Encoding`) so dev numbers match production. `bun run mock:test`
asserts the negotiation.

**Never compress:** PDFs, images, video, ZIPs. Already compressed; gzipping
them burns CPU to add bytes. Stream them with `Content-Type` set and let the
proxy skip them by MIME type.

**Not applicable here:** BREACH-style attacks need a secret reflected in a
compressed response body plus attacker-controlled input in the same body.
This API authenticates with a bearer header, not a cookie, and never echoes
request input into a response containing a token.

## 5. Caching

| Class | Endpoints | Header |
|---|---|---|
| Per-student, changes rarely | curriculum, calendar, certificates | `Cache-Control: private, max-age=300` + `ETag` |
| Per-student, live | dashboard, attendance, assignments | `Cache-Control: private, no-cache` + `ETag` |
| Money | invoices, payments, statement | `Cache-Control: private, no-store` |
| Signed file URLs | attachments, PDFs, video | `no-store` on the JSON; the URL itself is short-lived |

`ETag` + `If-None-Match` turns an unchanged 6 KB response into a 304 with no
body. Worth wiring on the first list; not worth wiring on all 61 up front.

## 6. Errors

DRF's shape. Field errors and the non-field `detail` arrive in one object:

```jsonc
{ "detail": "Not found." }                                  // 404
{ "detail": "Given token not valid…", "code": "token_not_valid" }  // 401
{ "amount": ["Cannot exceed the outstanding 48500.00."] }   // 400, field error
{ "detail": "No seats remaining.", "code": "seat_unavailable" } // 409
```

`ApiError` from [`use-api.ts`](../../src/hooks/use-api.ts) carries `.status`
and `.body`. Branch on `code` when present — never on the human-readable
`detail`, which is copy and will change.

| Status | Means | UI does |
|---|---|---|
| 400 | Validation failed | Field errors under the inputs |
| 401 | Token dead | `apiFetch` refreshes and retries once, then signs out |
| 403 | Authenticated, not allowed | Full-page "not available for your account" |
| 404 | No such resource | Empty state, not an error state |
| 409 | Conflict — seat gone, already submitted | Toast + refetch; **rolls back an optimistic update** |
| 422 | Semantically invalid but well-formed | Same as 400 |
| 429 | Rate limited (AI endpoints) | Disable the trigger, show the retry window |
| 5xx | Ours | Retry with backoff, then error state |

## 7. Auth

SimpleJWT, matching what [`src/lib/auth.ts`](../../src/lib/auth.ts) already
decodes:

| | |
|---|---|
| `POST /api/token/` | `TokenRequest` → `TokenResponse` |
| `POST /api/token/refresh/` | `RefreshRequest` → `RefreshResponse` |
| `GET /api/me/` | → `Me` |

Every `/api/student/*` request carries `Authorization: Bearer <access>`.
`apiFetch` attaches it, and on 401 refreshes once and retries — concurrent
401s share one in-flight refresh rather than stampeding.

**The access token must carry a `role` claim.** SimpleJWT does not emit it;
without it the app cannot pick a shell and treats the session as
unauthenticated. See [architecture.md §5](../architecture.md#5-data).

`GET /api/me/` exists because the JWT is a summary. Registration number,
programme, avatar, and the active term belong in a response body that can
change without minting a new token.

---

## 8. Mock server

```sh
bun run mock        # http://localhost:8787, --watch
bun run mock:test   # every route + the write paths + failure injection
```

Point the app at it:

```sh
VITE_API_URL=http://localhost:8787 bun run dev
```

Sign in as `student`, `faculty`, or `admin` with any password.

| Knob | Effect |
|---|---|
| `?_delay=1200` | Hold the response — see skeletons and optimistic patches |
| `?_fail=409` | Return that status instead of the payload — see rollbacks |
| `?_fail=500&_delay=900` | Fail *after* the delay — the only way to watch a patch sit, then revert |
| `MOCK_LATENCY=0` | Baseline latency (default 250ms) |
| `MOCK_ACCESS_TTL=20` | Short access tokens, to exercise 401 → refresh → retry |
| `MOCK_PORT=9000` | Port |

It is stateful in memory: everything a mutation touches persists until
restart, so a write is visible on the next read.

What it deliberately does **not** do: enforce authorisation beyond "is there a
live token", validate exhaustively, or persist. It is a contract to build
against, not a second implementation of the registrar.

---

## 9. Optimistic UI

**Be optimistic when the outcome is predictable, cheap to reverse, and
low-stakes if briefly wrong.** Otherwise show a pending state.

Optimism is a lie you tell the user for ~200ms. It is worth telling when you'd
win the bet 99 times out of 100 and losing costs a toast.

The ratio falls off sharply by persona, and that is the point rather than an
inconsistency:

| Persona | Optimistic | Because |
|---|---|---|
| Student | ~half | Notes, replies, read-receipts — their own data, trivially reversed |
| Faculty | 1 of 8 | Writes land on someone else's transcript |
| Admin | 1 of 9 | Writes are institutional facts |

Per-mutation tables live in each contract:
[student §5.2](student.md#52-per-mutation-policy),
[faculty §5](faculty.md#5-optimistic-ui),
[admin §6](admin.md#6-optimistic-ui).

### The pattern

`useOptimistic` in [`use-api.ts`](../../src/hooks/use-api.ts) returns the three
options a react-query mutation needs. Spread it in:

```ts
const patch = useOptimistic<Paginated<Note>, CreateNoteRequest>(
  ['lms', 'notes'],
  (page, vars) => ({
    ...page,
    count: page.count + 1,
    results: [{ ...vars, id: `tmp-${crypto.randomUUID()}` }, ...page.results],
  }),
)

const create = usePostData<Note, CreateNoteRequest>('/api/student/lms/notes/', ['lms', 'notes'], patch)
```

Three things it does that hand-rolled versions forget:

1. **`cancelQueries` before reading the snapshot.** An in-flight GET that
   resolves after your patch will overwrite it with pre-mutation data.
2. **Snapshot the whole query, not the row.** Rolling back one field cannot
   undo a reorder or a recomputed count.
3. **`invalidateQueries` in `onSettled`, on success too.** The server owns
   derived fields — `count`, `unreadCount`, `total`, `state`. Your patch
   guessed at them; the refetch corrects the guess.

**Temporary ids must be visibly temporary.** Prefix with `tmp-` and disable
row actions while `id.startsWith('tmp-')`. A delete fired against a `tmp-` id
404s, and the rollback then removes the wrong row.

### Verifying it

This is the reason the mock server exists rather than a fixture file:

```
POST http://localhost:8787/api/student/lms/notes/?_fail=500&_delay=900
```

An optimistic update you have never seen roll back is not implemented, it is
assumed.

---

## 10. Batched writes and partial success

Two screens save many cells at once — the faculty gradebook and admin marks
entry. Both use the same contract, and it is worth stating once:

```jsonc
{ "saved": 28, "rejected": [{ "studentId": "…", "reason": "Must be between 0 and 50." }] }
```

- **One request, not thirty.** Thirty requests race each other into an
  inconsistent sheet.
- **Partial success, not all-or-nothing.** Rejecting the batch over one typo
  loses twenty-nine good edits.
- **Render each reason against its own cell.** A toast saying "2 errors" makes
  the user hunt for them.
- **Never optimistic.** You cannot predict which cells the server keeps, so a
  patch would show all thirty land and then quietly revert two.

---

## 11. For the backend developer

The per-contract lists are in
[student §10](student.md#10-for-the-backend-developer),
[faculty §7](faculty.md#7-for-the-backend-developer) and
[admin §8](admin.md#8-for-the-backend-developer). Three items apply everywhere:

1. **The access token needs a `role` claim.** SimpleJWT does not emit one, and
   without it the app cannot pick a shell and treats the session as
   unauthenticated.
2. **`COERCE_DECIMAL_TO_STRING` stays at its default `True`.** `Money` is a
   decimal string and every contract depends on it.
3. **`USE_TZ = True`, and all datetimes serialise as UTC with `Z`.**
