# Design System — the CURRENT look

Extracted from the CURRENT codebase, not from memory: every value here was
read out of `globals.css`, `components/ui/*`, or counted across the app's
pages. Drop this beside a new project's `CLAUDE.md` and the result will
feel like the same family.

> **The one-line brief:** calm elite performance. A quiet high-performance
> workspace, not a workout entertainment app.

---

## 1. The concept (the part that isn't colors)

Colors are the easy half. What actually makes this look coherent is a set
of refusals.

**It should feel:** calm · intentional · premium · minimal · spacious ·
reflective · cognitively lightweight.

**It should never feel like:** a bodybuilding app · hustle-culture
software · a gamified habit tracker · a spreadsheet · a noisy dashboard.

Four principles that decide arguments:

| Principle | What it rules out |
|---|---|
| Awareness over obsession | Streaks, badges, "you're falling behind" |
| Preparation over productivity | To-do framing, completion percentages as pressure |
| Reflection over anxiety | Red states for normal variation |
| Long-term evolution over isolated events | Anything that only shows today |

**Every page answers one question.** Decide it before designing the page,
and cut whatever doesn't serve it. In CURRENT: Dashboard → *where am I in
the process?*; Planner → *where is this going?*; Day view → *what matters
today?*; Performance → *am I evolving?*

---

## 2. Color

### Brand tokens

Raw hex, used for data and accents — charts, phase bars, category dots.
They are deliberately soft; none of them is a signal color.

```css
--current-soft:     #ADEEE3;  /* pale aqua   — base / early phase   */
--current-recovery: #86DEB7;  /* mint        — recovery, resolved   */
--current-primary:  #63B995;  /* green       — the brand's anchor   */
--current-load:     #F5A65B;  /* warm orange — load, effort         */
--current-peak:     #FCD581;  /* soft gold   — peak, intensity      */
```

The set runs cool → warm as intensity rises. That ordering is the whole
idea: **color encodes load, not status.** Orange does not mean "warning".

### Semantic tokens

shadcn/ui-style HSL triplets. Hex resolved for portability.

```css
:root {
  --background:          60 18% 97%;   /* #F9F9F6  warm off-white   */
  --foreground:         222 18% 16%;   /* #212630  ink, never black */

  --card:                40 25% 99%;   /* #FDFDFC  lighter than page */
  --card-foreground:    222 18% 16%;

  --primary:            155 34% 54%;   /* #62B290                   */
  --primary-foreground:   0  0% 100%;

  --secondary:           40 12% 93%;   /* #EFEEEB                   */
  --muted:               40 10% 94%;   /* #F1F0EE                   */
  --muted-foreground:   220  8% 50%;   /* #757C8A                   */
  --accent:              40 12% 93%;

  --destructive:          0 72% 58%;   /* #E14747                   */
  --border:              40 10% 90%;   /* #E8E6E3                   */
  --input:               40 10% 90%;
  --ring:               155 34% 54%;

  --radius: 0.5rem;
}
```

### The three rules that matter

**1 · Never pure white, never pure black.** The page is warm off-white
(`#F9F9F6`); cards are *lighter* than the page (`#FDFDFC`), not white on
grey. Ink is `#212630` — a blue-leaning near-black. Pure `#FFF`/`#000`
reads cheap next to these.

**2 · Neutrals are warm; the accent is cool.** Every neutral sits at hue
40–60 (warm), the primary at 155 (green). That tension is what stops the
palette reading as generic grey UI.

**3 · Cards separate by lightness, not by shadow.** `shadow-sm` and a
`1px` border, nothing heavier.

### Category tints

Where a category needs a label, use a Tailwind `-50` background with a
`-700` text. Never the brand hex at full strength — a pill should never
outweigh the heading beside it.

```
bg-teal-50    text-teal-700
bg-orange-50  text-orange-700
bg-amber-50   text-amber-700
bg-yellow-50  text-yellow-700
bg-emerald-50 text-emerald-700
bg-slate-50   text-slate-500   /* the neutral / inactive one */
```

Keep the solid brand hex for bars and dots, and the tint for text pills.
Two maps, same vocabulary.

---

## 3. Typography

