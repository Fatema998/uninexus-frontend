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

| Need | Choice | Status |
|---|---|---|
| Routing | `react-router` v8 | Installed (Phase 0). |
| Charts | `recharts` | Installed (Phase 3). Only the admin dashboard imports it, so it stays in that route's chunk. |

Auth is **JWT against a Django backend** owned by another developer, following
DRF SimpleJWT conventions (`/api/token/`, `/api/token/refresh/`). No auth
library is needed — `src/lib/auth.ts` is ~90 lines.

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

`src/hooks/use-api.ts` provides `useGetData` / `usePostData` / `usePutData` / `usePatchData` / `useDelete` over a `VITE_API_URL` base, with `ApiError` and automatic invalidation. **Use it. Do not add a second fetch layer.**

`apiFetch` is the single chokepoint every hook routes through, so the JWT
`Authorization` header and refresh-on-401 live there and nowhere else.
Concurrent 401s share one in-flight refresh rather than racing; when a refresh
fails it clears the tokens and fires `AUTH_EXPIRED_EVENT`, which `AuthProvider`
listens for to drop the session.

Each module wraps it with typed hooks:

```ts
// features/attendance/api.ts
export const useAttendanceSummary = () =>
  useGetData<AttendanceSummary>('/student/attendance/summary', ['attendance', 'summary'])
```

Query-key convention: `[module, resource, ...params]`.

Until the Django endpoints exist, back these with `useFixture` from `src/lib/fixtures.ts` — same return shape as `useGetData`, so components never learn the difference. Swapping a module to the real API is a one-line change in its `api.ts`:

```diff
-  useFixture<StudentDashboard>(['student', 'dashboard'], { … })
+  useGetData<StudentDashboard>('/student/dashboard', ['student', 'dashboard'])
```

### What the Django side must provide

The access token needs custom claims — SimpleJWT does not emit these by default, and without `role` the app cannot pick a shell and treats the user as unauthenticated:

| Claim | Required | Used for |
|---|---|---|
| `role` | **yes** | `student` \| `faculty` \| `admin` — selects the shell and guards routes |
| `full_name` or `name` | no | Topbar and sidebar identity |
| `email` | no | Fallback display name |
| `department` | no | Identity subtitle |
| `exp` | yes | Standard expiry |

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
