# Implementation Plan: Visual shell

**Branch**: `001-visual-shell` | **Date**: 2026-09-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-visual-shell/spec.md`

## Summary

Build all ten Tend screens as Next.js App Router routes rendering hardcoded
fixtures. No persistence, no domain logic, no computation of any kind.

The approach follows from one observation: **this feature has no business
logic to place, so the only architectural decisions left are where the
strings live, where the fixtures live, and how the screens link together.**
All three get their own module in `lib/`, which keeps components free of
anything but layout — trivially satisfying Article VI now, and leaving the
seams where feature 002's real logic will attach.

Two things drive the technical choices:

1. **Acceptance criteria are physical measurements.** "44x44px at 390px and
   320px", "no horizontal scrolling" and "text is not clipped" cannot be
   asserted by rendering to a virtual DOM. They need a real browser engine
   at a real viewport, which makes Playwright the test tool.
2. **Copy is a requirement, not a detail.** FR-025 demands character-exact
   strings. Putting every string in one module makes that mechanically
   checkable, and lets one test enforce the Article II lexicon, the no-emoji
   rule and the no-exclamation rule across the whole product at once.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Next.js 15 (App Router)

**Primary Dependencies**: TailwindCSS, shadcn/ui, lucide-react, Geist via
`next/font/google`. Fixed by Constitution Article VI; nothing added.
Recharts is explicitly excluded (design system v1.1.0 §8).

**Storage**: N/A — FR-003 forbids persistence. No database, no
localStorage, no cookies, no server state.

**Testing**: Playwright for the visual and dimensional criteria; Vitest for
the copy lint. See `research.md` §1 — this was the only open technical
question and it is resolved there.

**Target Platform**: Mobile web. Primary 390px, secondary 320px. Modern
mobile browsers; no legacy support matrix.

**Project Type**: Web application, frontend only. No backend in this
feature.

**Performance Goals**: No measurable targets apply — every page is static
with no data fetching, no client state beyond selection highlighting, and
no network calls after first load. The relevant non-goal: no spinner may
ever appear (Article V), which is trivially met because nothing loads.

**Constraints**: Single column, `max-w-[720px]`. Minimum touch target
44x44px. `transition-colors` only. Light-only, no `.dark` block. Six UI
primitives, installed only as used.

**Scale/Scope**: 10 screens, 3 session states, 5 fixture areas, 3 inbox
items, ~120 user-facing strings.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Article | Gate for this feature | Pre-Phase 0 | Post-Phase 1 |
|---|---|---|---|
| I — What Tend is | No streak, badge, level or pressure framing anywhere. Budgets warn, never block. Absence reads as unattended. | PASS (FR-005, FR-006) | PASS |
| II — Lexicon | No forbidden term in any string. `Done` used only for task completion. | PASS (FR-026; `Done` on Area edit was removed in clarification Q1) | PASS — enforced by a test over `lib/copy.ts` |
| III — Minimalism | Every screen states its one question; Home is one tap from cold start and carries nothing else. | PASS (spec §"The one question per screen", FR-013, SC-009) | PASS |
| IV — Visual system | All values from design system v1.1.0. No invented value. 720px container, 390px-first, 44px targets. | PASS (FR-007, FR-008) | PASS — `globals.css` is copied from design system §8, unmodified |
| V — Motion | `transition-colors` only. No spinner. Timer never alarming. | PASS (FR-004, FR-006) | PASS |
| VI — Architecture | No business logic in components. Six primitives. No new runtime dependency. | PASS — FR-002 forbids computation outright, so there is no logic to misplace | PASS — see Complexity Tracking for the one dev-only dependency |
| VII — Process | Reviewed spec and plan on disk before code; `/speckit-analyze` before `/speckit-implement`; criteria observable at 390px. | PASS — spec committed `c1221ac`, clarified `7b1f396` | PASS |

**No violations.** One dependency note is recorded in Complexity Tracking
for transparency; it is dev-only and therefore outside Article VI's runtime
rule.

### Two gates worth stating explicitly

**Article VI is easy to pass here and easy to lose later.** This feature
contains no calculation, so "no business logic in components" costs
nothing today. The risk is that fixtures get shaped so that feature 002
*must* compute in the component to use them. The mitigation is in
`data-model.md`: every fixture stores the *displayed* value as a literal
string, never the inputs a component would have to reduce.

**Article III's addition test applies to each screen at review time.** The
plan does not schedule a task for it because it is not a build step; it is
the check in `quickstart.md` that a screen answers its question with
nothing else on it.

## Project Structure

### Documentation (this feature)

```text
specs/001-visual-shell/
├── spec.md              # Feature specification (committed)
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── screens.md       # Phase 1 output — the UI contract
├── checklists/
│   └── requirements.md  # Spec quality checklist (committed)
└── tasks.md             # Phase 2 — created by /speckit-tasks, not here
```

### Source Code (repository root)

```text
app/
├── layout.tsx                  # Geist, <body> classes, the 720px container
├── globals.css                 # design system §8 verbatim, light-only
├── page.tsx                    # Home
├── first-run/page.tsx          # First run
├── areas/
│   ├── page.tsx                # Areas
│   ├── new/page.tsx            # Area edit — creating
│   └── [areaId]/page.tsx       # Area edit — editing
├── tend/[areaId]/page.tsx      # Picker
├── session/[taskId]/page.tsx   # Session — 3 states via ?state=
├── capture/page.tsx            # Capture
├── inbox/page.tsx              # Inbox
├── week/page.tsx               # Week
└── review/page.tsx             # Review