**One family: [Geist](https://fonts.google.com/specimen/Geist).** Loaded
via `next/font/google` as `--font-geist`, applied with `font-sans`. No
display face, no second family. The restraint is the point.

```tsx
import { Geist } from 'next/font/google';
const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });
// <body className={`${geist.variable} font-sans antialiased`}>
```

Enable ligatures on `body`: `font-feature-settings: "rlig" 1, "calt" 1;`

### The scale, as actually used

| Role | Classes | Notes |
|---|---|---|
| Page title | `text-2xl font-semibold tracking-tight` | one per page |
| Card title | `text-xl font-semibold tracking-tight` | |
| Item title | `text-base font-semibold tracking-tight` | rows in a list |
| Body | `text-sm` | most text lives here |
| Secondary | `text-sm text-muted-foreground` | |
| Eyebrow | `text-xs uppercase tracking-widest text-muted-foreground/45` | see below |
| Fine print | `text-xs text-muted-foreground/50` | |
| Micro | `text-[11px]` / `text-[10px]` | metadata only |

`tracking-tight` on every heading. `tracking-widest` on every eyebrow.
Nothing in between.

### The eyebrow is the signature move

```tsx
<p className="text-xs uppercase tracking-widest text-muted-foreground/45">
  Coming up
</p>
```

Used 25+ times across the app. It labels a section without a heading's
weight — which is how the pages stay quiet while still being navigable.
**The `/45` opacity is deliberate**: a full-strength label competes with
the content it introduces.

Opacity is a real tier in this system. `text-muted-foreground` at `/45`,
`/50`, `/55`, `/60` are distinct, intentional levels — not sloppiness.

---

## 4. Layout

### The page container, verbatim

```tsx
<div className="w-full max-w-[1120px] mx-auto px-5 pt-6 pb-8 sm:px-8 sm:pt-7 md:px-10 md:pt-8 space-y-4">
```

This exact string appears on every top-level page. Copy it; don't
re-derive it. `1120px` is wide enough for a three-column grid and narrow
enough that text never sprawls.

For a focused single-column flow (a wizard, a form), narrow to
`max-w-[720px]`.

### Grids

Rows of cards, never a dense dashboard:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-3">   {/* pairs   */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-3">   {/* 2 + 1   */}
```

`gap-3` between cards, `space-y-4` between sections. Cards use `p-5`
(compact) or `p-6` (roomy). Stay on that ladder.

### Sticky footer for multi-step flows

Actions pin to the bottom with a gradient fade, and **error messages live
inside the sticky bar** — not in document flow. An explanation rendered
after the page content sits below the fold, and pressing the button then
looks like it does nothing.

```tsx
<div className="sticky bottom-0 mt-8 bg-gradient-to-t from-background from-60% to-transparent pb-6 pt-7">
```

---

## 5. Components

Five primitives, all shadcn/ui. Resist adding more.

**Card** — `rounded-xl border border-border bg-card shadow-sm`. Header
`p-6 space-y-1.5`, content `p-5` or `p-6`.

**Button** — `rounded-md`, heights `h-8` (sm) / `h-9` (default) / `h-10`
(lg), `gap-2`, `transition-colors`. Variants: `default · destructive ·
outline · secondary · ghost · link`. **`ghost` is the workhorse** for
secondary actions; `outline` for "New thing"; `default` only for the one
real action on the page.

**Badge** — `default · secondary · destructive · outline · muted`. Prefer
`muted` and the category tints over `default`.

**Input** — `h-9`, border `--input`, focus ring `--ring`. For inline
editing inside a card: `h-7 border-transparent bg-muted px-2 text-xs`.

**Tabs** — for switching views inside a page, never for primary nav.

Icons: **lucide-react**, `h-3.5 w-3.5` inline, `h-4 w-4` standalone.
Thin and small. An icon should never be the loudest thing in a row.

### Component rule that keeps this maintainable

> Components contain **no business logic.** Calculations, percentages and
> domain rules live in `lib/`. A percentage appearing inside a React
> component is a defect.

Easy to erode one small change at a time, which is exactly why it's
written down.

---

## 6. States and motion

**Completed / inactive** → `opacity-55` to `opacity-60` on the whole card.
Fading is the entire treatment. No strikethrough, no grey palette swap.

**Progress** → a `h-1` or `h-2` bar, `rounded-full`, `bg-muted` track,
filled with `var(--current-primary)`. No percentage label unless the
number is the point.

**Selected** → `border-foreground bg-foreground text-background` for a
chip. High contrast, no color.

**Motion** → `transition-colors` only. No entrance animations, no spring,
no parallax. Honour `prefers-reduced-motion`.

**Loading** → change the verb: `Create plan` → `Creating…`. No spinners.

---

## 7. Copy voice

Words are design material here, and they carry more of the calm than the
colors do.

- **Say what happens, not what the system does.** "Takes over on its own
  when its first day arrives" — not "auto-activates on start_date".
- **Never disable a button silently.** A greyed-out button can't say what
  it wants. Let it be pressed, then state the problem and move focus to
  the field that has it.
- **Explain the absence.** "Kept, not deleted." "Nothing is scheduled yet
  — a battery needs at least one test and one date."
- **Errors say what went wrong and what to do.** No apologies, no
  exclamation marks.
- **No emoji in production UI.**

---

## 8. Starter files

### `globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --current-soft:     #ADEEE3;
    --current-recovery: #86DEB7;
    --current-primary:  #63B995;
    --current-load:     #F5A65B;
    --current-peak:     #FCD581;

    --background: 60 18% 97%;
    --foreground: 222 18% 16%;
    --card: 40 25% 99%;
    --card-foreground: 222 18% 16%;
    --popover: 40 25% 99%;
    --popover-foreground: 222 18% 16%;
    --primary: 155 34% 54%;
    --primary-foreground: 0 0% 100%;
    --secondary: 40 12% 93%;
    --secondary-foreground: 222 15% 25%;
    --muted: 40 10% 94%;
    --muted-foreground: 220 8% 50%;
    --accent: 40 12% 93%;
    --accent-foreground: 222 18% 16%;
    --destructive: 0 72% 58%;
    --destructive-foreground: 0 0% 100%;
    --border: 40 10% 90%;
    --input: 40 10% 90%;
    --ring: 155 34% 54%;
    --radius: 0.5rem;
  }
}

