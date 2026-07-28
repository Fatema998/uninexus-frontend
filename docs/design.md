# UniGPT — Design System

**Source of truth:** [Figma — uninexus](https://www.figma.com/design/H6SDkbXPzmF8l2DkDQmvB9/uninexus?node-id=0-1)
**Status:** derived from measured design context (Figma MCP), 2026-07-28.

Every value below was read out of the Figma file or sampled from a rendered frame — none are invented. Where the design is internally inconsistent, the inconsistency is called out and a single rule is chosen. **That chosen rule wins.** Do not re-derive tokens from individual frames while building; build from this file.

---

## 1. Foundations

### 1.1 Colour

The file defines **no Figma variables** — every colour is a raw literal. The tokens below are the deduplicated set. Ship them as CSS custom properties and register them with Tailwind v4's `@theme`.

#### Brand

| Token | Value | Used for |
|---|---|---|
| `--brand-700` | `#004ac6` | Primary actions, primary stat values, inline links |
| `--brand-600` | `#2563eb` | Gradient start, focus rings, chart line |
| `--brand-gradient` | `linear-gradient(135deg, #2563eb 0%, #004ac6 100%)` | Active nav item, primary CTA, hero banner |
| `--brand-fg` | `#ffffff` | Text/icon on any brand fill |

The hero banner uses a **horizontal fade**, not the 135° gradient:
`linear-gradient(to right, rgba(0,74,198,.8) 0%, rgba(0,74,198,.4) 50%, rgba(0,74,198,0) 100%)`

#### Accent

| Token | Value | Used for |
|---|---|---|
| `--accent-600` | `#712ae2` | Secondary data series, credits/progress metric |
| `--accent-500` | `#8a4cfc` | Active nav item **on the dark admin shell only** |

#### Status

Status colour carries meaning. Never pick a status colour for decoration.

| Token | Value | Meaning |
|---|---|---|
| `--success` | `#16a34a` | Cleared, paid, passing, healthy |
| `--success-bg` | `#dcfce7` | Soft success badge fill |
| `--success-fg` | `#15803d` | Text on `--success-bg` |
| `--success-dot` | `#4ade80` | Live/online indicator dot |
| `--info` | `#005e6e` | Neutral-positive metrics (attendance %) |
| `--warning` | `#ea580c` | Needs attention, due soon, in-progress load |
| `--danger` | `#ba1a1a` | Overdue, failing, unread critical notices |

#### Neutrals

| Token | Value | Used for |
|---|---|---|
| `--fg-heading` | `#0b1c30` | Card titles, section headings, table headers |
| `--fg-body` | `#434655` | Body copy, inactive nav labels |
| `--fg-muted` | `#737686` | Eyebrow labels, metadata, timestamps |
| `--fg-on-dark` | `#d3e4fe` | Inactive nav label on the dark admin shell |
| `--fg-on-dark-strong` | `#fffbff` | Active nav label on the dark admin shell |
| `--bg-app` | `#f8f9ff` | Page background — identical across all three personas |
| `--bg-sidebar` | `#eff4ff` | Student + Faculty sidebar |
| `--bg-sidebar-dark` | `#213145` | Admin/ERP sidebar |
| `--surface` | `rgba(255,255,255,.7)` | Card fill (translucent — see §1.5) |
| `--surface-subtle` | `rgba(239,244,255,.5)` | Card header strip, table header row |
| `--border` | `rgba(195,198,215,.3)` | Default divider / card header underline |
| `--border-strong` | `rgba(226,232,240,.8)` | Metric card outline |
| `--border-faint` | `rgba(195,198,215,.2)` | Hero banner hairline |
| `--track` | `rgba(211,228,254,.3)` | Progress bar track |

> **Verified:** a rendered card samples `#fcfeff`, which is exactly `rgba(255,255,255,.7)` composited over `#f8f9ff`. The translucency is real, not a flattened approximation — keep it.

#### Persona shells

The three personas share **one** token set and differ only in the sidebar shell:

| Persona | Sidebar | Active item | Active label |
|---|---|---|---|
| Student | `--bg-sidebar` | `--brand-gradient` + `drop-shadow(0 4px 6px rgba(37,99,235,.25))`, `radius 8` | `#fff` |
| Faculty | `--bg-sidebar` | same as Student | `#fff` |
| Admin/ERP | `--bg-sidebar-dark` | flat `--accent-500`, `radius 12` | `--fg-on-dark-strong` |

This is the **only** sanctioned persona divergence. Content-area cards, type, spacing, and status colours are identical everywhere.

---

### 1.2 Typography

The file mixes two families: `Inter` across content and `Geist` in nav links only.

**Decision: standardise on Geist Variable for everything.** `@fontsource-variable/geist` is already a dependency; Inter appears to be Figma's default rather than a deliberate pairing, and it is only ever used at weights/sizes Geist covers identically. This is a deliberate deviation from the file — see [Open questions](#6-open-questions) if the designer intends the pairing.

| Role | Size / line-height | Weight | Colour | Extra |
|---|---|---|---|---|
| Card title (`h3`) | 18 / 28 | 700 | `--fg-heading` | — |
| Body | 16 / 24 | 400 | `--fg-body` | — |
| Nav label | 16 / 24 | 400 | `--fg-body` (inactive) | — |
| Metric value | 30 / 36 | 700 | status/brand colour | — |
| Metric unit suffix | 18 / 28 | 500 | `--fg-muted` @ 40% | e.g. the `/120` in `92/120` |
| Eyebrow / metric label | 12 / 16 | 700 | `--fg-muted` | `uppercase`, `letter-spacing: 1.2px` |
| Inline link / card action | 14 / 20 | 600 | `--brand-700` | — |
| Badge | 10 / 15 | 700 | status `-fg` | — |
| Hero heading | 16 / 20 | 400 | `#fff` | `letter-spacing: -0.4px` |

Only these nine roles exist. If a new size is needed, extend this table first — do not one-off it in a component.

---

### 1.3 Spacing

4px base. Observed steps: **4, 8, 12, 16, 24, 25, 40, 48**.

`25` is a genuine outlier used as metric-card padding. **Normalise it to 24.** A 1px shift is invisible and the alternative is a permanent off-scale token.

| Context | Value |
|---|---|
| Icon ↔ label gap (nav, headings) | `12` (student/faculty), `16` (admin) |
| Card padding | `24` |
| Card header padding | `24` |
| Gap between cards in a grid | `24` |
| Content canvas horizontal padding | `40` |
| Hero banner horizontal padding | `48` |

### 1.4 Radius

| Token | Value | Applies to |
|---|---|---|
| `--radius-card` | `18px` | Cards, hero banner, metric cards |
| `--radius-control` | `12px` | Admin nav item, buttons, inputs |
| `--radius-nav` | `8px` | Student/Faculty nav item |
| `--radius-pill` | `9999px` | Badges, progress bars, status dots |

### 1.5 Elevation & effects

| Token | Value | Applies to |
|---|---|---|
| `--shadow-card` | `0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1)` | Hero banner, raised cards |
| `--shadow-nav-active` | `drop-shadow(0 4px 6px rgba(37,99,235,.25))` | Active nav item |
| `--blur-surface` | `backdrop-filter: blur(6px)` | Metric cards, hero pill badge |

**The metric card's bottom border is 4px, other sides 1px** (`border-bottom: 4px solid --border-strong`). That asymmetry is the design's signature — it is not a mistake, and it is what distinguishes a metric card from an ordinary card at a glance.

---

## 2. Layout

Desktop canvas is **1280px**. Only one mobile frame exists (`9:7281`, 390px) — see [Open questions](#6-open-questions).

```
┌──────────┬──────────────────────────────────────────┐
│          │  Top bar                        64px     │
│ Sidebar  ├──────────────────────────────────────────┤
│  260px   │  Content canvas                          │
│  fixed   │  padding: 40px                           │
│          │  ┌────────────────┬─────────────────┐    │
│          │  │ Main  ~616px   │ Rail  ~300px    │    │
│          │  └────────────────┴─────────────────┘    │
└──────────┴──────────────────────────────────────────┘
```

- Sidebar: `260px`, fixed, full height, own scroll.
- Top bar: `64px`, search left, actions + identity right.
- Content canvas: `1020px` at 1280 viewport, `40px` padding.
- Dashboards use a **two-column split**: main column + right rail, `24px` gap.
- Metric rows are a **6-up grid** (student) or **3×2 grid** (faculty/admin), `24px` gap.

### Responsive rules

Not specified in Figma. Applying these consistently is the whole point of documenting them:

| Breakpoint | Behaviour |
|---|---|
| `≥1280` | As designed. |
| `1024–1279` | Sidebar stays; content fluid; 6-up metrics → 3-up. |
| `768–1023` | Sidebar collapses to icon rail (`72px`); right rail moves below main; metrics 3-up. |
| `<768` | Sidebar → off-canvas drawer behind a hamburger; single column; metrics 2-up. |

---

## 3. Components

Component specs, in build order. Anything not listed here does not exist yet — add it to this file before building it.

### MetricCard
Translucent card, `blur(6px)`, radius 18, padding 24, **4px bottom border**.
Slots: uppercase eyebrow label → value (30/36 bold, status-coloured) → optional delta badge, unit suffix, or progress bar.
Value colour encodes meaning: `--brand-700` primary, `--accent-600` progress, `--info` rates, `--success` money-cleared, `--warning` counts-today, `--danger` unread.

### Card
Radius 18, `--surface`. Optional header strip: `--surface-subtle` fill, `1px --border` bottom, 24 padding, title 18/28 bold `--fg-heading` with an 18×20 icon, and an optional right-aligned text action (14/20 semibold `--brand-700`).

### NavItem
Radius 8 (12 on admin), `padding 10px 16px`, `gap 12` (16 admin), icon ~15px.
States: default `--fg-body` / hover `--surface-subtle` / **active** persona-specific fill + shadow (§1.1) / focus 2px `--brand-600` ring.
Hover and focus are unspecified in Figma — these are the house rules.

### Badge
Pill, `padding 2px 8px`, 10/15 bold, soft status pair (`--success-bg` + `--success-fg`). Every status needs its own soft pair; only success is drawn in the file — derive the rest at the same lightness relationship.

### ProgressBar
Height 6, pill, track `--track`, fill = the metric's own colour. Never brand-blue by default.

### DataTable
Header row `--surface-subtle`, header text 12/16 bold uppercase `--fg-muted` `1.2px` tracking, row divider `1px --border`, cell text 16/24 `--fg-body`.

### HeroBanner
Radius 18, `--shadow-card`, hairline `--border-faint`, horizontal brand fade, `48px` horizontal padding.
Contains: translucent pill badge (`rgba(255,255,255,.1)` fill, `rgba(255,255,255,.2)` border, `blur(6px)`, `--success-dot` + uppercase 12/16 label), heading, and body at `rgba(255,255,255,.8)`.

### AIAssistantPanel
Right-rail card. Header with avatar + "ALWAYS ONLINE" eyebrow, alternating message bubbles (assistant left on `--surface-subtle`, user right on brand tint), composer input with brand send button, and a row of quick-action chips.

---

## 4. Iconography

Line icons throughout, ~1.5px stroke, 15–22px depending on context (15 student nav, 18 admin nav, 18×20 card headings). `lucide-react` is already a dependency and matches the drawn style — use it. Only export from Figma when no Lucide glyph matches.

---

## 5. Rules

**Do**
- Take every colour, size, and radius from this file.
- Let status colour carry meaning; keep the same meaning on every screen.
- Keep the metric card's 4px bottom border and translucency.
- Keep `--bg-app` identical across personas — only the sidebar shell changes.

**Don't**
- Add a font size that isn't one of the nine type roles.
- Use a status colour decoratively.
- Flatten the translucent surfaces to opaque white.
- Give a persona its own content-area styling.
- Copy `25px` padding out of Figma — it is normalised to 24.

---

## 6. Open questions

Each blocks nothing today; each has a working default already applied.

1. **Inter vs Geist.** Standardised on Geist. Revert to the Inter/Geist split if the pairing was deliberate.
2. **Mobile.** One mobile frame exists (`9:7281`). The §2 breakpoint rules are house rules, not designed — confirm before Phase 5.
3. **Dark mode.** Not designed. `--bg-sidebar-dark` exists only as the admin shell, not as a theme. Out of scope until requested.
4. **Empty / loading / error states.** Not designed for any screen. See [build-plan.md](build-plan.md) Phase 1 — a shared set is built once and reused.
5. **Duplicate frames.** Several screens have 2–3 iterations in the file (Attendance Management ×3, User Management ×3). [screen-inventory.md](screen-inventory.md) records which one is canonical.
