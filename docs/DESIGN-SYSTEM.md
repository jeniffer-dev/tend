# Design System — the CURRENT look

**Version:** 1.8.0
**Amended:** 2026-09-23 — the empty-screen title role (§3)
**Status:** Active

Extracted from the CURRENT codebase, not from memory: every value here was
read out of `globals.css`, `components/ui/*`, or counted across the app's
pages. Drop this beside a new project's `CLAUDE.md` and the result will
feel like the same family.

> **Amended for Tend (2026-09-09).** The three open items in §9 are now
> resolved, and the layout, stack and component sections carry Tend's
> mobile-web overrides. Where this document and
> `.specify/memory/constitution.md` disagree, the constitution wins and
> this file is the defect. Changes in 1.1.0: the green is unified at
> `hsl(155 35% 55%)`; the base container is `max-w-[720px]`, single
> column; the 44x44px minimum touch target is documented; Textarea is the
> sixth primitive; Recharts is out of the stack.

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
--current-primary:  #64B493;  /* green       — the brand's anchor   */
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

  --primary:            155 35% 55%;   /* #64B493  == --current-primary */
  --primary-foreground:   0  0% 100%;

  --secondary:           40 12% 93%;   /* #EFEEEB                   */
  --muted:               40 10% 94%;   /* #F1F0EE                   */
  --muted-foreground:   220  8% 50%;   /* #757C8A                   */
  --accent:              40 12% 93%;

  --destructive:          0 72% 58%;   /* #E14747                   */
  --border:              40 10% 90%;   /* #E8E6E3                   */
  --input:               40 10% 90%;
  --ring:               155 35% 55%;

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

**4 · There is one green.** `--current-primary` and `--primary` are both
`hsl(155 35% 55%)` / `#64B493`. Brand hex for bars and dots, semantic
token for buttons and rings — same color, two vocabularies. The historical
drift between `#63B995` and `#62B290` is resolved and MUST NOT return.

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
| Session clock | `text-[clamp(3.25rem,19.5vw,4.75rem)] font-medium tracking-[-0.03em] leading-none tabular-nums` | one per app; see below |
| Empty-screen title | `text-[30px] font-semibold tracking-[-0.025em] leading-[1.15]` | First run only; see below |

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

### The empty-screen title

Added in 1.8.0, and used on First run alone. A screen with nothing on it
but an invitation carries its heading larger than a page title, because
`text-2xl` set against that much space reads as small rather than as calm.

A second use is an amendment. What earns this size is a screen with no
content to compete with — not importance, and not length.

### The session clock is the one display size

Added in 1.2.0. The scale above stops at `text-2xl` because it was
extracted from an app whose largest type was a page title. Tend has one
element that has to be legible at arm's length rather than at reading
distance — the session clock — and nothing else in the product does.

`4.75rem` is 76px, the size the approved design draws it at, and it is the
maximum. The `clamp` exists for one reason: at 320px a six-character clock
(`+17:04`) set at 76px is wider than the card it sits in, and clipping the
clock is the one failure the session screen cannot survive. `19.5vw`
reaches exactly 76px at the 390px design width, so the fluid middle term
never applies above it; below 390px the clock shrinks rather than clips.

`tabular-nums` is load-bearing, not decoration: without it the digits
change width as the time changes and the clock jitters in place.

**This is a display size, not a heading.** It takes `font-medium`, not
`font-semibold`, and it carries no color of its own — Article V forbids
the clock turning red or pulsing as time runs out, and the surest way to
honour that is for the clock to have exactly one treatment in every state.

Adding a second use of this row is a design system change, not a judgement
call at the use site.

---

## 4. Layout

### The page container, verbatim

```tsx
<div className="w-full max-w-[720px] mx-auto px-5 pt-6 pb-8 sm:px-8 sm:pt-7 space-y-4">
```

