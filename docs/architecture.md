# Architecture & Conventions

How 83 screens get built without the codebase turning into 83 unrelated pages.

---

## 1. Stack

Already installed — nothing here is a proposal:

| Concern | Choice | Notes |
|---|---|---|
| Build | Vite 8 + Rolldown | `bun` lockfile |
| UI | React 19 + React Compiler | Babel plugin already configured |
| Language | TypeScript 6 | strict |
| Styling | Tailwind v4 (`@tailwindcss/vite`) | CSS-first `@theme`, no JS config |
| Components | shadcn/ui + Radix | `components.json` configured; only `button.tsx` exists so far |
| Server state | TanStack Query v5 | wrapped in `src/hooks/use-api.ts` |
| Icons | `lucide-react` | matches the drawn icon style |
| Font | `@fontsource-variable/geist` | see design.md §1.2 |

### Two additions needed

| Need | Choice | Why |
|---|---|---|
| Routing | `react-router` v7 | 83 routes across 3 role-scoped shells. No router is installed. |
| Charts | `recharts` | Enrolment line, distribution donut, analytics screens. Only add at Phase 4 — earlier screens don't need it. |

Add nothing else without a screen that demands it. Date formatting is `Intl.DateTimeFormat`; currency is `Intl.NumberFormat`; neither needs a library.

---

## 2. Directory layout

```
src/
  app/
    router.tsx            route tree, lazy() per screen
    providers.tsx         QueryClient + router providers
  components/
    ui/                   shadcn primitives (button, input, table, …)
    patterns/             design.md §3 components — MetricCard, Card,
                          NavItem, Badge, ProgressBar, DataTable, HeroBanner
    states/               Empty, Loading, ErrorState  (PRD §6.6)
  layouts/
    StudentShell.tsx      sidebar + topbar + <Outlet/>
    FacultyShell.tsx
    AdminShell.tsx        dark variant
    nav-config.ts         per-persona nav arrays — single source for the sidebars
  features/
    <module>/             academic, lms, attendance, exams, finance, ai,
                          research, admissions, users
      pages/              route components
      components/         module-local components
      api.ts              typed hooks over src/hooks/use-api.ts
      types.ts
  hooks/use-api.ts        existing fetch/React Query wrapper — do not fork
  lib/utils.ts            cn()
  index.css               @theme token layer
```

**Rule:** a component lives in `features/<module>/components` until a second module needs it, then it moves to `components/patterns`. Do not pre-promote.

---

## 3. Tokens

All of [design.md](design.md) §1 lands in `src/index.css` as `@theme` custom properties — once. Components reference token names only.

```css
@theme {
  --color-brand-700: #004ac6;
  --color-brand-600: #2563eb;
  --color-fg-heading: #0b1c30;
  --color-bg-app: #f8f9ff;
  --radius-card: 18px;
  /* … full set per design.md §1 */
}
```

This makes `bg-brand-700`, `text-fg-heading`, `rounded-card` etc. available as Tailwind utilities. A raw hex anywhere in `src/features` or `src/components` is a bug — see §7.

The existing `:root` block in `index.css` carries leftover template values (`--brand: #aa3bff`, `--code-bg`, `--social-bg`) from the Vite starter. Phase 0 deletes them; `#aa3bff` is not a UniGPT colour.

---

## 4. Routing

Three role-scoped shells, lazy screens:

```tsx
<Route element={<StudentShell/>} path="/student">
  <Route index element={<StudentDashboard/>}/>
  <Route path="lms/assignments/:id/submit" element={<AssignmentSubmission/>}/>
  …
</Route>
```

- Every screen is `lazy()`-loaded. 83 eager imports would blow the initial bundle.
- Role guard at the shell, not per route — one check, not 83.
- Full path list in [screen-inventory.md](screen-inventory.md); use those paths verbatim so links don't drift.

---

## 5. Data

`src/hooks/use-api.ts` already provides `useGetData` / `usePostData` / `usePutData` / `usePatchData` / `useDelete` over a `VITE_API_URL` base, with `ApiError` and automatic invalidation. **Use it. Do not add a second fetch layer.**

Each module wraps it with typed hooks:

```ts
// features/attendance/api.ts
export const useAttendanceSummary = () =>
  useGetData<AttendanceSummary>('/student/attendance/summary', ['attendance', 'summary'])
```

Query-key convention: `[module, resource, ...params]`.

Until the backend question (PRD §6.1) is answered, back these with typed fixtures in `features/<module>/fixtures.ts` returned by an MSW handler or a dev-only fetch shim. The hook signatures stay identical, so switching to a real API is an env-var change and nothing else.

---

## 6. Component conventions

- Function components, named exports, one screen per file.
- Props typed inline; no `React.FC`.
- `cva` for variants (already installed) — that is how `MetricCard`'s six status colours are expressed, not six components.
- `cn()` from `lib/utils` for class merging.
- React Compiler is on: **no** `useMemo` / `useCallback` unless a profile proves it's needed.
- Icon-only buttons carry `aria-label`.

---

## 7. Enforcement

Two checks that keep 83 screens consistent, both cheap:

1. **No raw hex** — `grep -rEn '#[0-9a-fA-F]{3,8}\b' src/features src/components` must return nothing. Add to CI.
2. **Lint** — `bun run lint` clean; `bun run build` typechecks via `tsc -b`.

Anything more elaborate is unnecessary at this size.
