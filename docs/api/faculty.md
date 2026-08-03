# Faculty API Contract

Everything the faculty portal sends and receives. 15 GET, 8 write endpoints,
covering all 14 faculty screens in [screen-inventory.md](../screen-inventory.md).

- **Types:** [`src/types/faculty.ts`](../../src/types/faculty.ts) — import as `import type { faculty } from '@/types'`
- **Mock server:** `bun run mock` → `http://localhost:8787` ([mock/faculty-data.ts](../../mock/faculty-data.ts))
- **Check it:** `bun run mock:test`

**Conventions are shared** — base URL, formats, envelopes, transport,
compression, caching, errors, auth and the optimistic-UI pattern are in
**[general.md](general.md)** and apply here unchanged. This document covers
only what is different about faculty.

---

## 1. What makes faculty different

A student reads their own record. **A faculty member writes other people's.**

Every write in this contract lands on a student's transcript — a grade, an
attendance mark, a released result. That single fact drives three rules that
do not appear in the student contract:

1. **Almost nothing is optimistic** (§5). The student contract is roughly half
   optimistic; here it is one endpoint out of eight.
2. **Writes are whole-object, not partial** (§4). PUT for grading and
   attendance, never PATCH.
3. **The server owns eligibility, not just validity.** A locked column, a
   passed deadline, a registrar-owned field — these come back as 403/409 with
   a reason, and the UI renders the reason rather than hiding the control.

### 1.1 Everything is section-scoped

`CourseRef` is not enough to address anything a faculty member does. The same
course runs three sections with different rosters, different schedules and
different progress. **`Section` is the unit**: one course, one section, one
term.

```ts
Section = { id, course: CourseRef, name: 'A', termId, enrolledCount, room }
```

Every roster, gradebook, attendance sheet and assignment hangs off a
`sectionId`. A request that omits it is a bug, not a default.

### 1.2 `StudentRef` is deliberately thin

```ts
StudentRef = { id, registrationNo, fullName, avatarUrl }
```

No fees, no contact details, no home address. A teacher grading an assignment
has no business reading a student's payment history, and an endpoint that
returns it invites a screen that displays it. The one exception is
`SubmissionDetailResponse.student`, which adds `cgpa` and `lateSubmissions` —
grading context, and nothing beyond it.

---

## 2. Endpoints

`R` = request body type, `→` = response type. All under `/api/faculty/`.
Types are in [`src/types/faculty.ts`](../../src/types/faculty.ts).

### 2.1 Dashboard & academic

| Method | Path | R → | Screen |
|---|---|---|---|
| GET | `dashboard/` | → `FacultyDashboardResponse` | `/faculty` |
| GET | `academic/` | → `FacultyAcademicResponse` | Academic Overview |

`todaySchedule[].state` is computed server-side against the clock, so a tab
left open overnight cannot show yesterday's 9am lecture as `CURRENT`.

`pendingReviews` is oldest-first: it is a work queue, not a feed.

### 2.2 Courses

| Method | Path | R → | Screen |
|---|---|---|---|
| GET | `sections/` | → `AssignedSectionsResponse` | My Assigned Courses |
| GET | `sections/{id}/` | → `SectionDetailResponse` | Courses Management |
| POST | `sections/{id}/materials/` | multipart → `Attachment[]` (201) | Courses Management |
| DELETE | `sections/{id}/materials/{materialId}/` | → 204 | Courses Management |

