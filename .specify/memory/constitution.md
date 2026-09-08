# Tend — Constitution

**Version:** 1.0.0
**Ratified:** 2026-09-07
**Status:** Active

These are the immutable principles that govern how specifications become
code in this project. Any plan, task list, or implementation that
contradicts an article here is a defect, not a tradeoff. When an article
and a convenience conflict, the article wins.

---

## Article I — What Tend is

Tend is a personal system for attending to a small number of life areas in
short, deliberate sessions.

**The unit of success is the completed session, not the completed task.**

Every design decision, metric, screen, and word of copy resolves against
that sentence. A feature that helps the user close more tasks but makes
them less likely to sit down for fifteen minutes is a regression.

Areas are not projects. They are never finished. The user tends them the
way one tends a garden: regularly, without an end state.

### Non-negotiable consequences

- The app MUST NOT display streaks, badges, levels, or completion
  percentages framed as pressure.
- The app MUST NOT tell the user they are behind, failing, or slipping.
- Time budgets MUST warn and continue recording. They MUST NEVER block.
- Absence of activity in an area is reported as **unattended**, never as
  failure.

---

## Article II — Lexicon

The product's vocabulary derives from the verb *to tend*. This is binding
on all user-facing copy, and on domain naming in code.

| Use | Never use |
|---|---|
| Tend / Tend this | Start task, Begin, Go |
| Session | Timer, Pomodoro, Sprint |
| Area | Category, Bucket, Project, List |
| Unattended | Overdue, Missed, Failed, Behind |
| Attended | Done for today, Completed |
| Weekly rhythm | Weekly goals, Targets, Quota |
| Capture | Add task, Create item |

Task completion may use **Done**. Nothing else may.

Copy voice follows `docs/DESIGN-SYSTEM.md` §7 without exception: say what
happens rather than what the system does; explain absences; no apologies;
no exclamation marks; no emoji in production UI.

---

## Article III — Minimalism is enforced, not aspirational

**Every screen answers exactly one question.** The question MUST be stated
at the top of the screen's spec before any component is designed, and
anything on the screen that does not serve it MUST be cut.

The canonical questions:

- Home → *what am I tending right now?*
- Session → *what am I doing for these fifteen minutes?*
- Inbox → *what have I not sorted yet?*
- Week → *what am I committing to?*
- Review → *what did I attend to, and what went untended?*

**The home screen MUST be actionable in one tap from cold start.** It
shows today's areas and nothing else. Inbox, week list, and history live
in secondary navigation.

### The addition test

A new element enters the UI only if removing it would break the screen's
one question. "It might be useful" is a rejection, not a justification.

Explicitly out of scope for v1, and MUST NOT be added opportunistically
during implementation: recurring tasks, tags, filters, push notifications,
statistics dashboards, charts, multi-user, sharing, cross-device sync,
calendar integration.

---

## Article IV — Visual system

`docs/DESIGN-SYSTEM.md` is the single source of truth for color,
typography, spacing, components, and motion. No value may be invented. If
a needed value is absent from the design system, the design system is
amended first, in its own commit, before the component is written.

### Resolved inheritance decisions

The design system ships with three open items (§9). They are resolved here
and MUST be applied on first write:

1. **Background is `#F9F9F6`** — `hsl(60 18% 97%)`. The `#FAFAF8` value in
   the legacy instructions file is stale and MUST NOT be used.
2. **The green is unified at `hsl(155 35% 55%)`.** Both `--primary` and
   `--current-primary` resolve to this. The historical drift between
   `#63B995` and `#62B290` does not carry over.
3. **Tend v1 is light-only.** No `.dark` block, no theme toggle. The
   opacity tiers (`/45`, `/50`, `/55`, `/60`) are load-bearing hierarchy
   and do not survive inversion. Dark mode, if ever added, requires both
   palettes defined before the first component of that version.

### Mobile-first overrides

Tend is a mobile-web app. The design system's page container is
desktop-derived and MUST be overridden:

- Base container is `max-w-[720px]`, single column. The `1120px`
  container and all `md:grid-cols-2` / `md:grid-cols-3` layouts from the
  design system MUST NOT be used.
- **Every screen is designed at 390px first.** Wider viewports get more
  breathing room, never more columns and never more content.
- Primary actions sit within thumb reach at the bottom of the viewport,
  using the sticky footer pattern (design system §4), with error messages
  inside the sticky bar.
- Minimum touch target is 44×44px. This overrides the design system's
  `h-8` button height for any primary tap target.

### Areas and color

Areas are labelled with the brand tokens as dots and bars, and with
Tailwind `-50`/`-700` tints for text pills. Per design system §2: **color
encodes the area, never a status.** No red for lateness. `--destructive`
is reserved for destructive actions only.

---

## Article V — Motion and feedback

`transition-colors` only. No entrance animations, no spring, no parallax,
no confetti, no celebration states. `prefers-reduced-motion` is honoured.

Loading changes the verb (`Tend` → `Tending…`). No spinners.

The session timer MUST be legible at arm's length and MUST NOT use
alarming visual language as time runs out — no red, no pulsing, no
countdown urgency. When planned time elapses, the timer keeps running and
states the fact quietly.

---

## Article VI — Architecture

**Components contain no business logic.** Calculations, budget math,
session outcomes, and hierarchy rules live in `lib/`. A percentage or a
duration calculation appearing inside a React component is a defect.

Domain rules MUST be pure, synchronous functions with unit tests, isolated
from React and from persistence.

Conventions: kebab-case files, PascalCase components, camelCase variables,
snake_case database columns, UUIDs everywhere. Feature components in
`features/<domain>/`, shared visuals in `components/`.

### Dependencies

The stack is fixed: Next.js App Router, TypeScript, TailwindCSS,
shadcn/ui, lucide-react, Geist.

Adding any other runtime dependency requires an explicit written
justification in the plan naming what it replaces and why hand-rolling is
worse. Date handling, state management, and animation libraries are
presumed rejected.

Only five UI primitives are in use: Card, Button, Badge, Input, Tabs.
Adding a sixth requires the same justification.

---

## Article VII — Process

Development follows spec-driven development. Order is binding:
constitution → specify → plan → tasks → analyze → implement.

- No code is written before a reviewed `spec.md` and `plan.md` exist on
  disk for that feature.
- `/speckit.analyze` MUST run and pass before `/speckit.implement`.
- Features are sliced so that **visual shape is validated before domain
  logic is built.** Feature 001 is the UI shell with fixture data and no
  persistence.
- Every feature spec MUST state its acceptance criteria as observable
  behaviour, verified at 390px width on a real device or device emulator.

### Verification rules

- The diff MUST NOT add skip markers, `.only`, or delete existing
  assertions.
- Every acceptance criterion in a feature spec MUST have at least one test
  naming it.
- A feature is not complete until its screen answers its one question with
  nothing extra on it.

---

## Article VIII — Amendment

This document is versioned semantically. Articles I, II, and III are the
product's identity; amending them means Tend has become a different
product and requires a major version bump with the reasoning recorded.

Amendments to any article MUST be committed separately from feature work,
never inside an implementation commit.