This exact string appears on every top-level page. Copy it; don't
re-derive it. `720px` is a single column that never sprawls, and it is the
base for every screen — not a narrow variant reserved for wizards.

**Design at 390px first.** Wider viewports get more breathing room, never
more columns and never more content.

> The `max-w-[1120px]` container this document shipped with was
> desktop-derived. It is withdrawn.

### Grids

Rows of cards, stacked. One column, always:

```tsx
<div className="grid grid-cols-1 gap-3">
```

`gap-3` between cards, `space-y-4` between sections. Cards use `p-5`
(compact) or `p-6` (roomy). Stay on that ladder.

> `md:grid-cols-2` and `md:grid-cols-3` are withdrawn along with the
> `1120px` container. A second column is more content, not more
> breathing room.

### Touch targets

**Minimum 44x44px for anything tappable.** This overrides the `h-8`
button height below for any primary tap target: use `h-11` (44px) or
larger, and give icon-only controls the same footprint even when the glyph
inside stays `h-4 w-4`. Primary actions sit within thumb reach at the
bottom of the viewport, using the sticky footer pattern below.

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

Six primitives, all shadcn/ui. Resist adding more.

**Card** — `rounded-xl border border-border bg-card shadow-sm`. Header
`p-6 space-y-1.5`, content `p-5` or `p-6`.

**Button** — `rounded-md`, heights `h-8` (sm) / `h-9` (default) / `h-10`
(lg) / `h-11` (touch — the floor for any primary tap target, see §4),
`gap-2`, `transition-colors`. Variants: `default · destructive ·
outline · secondary · ghost · link`. **`ghost` is the workhorse** for
secondary actions; `outline` for "New thing"; `default` only for the one
real action on the page.

**Badge** — `default · secondary · destructive · outline · muted`. Prefer
`muted` and the category tints over `default`.

**Input** — `h-9`, border `--input`, focus ring `--ring`. For inline
editing inside a card: `h-7 border-transparent bg-muted px-2 text-xs`.

**Textarea** — the Input's conventions, unrolled to multiple lines:
`min-h-[80px] w-full rounded-md border border-input bg-background px-3
py-2 text-sm` with the same `--ring` focus treatment and
`transition-colors`. Same `text-sm` body size, same border token, same
radius — it should read as an Input that got taller, not as a new
control. Grows with `rows`, never with a drag handle: `resize-none`. For
the muted inline variant, mirror the Input's:
`border-transparent bg-muted px-2 text-xs`.

Admitted in exactly three places: task notes, progress notes, and
Capture's field. The test is prose to re-read **or** a thought that needs
room to land — see Constitution Article VI. A single line still belongs in
an Input, and a fourth use is an amendment.

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

**Selected** → inside an area, the control you are acting on takes that
area's color; a control that belongs to no area stays colorless
(`border-foreground bg-foreground text-background`). Examples: the selected
task in the Picker, the row being dragged in Areas, the selected controls in
Area edit — and Capture's area chips, which span areas and so take none.

Two constraints, both load-bearing. The color is read from the area and
never hardcoded — a fixed green would be the status encoding §2 forbids.
And selection changes color and fill, never geometry: borders keep their
width in both states, because a row that moves when you touch it does not
read as calm.

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
    --current-primary:  #64B493;
    --current-load:     #F5A65B;
    --current-peak:     #FCD581;

    --background: 60 18% 97%;
    --foreground: 222 18% 16%;
    --card: 40 25% 99%;
    --card-foreground: 222 18% 16%;
    --popover: 40 25% 99%;
    --popover-foreground: 222 18% 16%;
    --primary: 155 35% 55%;
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
    --ring: 155 35% 55%;
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
Geist. Server Components by default; client only where there is real
interactivity.

> Recharts is withdrawn. It served the charts this document was extracted
> from; a product with no statistics dashboard has nothing to plot, and an
> unused charting library is a dependency waiting to justify a chart.

### File conventions

