# UniGPT Docs

Design and build documentation for **UniGPT** — an AI-native university portal for students, faculty, and institutional admins.

**Design source:** [Figma — uninexus](https://www.figma.com/design/H6SDkbXPzmF8l2DkDQmvB9/uninexus?node-id=0-1) · file key `H6SDkbXPzmF8l2DkDQmvB9` · 93 frames → 83 buildable screens.

---

## The docs

| Doc | What it's for | Read it when |
|---|---|---|
| [prd.md](prd.md) | What the product is, who it serves, what each module must do | Starting anything; deciding whether something is in scope |
| [design.md](design.md) | **Token authority.** Colours, type, spacing, radius, components, layout rules | Writing any UI. Every visual value comes from here |
| [screen-inventory.md](screen-inventory.md) | All 93 frames → node IDs → routes, canonical vs superseded | Picking up a screen; wiring routes; pulling a frame from Figma |
| [architecture.md](architecture.md) | Stack, directory layout, routing, data layer, conventions | Deciding where a file goes or how to fetch something |
| [api/student.md](api/student.md) | **Wire contract.** Every student endpoint, request/response types, optimistic-UI policy, transport | Wiring a student screen to the API; briefing the backend dev |
| [api/faculty.md](api/faculty.md) | Faculty endpoints — section scoping, whole-object writes, why almost nothing is optimistic | Wiring a faculty screen; anything that writes to a student's record |
| [build-plan.md](build-plan.md) | 7 phases, tasks, dependencies, definitions of done | Planning a sprint; knowing what's next |

`api/admin.md` follows the same shape. The persona-neutral conventions
(formats, envelopes, transport, errors, auth) live in
[api/student.md §1](api/student.md) and are referenced rather than repeated;
they lift out to `api/general.md` once admin lands and there are three
consumers.

## Order to read them

New to the project: **prd** → **design** → **build-plan**.
Picking up a ticket: **screen-inventory** (find your node) → **design** (tokens) → **architecture** (where code goes).

---

## Building a screen

1. Find it in [screen-inventory.md](screen-inventory.md). Confirm it's `canonical`, not `superseded`.
2. Pull it: `get_design_context(fileKey: "H6SDkbXPzmF8l2DkDQmvB9", nodeId: "<node>")`.
3. **Translate the returned literals into tokens from [design.md](design.md).** The Figma output is React + Tailwind with raw hex values — it is a reference, never paste-in code. A raw hex in `src/` is a bug.
4. Reuse `components/patterns` before writing anything new. Most screens are assembly, not new components.
5. Include loading, empty, and error states — they aren't designed, so use `components/states`.

## Ground rules

- Branch → change → verify → merge. Never commit to `main`.
- `bun run build` and `bun run lint` pass before merge.
- `grep -rEn '#[0-9a-fA-F]{3,8}\b' src/features src/components` returns nothing.
- New design value? Add it to [design.md](design.md) first, then use it.

## Open questions

Nine of them, in [prd.md §6](prd.md#6-open-questions) — backend, auth, currency, undesigned modules, AI backing, and more. Each has a working default so nothing is blocked today, but several need answers before their phase. [build-plan.md](build-plan.md) maps each to the phase it blocks.

## Current state

**Phases 0–6 are done — all 82 screens are built, with no placeholders left.** Token layer, shadcn primitives, pattern components, the three role shells, JWT auth, and every screen across Student, Faculty, and Admin are in place and verified. [Phase 7 (hardening)](build-plan.md) is what remains: real API wiring, accessibility pass, and auth for production.

```bash
bun install && bun run dev
```

Sign in as `student`, `faculty`, or `admin` with any password. While `VITE_API_URL` is unset, a dev-only seam (`src/lib/dev-auth.ts`) mints a local token so the UI runs without the Django backend. Set `VITE_API_URL` and the seam disables itself.

Every screen is lazy-loaded into its own chunk and driven by fixtures through hooks shaped like `use-api`, so swapping a module to the real Django API is a one-line change in its `api.ts`.

### Working against the mock API

```bash
bun run mock                                    # dev API on :8787
VITE_API_URL=http://localhost:8787 bun run dev  # app against it
bun run mock:test                               # verify the mock still matches the contract
```

All 61 student read endpoints and 23 writes are live, plus 15 faculty reads
and 8 writes, typed against `src/types`. Every student screen is on the real
fetch path; faculty screens are next per
[api/student.md §9](api/student.md).
