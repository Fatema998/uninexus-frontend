# Build Plan

> **Status 2026-08-03 — Phases 0–6 are complete and merged. All 82 screens are
> built; there are no placeholders left.** Phase 7 (hardening) is the remaining
> work.
>
> Auth is JWT against a Django backend owned by another developer. Run
> `bun run dev` and pick a role on the login page — a dev-only seam mints a
> local token while `VITE_API_URL` is unset. See
> [architecture.md §5](architecture.md#5-data).

Seven phases. Each is independently shippable, each has a definition of done you can actually run.

The ordering principle: **build the token layer and the shells before any screen, and build one screen per module before building the rest.** The dashboards exercise nearly every component in the system — once they're right, the remaining 70+ screens are assembly.

> Per the repo workflow: branch → change → verify → merge, per phase. Never commit to `main` directly.

---

## Phase 0 — Unbreak and clear the ground

The repo does not currently build.

| # | Task |
|---|---|
| 0.1 | **`bun run build` fails.** Commit `7f93448` deleted `src/App.css` but left `import './App.css'` at `src/App.tsx:5`. Remove the import and the starter markup. |
| 0.2 | Delete Vite starter leftovers: `src/assets/hero.png`, `react.svg`, `vite.svg`, and the starter block in `index.html`. |
| 0.3 | Strip the template token block from `src/index.css` — `--brand: #aa3bff`, `--code-bg`, `--social-bg`, `--accent-bg`, `--social-*`, the `font:` shorthand on `:root`. None are UniGPT values. |
| 0.4 | Add `react-router` v7. |

**Done when:** `bun run build` and `bun run lint` both pass, and `grep -rn '#aa3bff' src/` is empty.

---

## Phase 1 — Design system

Nothing else starts until this lands. Every later phase is downstream of it.

| # | Task |
|---|---|
| 1.1 | Write the full [design.md](design.md) §1 token set into `src/index.css` as `@theme`. |
| 1.2 | Wire Geist Variable as the single family (design.md §1.2). |
| 1.3 | Add the shadcn primitives the designs actually use: `input`, `table`, `avatar`, `dropdown-menu`, `dialog`, `tabs`, `select`, `separator`, `skeleton`. Nothing speculative. |
| 1.4 | Build `components/patterns`: `MetricCard` (cva, six status colours), `Card` + `CardHeader`, `Badge`, `ProgressBar`, `DataTable`, `HeroBanner`. |
| 1.5 | Build `components/states`: `LoadingState`, `EmptyState`, `ErrorState` — undesigned, so compose from tokens (PRD §6.6). |
| 1.6 | Add the no-raw-hex grep check (architecture.md §7) to CI. |

**Done when:** a scratch route renders every pattern in every variant, side by side, and it matches the Figma metric row visually — translucency, 4px bottom border, 18px radius, and the six status colours all present.

---

## Phase 2 — Shells and routing

| # | Task |
|---|---|
| 2.1 | `layouts/nav-config.ts` — the three nav arrays, from the sidebars in the design. |
| 2.2 | `NavItem` with all four states, both persona variants (gradient/light and flat-purple/dark). |
| 2.3 | `StudentShell`, `FacultyShell`, `AdminShell` — 260px sidebar, 64px topbar, 40px content canvas. |
| 2.4 | Topbar: search with `Ctrl+K`, notification bell with count, messages, settings, identity block. |
| 2.5 | `app/router.tsx` — all 83 routes from [screen-inventory.md](screen-inventory.md), every screen `lazy()`, placeholder components. |
| 2.6 | Role guard at each shell. |
| 2.7 | Responsive behaviour per design.md §2. |

**Done when:** all 83 routes resolve without a 404, each under the correct shell, and the sidebar collapses correctly at every breakpoint. Placeholders are fine.

---

## Phase 3 — The three dashboards

Highest-value phase. These three screens use nearly every component in the system, so they surface gaps while gaps are still cheap.

| # | Screen | Node |
|---|---|---|
| 3.1 | Student Dashboard | `9:6820` |
| 3.2 | Faculty Dashboard | `1:2` |
| 3.3 | Admin Executive Dashboard | `7:15548` |

Includes the student right rail (AI assistant panel, attendance ring, recent grades), the faculty rail (profile card, quick actions, meetings, Insight card), and the admin KPI row. Charts land here — add `recharts` now (architecture.md §1).

**Done when:** all three match their frames at 1280px, are driven by fixtures through `use-api.ts` hooks, and show real loading and error states.

---

## Phase 4 — Student modules (59 screens)

The bulk. Sub-phases are independently shippable and can run in parallel across people.

| # | Module | Screens | Notes |
|---|---|---|---|
| 4.1 | Academic | 11 | Registration flows are the most stateful work here. |
| 4.2 | LMS | 18 | Largest module. Assignment submission and quiz-taking are the real flows; the rest are lists and detail views. |
| 4.3 | Attendance | 5 | Lectures/Labs/Seminars tracked separately. |
| 4.4 | Examination | 9 | Admit card and grade report need print-friendly layouts. |
| 4.5 | Finance | 6 | Payment flow needs confirmation steps (PRD §4.5). Resolve the ৳/$ question (PRD §6.3) before starting. |
| 4.6 | AI Assistant | 8 | Blocked on PRD §6.8 — build the chat shell against a mock stream so the UI isn't blocked on the model decision. |

**Done when:** every student route renders its designed screen; no route bundle exceeds the Phase 3 dashboard budget.

---

## Phase 5 — Faculty modules (14 screens)

| # | Module | Screens |
|---|---|---|
| 5.1 | Courses + assigned courses | 2 |
| 5.2 | Assignments overview + review/grading | 2 |
| 5.3 | Gradebook | 1 |
| 5.4 | Attendance management | 1 |
| 5.5 | Academic overview + library resources | 2 |
| 5.6 | Research portfolio + grants | 2 |
| 5.7 | Profile, personal finance, exam management | 3 |

Grading and attendance-taking are the two dense interactive surfaces — bulk entry, keyboard navigation across table cells, unsaved-changes guards.

**Done when:** a faculty user can take attendance and grade a submission end to end against fixtures.

---

## Phase 6 — Admin modules (10 screens)

Confirm the canonical frame picks first — 6 of the 9 superseded frames are in this persona ([screen-inventory.md](screen-inventory.md)).

| # | Module | Screens |
|---|---|---|
| 6.1 | User management + security profile | 2 |
| 6.2 | Admissions + application review | 2 |
| 6.3 | Examination hub, timetable matrix, marks entry | 3 |
| 6.4 | Academic management | 1 |
| 6.5 | Finance control centre | 1 |
| 6.6 | Dashboard polish | — |

The timetable matrix and marks-entry grid are the hardest screens in the product — dense, wide, bulk-edited. Budget accordingly; they are not list views.

**Done when:** an admin can review an application, enter marks, and publish results against fixtures.

---

## Phase 7 — Hardening

| # | Task |
|---|---|
| 7.1 | Accessibility pass: keyboard traversal per shell, focus visibility, `aria-label` on icon buttons, AA contrast — especially `--fg-muted` on translucent surfaces. |
| 7.2 | Swap fixtures for the real API (one env var, if architecture.md §5 was followed). |
| 7.3 | Real auth (PRD §6.2) — login and the undesigned screens this implies. |
| 7.4 | Bundle audit; verify per-route splitting held. |
| 7.5 | Empty/error state sweep — every list, not just the ones with easy fixtures. |
| 7.6 | Cross-browser check on `backdrop-filter`. |

**Done when:** PRD §8's five success criteria all pass.

---

## Dependencies

```
0 ──▶ 1 ──▶ 2 ──▶ 3 ──┬──▶ 4 ──┐
                       ├──▶ 5 ──┼──▶ 7
                       └──▶ 6 ──┘
```

Phases 4–6 are parallel once 3 lands. Phases 0–3 are strictly serial — each genuinely blocks the next.

## Resolve-before-you-get-there

| Question (PRD §6) | Blocks |
|---|---|
| Backend / mocks | Phase 2 |
| Auth provider | Phase 7.3 (Phase 1 if login ships early) |
| Currency ৳ vs $ | Phase 4.5 |
| Undesigned modules | Phase 2.5 (routes) |
| AI backing | Phase 4.6 |
| Admin canonical frames | Phase 6 |
| Real-time transport | Phase 4.2 (Live Classes) |