Material upload is `multipart/form-data`, same rules as student assignment
submission — see [student.md §6.2](student.md#62-assignment-submission--multipart).
Do not set `Content-Type`; the browser owns the boundary.

### 2.3 Assignments & grading

| Method | Path | R → | Screen |
|---|---|---|---|
| GET | `assignments/` | → `FacultyAssignmentsResponse` | Assignments Overview |
| POST | `assignments/` | `CreateAssignmentRequest` → `FacultyAssignment` (201) | Assignments Overview |
| GET | `assignments/{id}/submissions/` | → `SubmissionsResponse` | Assignments Review |
| GET | `submissions/{id}/` | → `SubmissionDetailResponse` | Assignments Review |
| PUT | `submissions/{id}/grade/` | `GradeSubmissionRequest` → `GradeSubmissionResult` | Assignments Review |

**Grading is PUT, not PATCH.** A grade is replaced wholesale. A partial rubric
would silently keep marks from a previous pass, and a teacher who re-graded
"Correctness" would not notice that "Documentation" still held last week's
number. The server rejects an incomplete rubric with a 400 naming the missing
criteria.

`release: false` stores the grade provisionally — the student sees nothing.
This is what makes a moderation pass possible before results go out.

`CreateAssignmentRequest.publish: false` is the same idea for assignments: a
draft the section cannot see.

`submittedCount` / `gradedCount` / `enrolledCount` all come from the server.
`enrolledCount` is the denominator for both and is snapshotted at computation
time, so a late enrolment cannot make a progress bar read 105%.

### 2.4 Gradebook

| Method | Path | R → | Screen |
|---|---|---|---|
| GET | `gradebook/?sectionId=` | → `GradebookResponse` | Grade Book Management |
| PATCH | `gradebook/?sectionId=` | `SaveGradesRequest` → `SaveGradesResult` | Grade Book Management |

**The save is batched, and partial success is the design.** A teacher tabs
through thirty cells and hits save once:

- Thirty individual requests would race each other into an inconsistent sheet.
- Rejecting the whole batch over one typo would lose twenty-nine good edits.

So one request, and `SaveGradesResult` reports both sides:

```jsonc
{ "saved": 28, "rejected": [{ "studentId": "stu-2", "columnId": "col-3", "reason": "Must be between 0 and 50." }] }
```

Render each `rejected` entry against its own cell. A toast saying "2 errors"
makes the teacher hunt for them.

`AssessmentColumn.editable` goes false once results are published. The column
stays visible and the inputs go read-only — hiding it would look like data
loss.

`row.total` is `null` until every column is entered. A partial sum reads like
a failing grade to a student who simply has not sat the final yet.

### 2.5 Attendance

| Method | Path | R → | Screen |
|---|---|---|---|
| GET | `attendance/?sectionId=&date=` | → `AttendanceSheetResponse` | Attendance Management |
| PUT | `attendance/{sessionId}/` | `SubmitAttendanceRequest` → `SubmitAttendanceResult` | Attendance Management |

**The whole roster goes up, every time.** This is the most important rule in
this document.

A partial submit cannot distinguish *"I have not marked this student yet"*
from *"this student was absent"*. Those two states differ by a student's exam
eligibility. The server rejects a roster with anyone missing, with a 400
saying how many.

`session: null` means no class is scheduled that day. Render that, do not
render an empty roster — a sheet of unmarked students on a public holiday is
how phantom absences get recorded.

`presentCount` counts `PRESENT` and `LATE`. `LATE` is an attendance-policy
distinction, not an absence.

### 2.6 Examinations

| Method | Path | R → | Screen |
|---|---|---|---|
| GET | `exams/` | → `FacultyExamsResponse` | Examination Management |
| POST | `exams/papers/{id}/submit/` | multipart → paper | Examination Management |

Paper status is `DRAFT → SUBMITTED → APPROVED | REJECTED`. Only the owner
moves it out of `DRAFT`; the rest is the exam controller's, and belongs in the
admin contract.

### 2.7 Profile, research, library, finance

| Method | Path | R → | Screen |
|---|---|---|---|
| GET | `profile/` | → `FacultyProfileResponse` | Profile |
| PATCH | `profile/` | `UpdateProfileRequest` → `FacultyProfileResponse` | Profile |
| GET | `research/` | → `ResearchPortfolioResponse` | Research Portfolio |
| GET | `research/grants/` | → `GrantsResponse` | Research & Grants |
| GET | `library/?q=&kind=&page=` | → `Paginated<LibraryItem>` | Library Resources |
| POST | `library/{id}/reserve/` | → `ReserveItemResult` (201) | Library Resources |
| GET | `finance/` | → `FacultyFinanceResponse` | Personal Finance |

**`PATCH profile/` accepts three fields and only three**: `phone`,
`officeRoom`, `specializations`. Name, designation and email are the
registrar's. Sending anything else returns **403** with
`code: "read_only_field"` — not a silent drop, which would leave a teacher
believing they had changed their own title.

`Payslip.period` is `2026-05`, not `"May 2026"`. Format at the edge.

`ReserveItemResult.status` is `RESERVED` when a copy is free and `QUEUED`
otherwise, with `queuePosition`. Both are successes; only the wording changes.

---

## 3. What the client sends

Same headers as the student contract
([general.md §7](general.md#7-auth)). One addition worth
stating: the client never sends the faculty member's own id. The JWT has it,
and an endpoint that accepted it would let one teacher grade in another's
name.

---

## 4. Whole-object writes

Two endpoints are PUT rather than PATCH, for the same reason:

| Endpoint | Why the whole object |
|---|---|
| `submissions/{id}/grade/` | A partial rubric keeps stale marks from an earlier pass |
| `attendance/{sessionId}/` | A partial roster cannot say "unmarked" vs "absent" |

The gradebook is the deliberate exception — it is PATCH, because the sheet is
genuinely a set of independent cells and a teacher edits a handful at a time.
The difference: a missing gradebook cell is honestly "not entered yet" and
displays as such, whereas a missing attendance mark would be *interpreted*.

---

## 5. Optimistic UI

The student contract's rule still holds — be optimistic when the outcome is
predictable, cheap to reverse, and low-stakes if briefly wrong. Faculty writes
fail all three tests far more often.

| Mutation | Optimistic | Why |
|---|---|---|
| Reserve a library item | **yes** | Reversible, low-stakes, and the queue position is the only surprise |
| Upload course material | **no** | Real upload duration; show progress |
| Create assignment | **no** | Server assigns the id and validates the due date |
| Grade a submission | **never** | It is a transcript entry. A number that appears and then changes is worse than a number that takes 300ms |
| Save gradebook cells | **no** | Partial success — you cannot predict which cells the server keeps |
| Submit attendance | **never** | Eligibility. A row that flickers to PRESENT and reverts is a dispute |
| Submit exam paper | **no** | Upload with a deadline; the receipt matters |
| Edit own profile | **yes** | Three text fields, instantly reversible |

**The gradebook deserves its own note.** It looks like the ideal optimistic
candidate — small edits, obvious outcome — and it is the opposite. The server
may accept 28 of 30 cells, so an optimistic patch would show all 30 landing
and then quietly revert two. The teacher has already moved on. Wait for
`SaveGradesResult` and mark the rejected cells in place.

The pattern and the `useOptimistic` helper are documented once in
[general.md §9](general.md#9-optimistic-ui).

---

## 6. Mock server

Same as [general.md §8](general.md#8-mock-server) — `bun run mock`,
`VITE_API_URL=http://localhost:8787 bun run dev`, sign in as `faculty` with
any password. `?_delay` and `?_fail` work on faculty routes too.

Faculty state is mutable in memory: gradebook cells and submitted attendance
persist until restart, so a save is visible on the next read.

`bun run mock:test` covers the guardrails specifically, because they are the
part most likely to be quietly dropped in a real implementation:

- grading with a partial rubric → 400
- a mark above the criterion max → 400
- a complete rubric grades to the right total and letter
- a partial roster → 400
- `LATE` counts toward `presentCount`
- gradebook partial success: good cells persist, rejected ones do not
- editing a registrar-owned profile field → 403

---

## 7. For the backend developer

Beyond the student contract's list
([student.md §10](student.md#10-for-the-backend-developer)):

1. **Authorisation is per-section, not per-role.** `role: faculty` is not
   enough — a teacher may only read and write sections assigned to them.
   Enforce it in the queryset, not the view, or the first `?sectionId=` typo
   becomes a data leak.
2. **`StudentRef` must not grow.** If a screen needs more, that is a
   conversation about what a teacher should see, not a serializer change.
3. **Grade releases need an audit trail** — who released, when, and the
   previous value. Not in this contract because no screen shows it, but the
   table should exist before the first release.
4. **Attendance sessions must be real rows**, created from the timetable. The
   mock synthesises `ses-{sectionId}-{date}`; a real backend needs a session
   that exists before it is marked, or a holiday becomes markable.
5. **`AssessmentColumn.weightPercent` must sum to 100 per section.** Validate
   on the column, not at grade time, or the first inconsistent sheet surfaces
   as a wrong final grade.
6. **Who may set `editable: false`?** Presumably publishing results locks the
   column — confirm whether a department head can unlock it, and whether that
   needs its own endpoint.
