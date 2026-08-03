# Admin API Contract

Everything the institutional admin portal sends and receives. 14 GET, 11 write
endpoints, covering all 13 admin screens in
[screen-inventory.md](../screen-inventory.md).

- **Types:** [`src/types/admin.ts`](../../src/types/admin.ts) — import as `import type { admin } from '@/types'`
- **Mock server:** `bun run mock` → `http://localhost:8787` ([mock/admin-data.ts](../../mock/admin-data.ts))
- **Check it:** `bun run mock:test`

**Conventions are shared** — base URL, formats, envelopes, transport,
compression, caching, errors, auth and the optimistic-UI pattern are in
**[general.md](general.md)** and apply here unchanged. This document covers
only what is different about admin.

---

## 1. What makes admin different

A student reads their own record. A faculty member writes other people's.
**An admin changes the institution.**

Three properties follow, and they drive every decision below:

| Property | Consequence |
|---|---|
| **Scale** | A faculty roster is 50 rows; the user directory is 12,000. Pagination and server-side search are mandatory, not a nicety (§2) |
| **Blast radius** | One toggle changes behaviour for every user. Those writes carry an optimistic lock (§5) |
| **Irreversibility** | Publishing results, approving admissions, deactivating accounts — these cannot be undone from the UI, so they are confirmed, audited, and never optimistic (§6) |

Plus one that is not about mechanics: **admin is the only persona that reads
PII.** Contact details, login history and device sessions exist on exactly one
endpoint, and reading a directory of 12,000 users does not hand them over
(§3.2).

---

## 2. Lists are paginated and searched server-side

Every admin list endpoint takes `?q=`, filters, and `?page=&page_size=`, and
returns DRF's pagination fields alongside its metrics:

```ts
{ metrics: Metric[], count: number, next: string | null, previous: string | null, results: T[] }
```

The metrics describe the **whole** collection, not the page — "2,312 active
users" must not become "18 active users" because you are on page one.

**Client-side filtering is not an option here** and the mock enforces it: the
user directory has 137 rows precisely so that a page-one-only filter visibly
fails. `bun run mock:test` asserts that page 2 returns different rows and that
`?role=` and `?q=` are applied server-side.

---

## 3. Endpoints

`R` = request body type, `→` = response type. All under `/api/admin/`.
Types are in [`src/types/admin.ts`](../../src/types/admin.ts).

### 3.1 Dashboard & academic

| Method | Path | R → | Screen |
|---|---|---|---|
| GET | `dashboard/` | → `AdminDashboardResponse` | Executive Dashboard |
| GET | `academic/` | → `AcademicManagementResponse` | Academic Management |