components/
└── ui/                         # shadcn primitives, installed only as used

features/
├── areas/                      # area row, area form controls, remove confirmation
├── home/                       # the three area treatments, review entry
├── session/                    # clock, note field, close actions
├── capture/                    # capture form, area chips
├── inbox/                      # inbox row
├── week/                       # week row
└── review/                     # attended row, unattended row

lib/
├── copy.ts                     # every user-facing string, one export per screen
├── fixtures.ts                 # the five areas, their tasks, session states
└── routes.ts                   # route table and the back rule (FR-028–FR-033)

tests/
├── e2e/                        # Playwright: layout, dimensions, navigation
└── unit/                       # Vitest: copy lint (lexicon, emoji, punctuation)
```

**Structure Decision**: Next.js App Router, frontend only, matching
Article VI's conventions — feature components under `features/<domain>/`,
shared visuals under `components/`, everything non-visual under `lib/`.
Routes are named for the screens rather than the domain nouns (`tend/` for
the Picker, `session/` for the Session) because the URL is user-facing text
and Article II binds it: `/tend/health` reads correctly, `/picker` does not.

`app/areas/new/page.tsx` is a static segment and Next.js resolves it ahead
of `[areaId]`, so `/areas/new` never reaches the dynamic route. Both render
the same form; only the name field's initial value and the defaults differ.

The three session states hang off a query parameter rather than three
routes, so one component renders all three and the states cannot drift
apart. It is a fixture-inspection affordance and never a visible control —
FR-019 requires the three states be identical in treatment, and the surest
way to guarantee that is for them to be the same component.

## Complexity Tracking

| Item | Why needed | Simpler alternative rejected because |
|------|-----------|--------------------------------------|
| Playwright (dev-only) | SC-002, SC-003 and FR-007/FR-008 are physical measurements: computed box size at a given viewport, and absence of horizontal overflow. | jsdom via Testing Library has no layout engine — it reports every element as 0x0 and cannot detect overflow, so it cannot verify the criteria that matter most in a visual-shell feature. Manual device checking alone was rejected because Article VII requires every acceptance criterion to have a test naming it. |

Playwright is a `devDependency` and ships nothing to the browser, so
Article VI's runtime-dependency rule does not apply. It is recorded here
because a reader would otherwise reasonably ask.
