# UniGPT — Product Requirements

**Product:** UniGPT — an AI-native university portal covering the full student, faculty, and institutional-admin lifecycle.
**Design source:** [Figma — uninexus](https://www.figma.com/design/H6SDkbXPzmF8l2DkDQmvB9/uninexus?node-id=0-1) — 93 frames, fully designed at 1280px.
**Status:** Requirements reverse-engineered from the design file. Sections marked ⚠️ are inferences, not designer/stakeholder statements — confirm before building the affected phase.

---

## 1. What this is

A single web application serving three roles against one university dataset:

| Role | Scale signal (from design copy) | Shell |
|---|---|---|
| **Student** | 12,485 students | Light sidebar |
| **Faculty** | 1,248 faculty | Light sidebar |
| **Institutional Admin** | 24 departments, 642 courses, ৳128.75M revenue | Dark sidebar |

Currency is **BDT (৳)** on admin screens and **$** on student screens. ⚠️ This is a genuine conflict in the design, not a locale feature — see §6.

The distinguishing feature is that AI is not a bolted-on chat widget. It has eight dedicated student screens, appears as a persistent right-rail assistant on the student dashboard, and surfaces as "UniGPT Insight" advisory cards inside faculty workflows.

---

## 2. Users and jobs

### Student
Wants to know, in one glance, what is due, what is owed, and how they are tracking. Then wants to act without hunting: submit an assignment, pay a fee, download an admit card, ask the AI to summarise a reading.

Primary jobs: check today's schedule · track CGPA/credits/attendance · submit coursework · sit quizzes · pay fees · get exam admit cards and results · get AI help with studying.

### Faculty
Wants their teaching load and grading backlog visible without assembling it. The dashboard leads with *Pending Assignment Reviews: 38* — reducing that number is the job.

Primary jobs: see today's teaching schedule · review and grade submissions · manage gradebook · take attendance · manage course materials · track research projects and grants.

### Institutional Admin
Wants institutional health as numbers and trends, plus the operational levers to act: approve admissions, publish results, manage users and fees.

Primary jobs: monitor enrolment/revenue/system health · manage users and permissions · run admissions review · schedule exams and publish results · oversee fee collection.

---

## 3. Scope

83 buildable screens. Full route map in [screen-inventory.md](screen-inventory.md).

| Module | Student | Faculty | Admin | Total |
|---|---|---|---|---|
| Dashboard / shell | 2 | 1 | 1 | 4 |
| Academic | 11 | 2 | 1 | 14 |
| Learning (LMS) | 18 | 5 | — | 23 |
| Attendance | 5 | 1 | — | 6 |
| Examination | 9 | 1 | 3 | 13 |
| Finance | 6 | 1 | 1 | 8 |
| AI Assistant | 8 | — | — | 8 |
| Research | — | 2 | — | 2 |
| Admissions | — | — | 2 | 2 |
| User management / profile | — | 1 | 2 | 3 |
| **Total** | **59** | **14** | **10** | **83** |

---

## 4. Functional requirements

Written against what the designs actually show. Each maps to screens in the inventory.

### 4.1 Shell (all personas)
- Persistent 260px sidebar, persona-specific nav, single active item.
- Top bar: global search with `Ctrl+K`, notification bell with unread count, messages, settings, identity block with name + role.
- Admin top bar additionally shows a date selector and a system-health indicator.

### 4.2 Student
- **Dashboard** — hero greeting with session badge; six metrics (CGPA with delta, credits with progress, attendance %, dues, classes today, unread notices); today's schedule with per-class status (`IN PROGRESS` / `UPCOMING`); active courses with per-course progress; right rail with AI assistant, attendance ring, recent grades.
- **Academic** — course registration, semester registration, drop/add, curriculum, degree and credit progress, class routine, academic calendar, classroom info, faculty directory.
- **LMS** — course materials, video lectures, live and recorded classes, assignments with submission flow, quizzes and practice quizzes, gradebook, discussion forum, notes, progress and analytics, announcements, downloads, certificates.
- **Attendance** — overall %, daily record, per-course breakdown, history, analytics. Design distinguishes Lectures / Labs / Seminars separately.
- **Examination** — schedule, upcoming, admit card, results, grade report, revaluation request, analytics, attendance sheet.
- **Finance** — balance and dues, fee statement, payment, payment history, invoices, installment plans.
- **AI** — chat workspace, study planner, note generator, quiz generator, assignment helper, academic advisor, course recommendations. Assistant offers contextual quick actions (`APPLY LEAVE`, `FEE RECEIPT`, `VERIFY GRADE`).

### 4.3 Faculty
- **Dashboard** — six metrics (active courses, total students, today's classes, pending reviews, attendance pending, research projects); today's teaching schedule with a *Launch AI Assistant* action per class; course table; pending review queue; teaching-hours ring; activity feed; profile card with rating and years of experience; quick actions; upcoming meetings; a UniGPT Insight card.
- **Courses** — course management and assigned-course views.
- **Assignments** — overview and per-submission review with grading.
- **Gradebook** — enter and publish grades.
- **Attendance** — take and manage attendance per section.
- **Research** — portfolio, projects, grant management.
- **Finance** — personal payroll/finance view.

### 4.4 Admin
- **Executive dashboard** — six KPIs with trend deltas (students, faculty, courses, departments, pending admissions, revenue); enrolment trend chart with Monthly/Quarterly toggle; student distribution donut (undergrad/graduate/postgrad); YTD fee collection against target; top departments; announcements; upcoming events; service health tiles (LMS, DB, API).
- **User management** — list, detail, security/permission profile.
- **Academic management** — departments, programmes, courses.
- **Admissions** — pipeline and per-application review workspace.
- **Finance** — accounts control centre, collection status.
- **Examination** — management hub, timetable matrix, marks entry and result publishing.

### 4.5 Cross-cutting
- Role-based routing and nav: a user only ever sees their persona's shell and routes.
- Every list needs empty, loading, and error states. ⚠️ None are designed — see §6.
- Every destructive or financial action needs confirmation.
- Search, notifications, and the AI assistant are available from any screen.

---

## 5. Non-functional requirements

| Area | Requirement |
|---|---|
| Design fidelity | Every value from [design.md](design.md). No ad-hoc colours or type sizes. |
| Responsive | Designed at 1280. Breakpoint rules in design.md §2 — ⚠️ house rules, only one mobile frame exists. |
| Accessibility | WCAG 2.1 AA: keyboard-navigable nav and tables, visible focus (2px `--brand-600`), labelled icon-only buttons, AA contrast. `--fg-muted` on `--surface` must be verified per use. |
| Performance | Route-level code splitting — 83 screens must not ship as one bundle. |
| State | Server state via React Query (already wired in `src/hooks/use-api.ts`). |
| Browsers | Evergreen. `backdrop-filter` is load-bearing for the card surfaces. |

---

## 6. Open questions

⚠️ Ordered by how early they block work.

1. **Backend.** No API exists. `src/hooks/use-api.ts` expects a REST base at `VITE_API_URL`. Is there a backend, or does the frontend build against mocks? **Blocks Phase 2.** Default assumption: build against typed mock fixtures behind the existing hooks, so the swap is one env var.
2. **Auth.** No login, signup, forgot-password, or 2FA screens are designed, but the admin has a "Security Profile". What is the auth provider? **Blocks Phase 1.**
3. **Currency.** Admin shows ৳ (BDT), student shows $. Which is real? If both, an actual i18n/currency layer is needed rather than hardcoded glyphs.
4. **Undesigned student modules.** My Profile, Library, Student Services, Clubs, Transport, Hostel, Digital ID are in the sidebar with no frames. Build as placeholders, hide from nav, or design first?
5. **Undesigned admin modules.** System Health, Settings, Support — same question.
6. **Empty / loading / error / zero states.** Not designed anywhere. Proposal: one shared set built in Phase 1 from existing tokens, applied everywhere.
7. **Duplicate frames.** 9 superseded iterations. [screen-inventory.md](screen-inventory.md) records the canonical pick per group; the admin picks (6 of the 9) most need confirmation.
8. **AI backing.** Are the eight AI screens backed by a real model, and which? Streaming or request/response? Affects the chat workspace and note/quiz generators materially.
9. **Real-time.** Live Classes, notifications, and "System Healthy" imply push. Polling or websockets?

---

## 7. Out of scope

Native mobile apps · dark mode (§design.md) · offline · multi-tenant/multi-university · public marketing site · admissions applicant-facing portal (only the admin-side *review* is designed).

---

## 8. Success criteria

1. All 83 canonical screens built and reachable via role-appropriate routes.
2. Zero hardcoded design values outside the token layer — enforceable by grepping for hex literals in `src/components` and `src/pages`.
3. Every screen has loading, empty, and error states.
4. Keyboard-only navigation works end to end on each persona's shell.
5. No route bundle regresses the dashboard's initial load past its Phase 1 budget.