`financial.collected` / `target` are `Money` strings; `percent` is
server-computed. The client never divides one by the other — see
[general.md §2](general.md#2-data-formats).

### 3.2 User management

| Method | Path | R → | Screen |
|---|---|---|---|
| GET | `users/?q=&role=&status=&page=` | → `UserManagementResponse` | User Management |
| POST | `users/` | `CreateUserRequest` → `UserRow` (201) | User Management |
| GET | `users/{id}/security/` | → `UserSecurityProfileResponse` | Security Profile |
| PATCH | `users/{id}/status/` | `ChangeUserStatusRequest` → `ChangeUserStatusResult` | Security Profile |
| DELETE | `users/{id}/sessions/{sessionId}/` | → `AuditEntry` | Security Profile |
| POST | `users/{id}/password-reset/` | → `AuditEntry` | Security Profile |

**`UserRow` carries no PII.** No phone, no address, no last-login IP, no
device history. Those are on `users/{id}/security/` and nowhere else. The
reason is blunt: a list endpoint is the easiest thing in a system to
accidentally log, cache, export to CSV, or leave open on a shared screen.
A directory of names and roles is a much smaller thing to leak than a
directory of home addresses.

**A status change requires a reason.** Anything other than reactivation
returns 400 without one. A deactivation with no recorded reason is
indistinguishable from a mistake three months later, when the person it
affected asks why.

**You cannot revoke the session you are using** — 409 with
`code: "current_session"`. Locking yourself out of the admin console
mid-incident is not a recoverable state.

Every one of these returns an `AuditEntry` describing what was recorded, so
the UI can say *"Suspended — recorded by you at 14:32"* rather than "Saved".

### 3.3 Admissions

| Method | Path | R → | Screen |
|---|---|---|---|
| GET | `admissions/?q=&status=&page=` | → `AdmissionsResponse` | Admission Management |
| GET | `admissions/{id}/` | → `ApplicationDetailResponse` | Application Review |
| POST | `admissions/{id}/decision/` | `DecideApplicationRequest` → `DecideApplicationResult` | Application Review |

A decision **sends an offer or rejection letter**. That makes it the second
most irreversible action in the product, and the contract reflects it:

- `templateId` is **required** when approving and **forbidden** otherwise —
  both are 400s. An approval with no letter attached is a half-finished
  admission; a rejection with an offer template is a catastrophe.
- Re-deciding an already `APPROVED` or `REJECTED` application is **409**
  (`already_decided`), not a silent overwrite.
- `notificationQueued` tells the UI whether the letter actually went out, so
  it can say so instead of implying it.

### 3.4 Examinations

| Method | Path | R → | Screen |
|---|---|---|---|
| GET | `exams/` | → `ExamHubResponse` | Examination Hub |
| GET | `exams/schedule/` | → `ExamScheduleResponse` | Exam Scheduling |
| PATCH | `exams/schedule/{slotId}/` | `AssignSlotRequest` → `ExamScheduleResponse` | Exam Scheduling |
| GET | `exams/marks/?sectionId=&assessmentId=` | → `MarksEntryResponse` | Marks Entry |
| PATCH | `exams/marks/` | `SaveMarksRequest` → `SaveMarksResult` | Marks Entry |
| POST | `exams/marks/publish/` | `PublishMarksRequest` → `PublishMarksResult` | Marks Entry |

**Slot assignment returns the whole schedule**, not the one slot. Assigning a
hall can resolve *or create* a conflict in a different row, and returning one
slot would leave the rest of the grid lying about its own state.

A hall already booked at the same instant is **409** (`hall_clash`) naming the
course it collides with. The same hall on a different day is fine — the mock
asserts both directions.

**Publishing marks is the single most irreversible action in the product.** It
makes results visible to every student in a section at once. Three guards:

1. `confirmation` must equal the course code, typed out. A one-click publish
   next to a save button is a mis-click waiting to happen.
2. Every row must have a mark — 409 (`incomplete`) otherwise. A blank cell
   published as nothing is a zero to the student reading it.
3. The sheet **locks** afterwards (`editable: false`, and further saves 409
   with `locked`). Correcting a published result is a different, audited
   workflow — not an edit.

Marks saving uses the same batched partial-success contract as the faculty
gradebook ([general.md §10](general.md#10-batched-writes-and-partial-success)) — good cells land,
rejected ones come back with reasons.

### 3.5 Finance

| Method | Path | R → | Screen |
|---|---|---|---|
| GET | `finance/` | → `AdminFinanceResponse` | Finance Control Center |
| GET | `finance/ledger/?cursor=&direction=` | → `Cursored<LedgerEntry>` | Finance Control Center |

Read-only. Admin **views** institutional money; it does not move it from this
screen. Refunds and adjustments are a separate workflow with their own
approval chain, and are deliberately not in this contract — a UI that can
issue a refund in two clicks is a UI that will.

The ledger is cursor-paginated: entries are inserted continuously, and offset
pagination on a live feed either skips a row or shows it twice.

### 3.6 System health, settings, support

| Method | Path | R → | Screen |
|---|---|---|---|
| GET | `health/` | → `SystemHealthResponse` | System Health |
| GET | `settings/` | → `AdminSettingsResponse` | Settings |
| PUT | `settings/` | `SaveSettingsRequest` → `SaveSettingsResult` | Settings |
| GET | `support/` | → `SupportResponse` | Support |
| PATCH | `support/tickets/{id}/` | `UpdateTicketRequest` → `Ticket` | Support |

`SystemHealthResponse.services[].checkedAt` matters: a health page with no
timestamp cannot be distinguished from a health page that stopped updating.
Poll it (`refetchInterval`), and show the check time.

`SupportResponse.topics[].url` are runbook links, server-owned so operations
can add one without a frontend deploy.

---

## 4. What the client sends

Same headers as the other contracts. Two admin-specific rules:

- **The client never sends the acting admin's id.** The JWT has it, and every
  `AuditEntry.actorName` comes from the token — an endpoint that accepted an
  actor id would let one admin record actions under another's name.
- **`reason` and `confirmation` fields are not decoration.** They are stored,
  and they appear in the audit trail. Sending a placeholder to satisfy the
  validator defeats the only mechanism that explains a change months later.

---

## 5. Optimistic locking on settings

`AdminSettingsResponse.version` is a token. Send it back on `PUT`; a mismatch
returns **409** (`stale_version`).

Without it, two admins with the settings page open produce last-write-wins:
the second save silently reverts the first, and neither knows. With it, the
second admin is told to reload and reapply.

```ts
const { version } = settings           // from the GET
save.mutate({ version, institution, term, toggles })
// 409 stale_version → someone else saved first; refetch and let them redo it
```

The version changes on every successful save, so a replayed request is
rejected too. The mock asserts all three: stale rejected, current accepted,
replay rejected.

`SettingToggle.institutionWide` marks the toggles that change behaviour for
everyone. The UI requires an explicit confirmation for those — turning off
online payments is not the same class of action as changing a contact email.

---

## 6. Optimistic UI

The rule from [general.md §9](general.md#9-optimistic-ui) still holds. Admin
fails it almost everywhere.

| Mutation | Optimistic | Why |
|---|---|---|
| Update a ticket status | **yes** | Internal bookkeeping, trivially reversible |
| Create a user | **no** | Server assigns the reference and can 409 on a duplicate email |
| Change user status | **never** | Locks a real person out. It must be recorded before it is shown |
| Revoke a session | **no** | Can 409 on the current session |
| Admissions decision | **never** | Sends a letter. There is no taking it back |
| Assign an exam slot | **no** | Can clash with a row the client cannot see |
| Save marks | **no** | Partial success — you cannot predict which cells the server keeps |
| **Publish marks** | **never** | Reaches every student at once |
| Save settings | **no** | Optimistic lock can reject the whole save |

One optimistic mutation out of nine. That ratio is the point: this persona's
writes are institutional facts, and showing one before it is true is a
correctness bug, not a UX trade-off.

---

## 7. Mock server

Same as [general.md §8](general.md#8-mock-server) — sign in as `admin` with
any password. `?_delay` and `?_fail` work on admin routes.

State that persists until restart: user status changes, revoked sessions,
admission decisions, slot assignments, marks (including the published lock),
settings version, ticket statuses.

`bun run mock:test` covers the guardrails, which are the whole substance of
this contract:

- directory paginates, page 2 differs, `?role=` and `?q=` filter server-side
- suspension without a reason → 400; with one → audit entry, and it persists
- revoking the current session → 409; another session → 200, and it disappears
- approval without a template → 400; complete approval queues the letter;
  re-deciding → 409
- double-booking a hall at the same sitting → 409; same hall another day → 200
- stale settings version → 409; current → 200 and bumps; replay → 409
- publish without the typed code → 400; with empty marks → 409; complete →
  200; the sheet then locks → 409

---

## 8. For the backend developer

Beyond the earlier lists
([student.md §10](student.md#10-for-the-backend-developer),
[faculty.md §7](faculty.md#7-for-the-backend-developer)):

1. **Audit is a table, not a log line.** Every write in §3 returns an
   `AuditEntry`; that implies persisted rows with actor, action, target,
   before/after and timestamp. Build it before the first write endpoint ships,
   not after the first dispute.
2. **`UserRow` must never grow PII.** If a screen needs a phone number, it
   calls the security endpoint. This is the kind of boundary that erodes one
   serializer field at a time.
3. **Publishing marks needs a transaction and an idempotency guard.** A retry
   after a timeout must not publish twice, and a partial publish is worse than
   a failed one.
4. **The settings `version` should be a row version or updated-at token**, not
   a hash — cheap to compare and impossible to collide.
5. **Who can do what?** This contract assumes one `admin` role. Real
   institutions separate registry, finance and IT: a finance clerk should not
   deactivate accounts, and IT should not approve admissions. If that is the
   intent, it needs a permission model now, because retrofitting one across 11
   write endpoints is far more expensive than designing it in.
6. **Rate-limit and alert on the destructive endpoints.** Bulk status changes
   and mark publishing are the two that a compromised admin session would
   reach for first.