@layer base {
  * { @apply border-border; }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
```

### Stack

Next.js App Router · TypeScript · TailwindCSS · shadcn/ui · lucide-react ·
Recharts · Geist. Server Components by default; client only where there is
real interactivity.

### File conventions

kebab-case files (`training-day-card.tsx`), PascalCase components,
camelCase variables, snake_case database columns, UUIDs everywhere.
Feature components in `features/<domain>/`, shared visuals in
`components/`.

---

## 9. Fix these before reusing this

Three things found while writing this document. They are reported rather
than smoothed over, and deliberately left unfixed here — a new project
should start from the resolved version, and this repo should decide about
them on purpose rather than inherit them by accident.

**Treat this as a checklist for the next app.**

### ☐ The background is documented wrong

`frontend/CLAUDE.md` says the preferred background is `#FAFAF8`. The token
in `globals.css` — `hsl(60 18% 97%)` — resolves to **`#F9F9F6`**. Nothing
in the app uses the documented value, so the code is right and the
instructions are stale.

**Decide which is canonical before copying either.** If you keep the
token, correct `CLAUDE.md`; a wrong value in an instructions file gets
read every session and eventually gets built.

### ☐ `--primary` drifts from the brand green

The brand token `--current-primary` is `#63B995`. The semantic
`--primary`, at `hsl(155 34% 54%)`, resolves to `#62B290`.

The difference is invisible in practice, and both are in use — brand hex
for bars and dots, semantic token for buttons and rings. But they are
meant to be the same green, so the drift is an accident, not a decision.
`hsl(155 35% 55%)` lands closer if you want them identical.

### ☐ Dark mode — decide on day one or never

There is no `.dark` block anywhere and no theme toggle. The app is
light-only, and that was a choice rather than an oversight: warm off-white
carries most of the calm this design is after.

**If the new app needs dark, define both palettes before writing the first
component.** Retrofitting is not a token swap here. The opacity tiers —
`text-muted-foreground` at `/45`, `/50`, `/55`, `/60` — are load-bearing
hierarchy, and they do not survive an inversion unexamined: what reads as
a quiet label on warm off-white reads as unreadable mud on near-black.
Every one of them has to be revisited by hand, and there are dozens.