kebab-case files (`training-day-card.tsx`), PascalCase components,
camelCase variables, snake_case database columns, UUIDs everywhere.
Feature components in `features/<domain>/`, shared visuals in
`components/`.

---

## 9. Fixed before reusing this — RESOLVED

Three things found while writing this document. They were reported rather
than smoothed over and left unfixed, so that the next project would decide
about them on purpose rather than inherit them by accident.

**All three are now resolved for Tend**, by
`.specify/memory/constitution.md` Article IV and applied throughout this
document in v1.1.0. The findings are kept below with their resolutions
attached: the reasoning is why the decisions hold, and deleting it would
invite the same drift back in.

### ☑ The background is documented wrong — RESOLVED

`frontend/CLAUDE.md` says the preferred background is `#FAFAF8`. The token
in `globals.css` — `hsl(60 18% 97%)` — resolves to **`#F9F9F6`**. Nothing
in the app uses the documented value, so the code is right and the
instructions are stale.

**Decide which is canonical before copying either.** If you keep the
token, correct `CLAUDE.md`; a wrong value in an instructions file gets
read every session and eventually gets built.

> **Resolved:** the token is canonical. The background is **`#F9F9F6`** —
> `hsl(60 18% 97%)`. `#FAFAF8` is stale and MUST NOT be used. Tend's
> `CLAUDE.md` carries the corrected value.

### ☑ `--primary` drifts from the brand green — RESOLVED

The brand token `--current-primary` is `#63B995`. The semantic
`--primary`, at `hsl(155 34% 54%)`, resolves to `#62B290`.

The difference is invisible in practice, and both are in use — brand hex
for bars and dots, semantic token for buttons and rings. But they are
meant to be the same green, so the drift is an accident, not a decision.
`hsl(155 35% 55%)` lands closer if you want them identical.

> **Resolved:** unified at **`hsl(155 35% 55%)`** / **`#64B493`**. Both
> `--current-primary` and `--primary` resolve to it, throughout §2 and the
> §8 starter. Neither `#63B995` nor `#62B290` carries over. See §2 rule 4.

### ☑ Dark mode — decide on day one or never — RESOLVED

There is no `.dark` block anywhere and no theme toggle. The app is
light-only, and that was a choice rather than an oversight: warm off-white
carries most of the calm this design is after.

**If the new app needs dark, define both palettes before writing the first
component.** Retrofitting is not a token swap here. The opacity tiers —
`text-muted-foreground` at `/45`, `/50`, `/55`, `/60` — are load-bearing
hierarchy, and they do not survive an inversion unexamined: what reads as
a quiet label on warm off-white reads as unreadable mud on near-black.
Every one of them has to be revisited by hand, and there are dozens.

> **Resolved:** Tend v1 is **light-only**. No `.dark` block, no theme
> toggle. If dark is ever added, both palettes are defined before the
> first component of that version — the opacity tiers are revisited by
> hand, not swapped.

---

## 10. Tend's overrides — index

This document was extracted from a desktop app. Tend is mobile web. Every
decision below is already applied in the section named, and binding via
`.specify/memory/constitution.md` Article IV.

**This is an index, not a second copy of the values.** The sections are
where the hex codes, classes and measurements live. Carrying them here too
would give every one of them two homes, which is the drift §9 documents:
one copy goes stale, and the stale one gets built.

| Decision | Where |
|---|---|
| Session clock, the one display size | §3 |
| What is selected or dragged takes its area's color | §6 |
| Textarea's three admitted uses | §5 |
| Empty-screen title, First run only | §3 |
| Base container 720px, single column | §4 |
| No multi-column grids | §4 |
| Designed at 390px first | §4 |
| Minimum touch target of 44x44px | §4, §5 |
| One green for brand token and semantic token alike | §2 |
| Textarea as the sixth primitive | §5 |
| No charting library | §8 |
| Light-only by decision, not by habit | §9 |
