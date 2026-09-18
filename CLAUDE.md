# CLAUDE.md

## Read first

1. `.specify/memory/constitution.md` — binding. Articles I–III are the
   product's identity.
2. `docs/DESIGN-SYSTEM.md` — the only source of visual values.
3. `docs/PRODUCT-SPEC.md` — the full product. Not all of it is in scope
   for the current feature; check `specs/` for what is.

## The one sentence

Tend is a personal system for attending to a few life areas in short,
deliberate sessions. **The unit of success is the completed session, not
the completed task.**

## Hard rules

- No streaks, badges, levels, or pressure framing. Ever.
- Budgets warn and keep recording. They never block.
- Mobile web first. Design at 390px. Single column, `max-w-[720px]`.
  Never use the design system's `1120px` container or its `md:grid-cols-*`
  layouts.
- Light-only. No `.dark` block, no theme toggle.
- Background `#F9F9F6`. Green `hsl(155 35% 55%)`. Never pure white or
  pure black.
- Business logic lives in `lib/`, never in components. A duration or
  percentage computed inside a React component is a defect.
- Six UI primitives only: Card, Button, Badge, Input, Textarea, Tabs.
  Textarea is admitted in exactly three places: task notes, progress notes,
  and Capture's field. Prose to re-read, or a thought that needs room to
  land. A single line belongs in an Input.
- `transition-colors` only. No spinners — change the verb instead.
- No new runtime dependencies without written justification in the plan.

## Lexicon — user-facing copy

Use: Tend · Session · Area · Capture · Attended · Unattended · Done

Never: Start task · Timer · Pomodoro · Category · Bucket · Project ·
Overdue · Missed · Failed · Behind · Streak

No emoji. No exclamation marks. No apologies in error copy.

## Before you write code

This project uses spec-driven development. If there is no reviewed spec
and plan on disk for what you are about to build, stop and say so.
