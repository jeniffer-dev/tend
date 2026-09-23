# Implementation Plan: Domain logic

**Branch**: `002-domain-logic` | **Date**: 2026-09-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-domain-logic/spec.md`

## Summary

Replace 001's stored sentences with derivations, and give the app somewhere
to keep facts while a tab is open. The ten screens, their routes, their back
rule and their copy all stay as approved; what changes is that every value
is now computed from state and a moment.

Three decisions shape everything else:

1. **`now` is an argument, never a lookup.** No function in `lib/` reads the
   clock. That is what makes every rule a pure function of state and time,
   which is what Article VI has always demanded and 001 never had to
   provide.
2. **State is one in-memory store above the router.** Nothing is written
   anywhere, so a running session survives navigation but not a reload.
3. **`?seed=001` loads 001-equivalent state *and* starts the clock** at
   Sunday 13 September 2026, 13:00 local, advancing from there. SC-001
   compares rendered copy against strings that name a specific Sunday;
   seeding data without seeding time would make the criterion a calendar
   rather than a test, and freezing time rather than offsetting it would
   leave the session clock dead under the only state the parity test can
   run against.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Next.js 15 (App Router) —
unchanged from 001.

**Primary Dependencies**: TailwindCSS, shadcn/ui, lucide-react, Geist.
**Nothing added.** A date library and a state library were both considered
and both rejected under Article VI (research.md §1, §3).

**Storage**: None. FR-023 forbids every storage API, and 001's
`persistence.spec.ts` carries forward unchanged as the proof.

**Testing**: Vitest for the derivations, which are pure and numerous;
Playwright for the screens, inheriting 001's thirteen spec files.

**Target Platform**: Mobile web. 390px primary, 320px secondary.

**Project Type**: Web application, frontend only. No backend in this
feature or the next.

**Performance Goals**: One constraint that is real — the session clock
re-renders once a second, and that tick must not re-render the whole app.
Everything else is a pure function over collections of tens of items.

**The mechanism, not the intention.** State and the ticking clock are two
contexts, not one. A single provider holding both would re-render every
subscribed screen every second while a session runs, which is the whole of
this constraint lost to one convenience. The ticking `now` is consumed by
the session clock alone; every other screen subscribes to a `now` that
changes only when the local date does. Both are the same argument to the
same pure functions — a day name, a week boundary and a rhythm comparison
cannot change more than once a day, and nothing is gained by asking them
every second.

**Constraints**: In-memory only. `transition-colors` only. Six UI
primitives. Single column, `max-w-[720px]`, 44px targets.

**Scale/Scope**: 10 screens, 25 new strings (21 approved, 4 pending), ~26
derivations, 11 state transitions.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Article | Gate for this feature | Pre-Phase 0 | Post-Phase 1 |
|---|---|---|---|
| I — What Tend is | No streak, badge, level or pressure framing. Passing the rhythm is extra; falling short is a fact about the week. | PASS (FR-004, FR-009) | PASS — the derivation returns `is past rhythm`, never a proportion |
| II — Lexicon | No forbidden term. All 25 new strings reviewed. | PASS | PASS — the copy lint extends to the new strings, and the four added after analyze are held until approved (FR-027) |
| III — Minimalism | No new screen. One new element, on Week. | PASS | PASS — `Look back on last week` is argued on its merits in spec.md, not exempted |
| IV — Visual system | No new visual value. Nothing in the design system changes. | PASS | PASS — 002 adds no component and no token |
| V — Motion | `transition-colors` only. The clock's tick changes a number, never a style. | PASS | PASS — one treatment in every clock state, as 001 established |
| VI — Architecture | No business logic in components; domain rules pure, synchronous, unit-tested, isolated from React and persistence. | PASS — this feature is where that article finally has something to govern | PASS — see the gate below |
| VII — Process | Reviewed spec and plan on disk; `/speckit-analyze` before `/speckit-implement`; criteria observable at 390px. | PASS — spec `d715b3a`, clarified `97f3795`/`50e2290`/`5ceee20` | PASS |
| VIII — Amendment | Amendments committed separately from feature work. | PASS — PRODUCT-SPEC 0.4 landed alone in `5722d00`, before the spec | PASS |

**No violations.** No Complexity Tracking entries: nothing is added to the
stack, and the one dev-only dependency 001 recorded (Playwright) is already
there.

### The gate that actually matters here

**Article VI is the whole feature.** 001 passed it trivially — there was no
logic to misplace, because every value was a literal. 002 is where the
article is tested, and it can be lost one convenience at a time: a
comparison in a card, a `toLocaleDateString` in a row, a count in a
heading.

Three mechanisms hold it, and they are design decisions rather than good
intentions:

1. **Screens receive finished strings**, one call per region rather than one
   per value (contracts/derivations.md). A component that is handed
   `Two sessions attended.` cannot compute it wrongly; a component handed
   `2` and `3` will eventually be asked to.
2. **`now` is a parameter everywhere.** A function that reads the clock is
   not pure, not unit-testable, and not isolated from its environment —
   three of Article VI's four requirements in one habit.
3. **If a user-facing sentence can be read in the state, the state is
   wrong.** The inverse of 001's rule, with the same purpose
   (data-model.md).

### The second gate: Article I, now that numbers exist

001 could not fail Article I because it had no numbers to frame. 002 can.
The risk is not a streak someone adds on purpose; it is a proportion
arriving as a bar width, a heading that counts down, or a comparison that
reads as a verdict.

`sessionsInWeek` and `sessionsPerWeek` are both in the model, and dividing
them is one line away at every call site. The mitigation is that **no
derivation returns a ratio** — `isPastRhythm` returns a boolean, and the
screens are given sentences. 001's `no-pressure.spec.ts` already asserts no
element is sized to a fraction of its parent, and it carries forward.

## Project Structure

### Documentation (this feature)

```text
specs/002-domain-logic/
├── spec.md              # Feature specification, with §"Screen copy"
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── derivations.md   # Phase 1 output — what each screen asks for
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 — created by /speckit-tasks
```

### Source Code (repository root)

```text
lib/
├── copy.ts              # extended: 25 new strings, some as templates
├── state/
│   ├── types.ts         # Area, Task, Session, State
│   ├── store.ts         # the reducer and its eleven transitions
│   ├── provider.tsx     # the client provider — state, and the seed
│   └── clock.tsx        # two contexts: the ticking now, and the day
├── derive/
│   ├── week.ts          # week bounds, which week a session is in
│   ├── counting.ts      # sessions, minutes, past rhythm, attended today
│   ├── format.ts        # number words, day names, joining, clock string
│   └── screens.ts       # one function per screen region
├── seed/
│   └── fixture-001.ts   # dev-only state and its pinned clock
└── routes.ts            # unchanged, plus Week's route to last week

app/                     # pages become client components; layout stays server
components/              # unchanged
features/                # unchanged in shape; inputs become derived values

tests/
├── unit/                # grows to cover every derivation
└── e2e/                 # 001's thirteen specs, plus this feature's
```

**Structure Decision**: `lib/` splits into `state/`, `derive/` and `seed/`
because they have different rules. `state/` is the only part that mutates,
`derive/` is pure and takes `now`, and `seed/` never ships as a default
path. Keeping them in one directory would make "is this function allowed to
read the clock?" a matter of memory rather than location.

`features/` keeps its shape. The components 001 built take the same props
they always did — a line, a treatment, a label — and those props now arrive
derived instead of literal. That the components do not change is the
clearest evidence 001's fixture rule did its job.

## Complexity Tracking

No entries. Nothing is added to the stack. Both candidates — a date library
and a state management library — were considered and rejected in research.md
under Article VI's standing presumption, on the grounds that the hand-rolled
alternative is six local-time functions and one reducer.
