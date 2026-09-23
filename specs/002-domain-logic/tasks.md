---

description: "Task list for feature 002 — Domain logic"
---

# Tasks: Domain logic

**Input**: Design documents from `/specs/002-domain-logic/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/derivations.md, quickstart.md

**Tests**: Included, and not optional. Constitution Article VI requires domain rules to be "pure, synchronous functions with unit tests", and Article VII requires every acceptance criterion to have at least one test naming it. This is the feature where the first of those finally has something to govern.

**Organization**: Tasks are grouped by user story so each story can be implemented, tested and demonstrated on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel — different files, no dependency on an incomplete task
- **[Story]**: The user story this task serves (US1–US5, from spec.md)
- Every task names an exact file path

## Path Conventions

Frontend-only Next.js App Router at the repository root, per plan.md
§"Project Structure": `app/`, `components/`, `features/`, `lib/`, `tests/`.
`lib/` gains `state/`, `derive/` and `seed/`, which obey different rules.

---

## Phase 1: Setup

**Purpose**: The copy this feature adds, and the directories the new rules live in.

- [ ] T001 Create `lib/state/`, `lib/derive/` and `lib/seed/`. The split is load-bearing: `state/` is the only part that mutates, `derive/` is pure and takes `now`, and `seed/` never ships as a default path (plan.md §"Structure Decision")
- [ ] T002 Extend `lib/copy.ts` with the twenty-one new strings from spec.md §"Screen copy", character-exact. Several are templates — `{area}`, `{n}`, `{names}`, `{sessions}` — and the interpolation points are named there. No user-facing string may be written inline in a component or assembled from fragments in a derivation
- [ ] T003 Extend `tests/unit/copy.test.ts` to lint the new strings for Article II's forbidden lexicon, emoji, exclamation marks and apologies, calling every template with a sample so its output is linted too

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: State, time and the derivations every screen reads from. Nothing in Phase 3+ can begin until this is done.

**⚠️ CRITICAL**: The rule that governs this whole phase — **no function in `lib/derive/` may read the clock.** `now` is an argument everywhere (research.md §2). A function that reads the clock is not pure, not unit-testable and not isolated from its environment, which is three of Article VI's four requirements lost to one habit.

### State

- [ ] T004 Define state types in `lib/state/types.ts` per data-model.md — `Area` (with `sessionsPerWeek: 1|2|3|4|5`, `isDaily`, `sortOrder`, `archivedAt: Date | null`), `Task` (with `areaId: string | null` where null means the inbox, `onWeekList`, `capturedAt: Date`, `doneAt: Date | null`), `Session` (with `startedAt`, `endedAt: Date | null`, `plannedMinutes`, `outcome: 'completed' | 'progressed' | null`, `progressNote: string` where `''` means attended without a note), and `State`. **No field may hold a user-facing sentence** — if you can read one in the state, the state is wrong
- [ ] T005 Implement the reducer in `lib/state/store.ts` with the ten transitions in data-model.md §"State transitions". `actualMinutes` is NOT stored: it is `endedAt − startedAt`, and storing it too would let the two disagree
- [ ] T006 Implement area removal in `lib/state/store.ts` as **archiving**, not deletion — `archivedAt: now`, tasks get `areaId: null` keeping their titles, sessions untouched (FR-018). PRODUCT-SPEC RF-04 says *archivar*, and it is what lets the confirmation's promise about Review be true
- [ ] T007 Create `lib/state/provider.tsx` — a client provider mounted in `app/layout.tsx`, holding state in memory and publishing `now`. It writes to no storage API (FR-023). Being above the router is what lets a running session survive navigation (FR-024)
- [ ] T008 Implement the clock tick in `lib/state/provider.tsx` — one second, running only while a session is active, updating `now` and nothing else. The tick must not re-render screens that do not read it (plan.md §"Performance Goals")
- [ ] T009 [P] Write `tests/unit/store.test.ts` — every transition, including that closing as done sets `doneAt` and takes the task off the week list, closing as progressed does neither, switching task mid-session leaves `startedAt` alone, and archiving an area leaves its sessions intact

### Derivations

- [ ] T010 [P] Implement `lib/derive/week.ts` — `startOfWeek`, `endOfWeek`, `weekOf(session)`, `isWeekClosing(now)`. **Week starts are built from local date parts, never by subtracting milliseconds**: days are not reliably 86,400,000ms apart under daylight saving (research.md §3). `weekOf` reads `startedAt` and never `endedAt` (FR-006)
- [ ] T011 [P] Write `tests/unit/week.test.ts` — Monday 00:00 and Sunday 23:59:59.999 boundaries, a session starting Sunday 23:58 and ending Monday 00:20 belonging to the closing week, and a week spanning a daylight-saving changeover still starting at local midnight. Covers FR-005, FR-006, SC-002
- [ ] T012 [P] Implement `lib/derive/counting.ts` — `sessionsInWeek`, `minutesInWeek`, `isPastRhythm`, `attendedToday`, `lastAttended`. **No function here returns a ratio.** `isPastRhythm` returns a boolean; dividing sessions by rhythm is one line away at every call site and is the shape Article I forbids (plan.md §"The second gate")
- [ ] T013 [P] Write `tests/unit/counting.test.ts` — counts at, below and above the rhythm; `attendedToday` true for a session that has started and not closed (FR-015a); `lastAttended` across a week boundary
- [ ] T014 [P] Implement `lib/derive/format.ts` — `numberWord` (words to twelve, figures from thirteen, FR-029), `dayName` (day name to seven days back, date beyond, FR-030), `joinNames` (`A and B`, `A, B and C`, FR-022b), `clockString` derived from `startedAt` and `now` rather than counted down
- [ ] T015 [P] Write `tests/unit/format.test.ts` — the twelve/thirteen boundary in both directions, day names at exactly seven and eight days back, joining at one, two and three names, and `clockString` before zero, at zero and past it. Covers FR-011, FR-029, FR-030, FR-022b
- [ ] T016 Implement `lib/derive/screens.ts` — one function per screen region per contracts/derivations.md, each taking `(state, now)` and returning finished strings. Derivations **choose between templates in `lib/copy.ts` and fill them**; they never concatenate prose
- [ ] T017 [P] Write `tests/unit/screens.test.ts` — each region's output for the ordinary case and for every empty case in spec.md §"Screen copy"

### The seed

- [ ] T018 Create `lib/seed/fixture-001.ts` — state equivalent to 001's fixtures **and** a pinned `now` of Sunday 13 September 2026. Both halves are required: 001's copy says `Sunday`, `Last attended Monday.` and `Week of 7 September`, which are functions of the date, so seeding data without seeding time makes SC-001 fail every day but one (research.md §5)
- [ ] T019 Wire `?seed=001` in `lib/state/provider.tsx` — read once on mount, never the default, writing nothing (FR-025, FR-026)

**Checkpoint**: `lib/` is complete and unit-tested. Screens can now be rewired in any order.

---

## Phase 3: User Story 1 — Tend something, and watch it count (Priority: P1) 🎯 MVP

**Goal**: Home → Picker → Session, with a real clock and a session that changes things.

**Independent test**: Seed, start a session, let the clock run past zero, close it with a note, and confirm Home, the Picker and Week each changed in the way the session implies.

- [ ] T020 [US1] Rewire `app/page.tsx` (Home) to the store — day-name heading, daily unarchived areas in `sortOrder`, each card's treatment and line derived (FR-013, FR-013a). Ordering is unchanged from 001: attended below what is still open
- [ ] T021 [US1] Add the `tending-now` treatment to `features/home/area-card.tsx`, rendering `Tending now` in place of a minute figure. It is a fourth treatment rather than a variant of `attended`, so the card cannot render a figure that does not exist yet (FR-015a, contracts/derivations.md)
- [ ] T022 [P] [US1] Derive Home's absence note in `app/page.tsx` — one sentence naming the non-daily areas, joined per FR-022b, and no sentence at all when none is absent (FR-022)
- [ ] T023 [US1] Rewire `app/tend/[areaId]/page.tsx` and `features/session/picker-list.tsx` — the area's week-list tasks that are not done, each with its last-session note in one of its three forms (FR-014)
- [ ] T024 [US1] Rewire `app/session/[taskId]/page.tsx` and `features/session/session-clock.tsx` to the live clock, and **remove `?state=`** — it was an inspection affordance for three static fixtures and there is now one real clock
- [ ] T025 [US1] Implement starting a session from the Picker's primary action, and switching task mid-session without ending it (FR-015). Switching changes `taskId` and leaves `startedAt` alone: it is one session
- [ ] T026 [US1] Implement both closing actions in `app/session/[taskId]/page.tsx` — done and progressed, each recording `endedAt`, outcome and note (FR-010, FR-013)
- [ ] T027 [US1] Write `tests/e2e/session-loop.spec.ts` — start a session, close it, and assert Home, the Picker and Week all changed. Covers US1's acceptance scenarios and SC-004
- [ ] T028 [US1] **Rewrite** `tests/e2e/session-states.spec.ts` for a real clock. The test is remade, not deleted: what it protected is still a requirement. Assert the three moments of a session — before zero, at zero, and well past it — are identical in layout, colour and controls, differing only in the clock string and the line beneath it. It moves `now` instead of using `?state=`, which is exactly what having `now` as an argument makes possible. Covers **FR-011** and **SC-003** (001's SC-007 carried forward; renumbered because SC-007 here is the dimensional criterion)
- [ ] T029 [P] [US1] Write `tests/e2e/session-continuity.spec.ts` — a running session survives navigating to Home and back, the clock has advanced, and Home showed `Tending now` while away. Covers FR-024, FR-015a
- [ ] T030 [P] [US1] Write `tests/e2e/session-uninterrupted.spec.ts` — past zero, nothing turns red, nothing pulses, no dialog appears, both closing actions stay in place and the layout does not move. Covers FR-012

**Checkpoint**: the loop 001 drew and could not close now closes.

---

## Phase 4: User Story 2 — The week counts itself (Priority: P2)

**Goal**: Week and Review, counting real sessions, with Review reachable every day.

**Independent test**: With sessions across several areas, open Week and Review and confirm every figure matches the sessions that exist.

- [ ] T031 [US2] Rewire `app/week/page.tsx` and `features/week/week-row.tsx` — heading, rows, sessions committed and attended, all derived. **No minutes reach this screen** (FR-007): the derivation that would produce a minute total is not offered to it
- [ ] T032 [US2] Add `Look back on last week` to `app/week/page.tsx` — a tertiary text link beneath `Change the rhythm`, not a button, present every day (FR-019b). It passes Article III's addition test on its merits, argued in spec.md §"Why Week carries a route to last week"
- [ ] T033 [US2] Rewire `app/review/page.tsx` and `features/review/review-section.tsx` — Attended before Unattended, minutes as plain figures, the week's date in the eyebrow (FR-008)
- [ ] T034 [US2] Implement which week Review shows in `app/review/page.tsx` — the closing week on Sunday, the week that just closed on Monday and from Week's link (FR-019a, FR-019c). Review must state which week it is showing
- [ ] T035 [US2] Resolve area names in Review **including archived areas**, because the sessions happened. Every other screen excludes them (data-model.md, FR-018)
- [ ] T036 [US2] Update `features/home/review-entry.tsx` — the Sunday string, the Monday string, or nothing on other days (FR-019a)
- [ ] T037 [US2] Write `tests/e2e/week-review-live.spec.ts` — figures match the sessions, no minutes on Week, Attended before Unattended, and an area past its rhythm presented as extra rather than as an excess. Covers FR-007, FR-008, FR-009
- [ ] T038 [P] [US2] Write `tests/e2e/review-reachable.spec.ts` — Review is reachable on every day of the week by at least one route, and Week's link always reaches last week. Covers FR-019a, FR-019b, FR-019c

---

## Phase 5: User Story 3 — Capture and sort for real (Priority: P3)

**Goal**: Capture creates tasks; the Inbox holds what has no area; giving an area empties it.

**Independent test**: Capture two items, give one an area, and confirm the Inbox count and the area's task list both change.

- [ ] T039 [P] [US3] Rewire `features/capture/capture-form.tsx` — chips are **every unarchived area in `sortOrder`**, with no cap and no filtering by daily (FR-022a). 001 hardcoded four ids that happened to be the daily ones, which was never a rule
- [ ] T040 [US3] Implement capture in `app/capture/page.tsx` — with no area the task goes to the inbox, with an area it does not (FR-020), recording `capturedAt`
- [ ] T041 [US3] Rewire `app/inbox/page.tsx` and `features/inbox/inbox-row.tsx` — tasks with no area, each with a captured label derived per FR-030, and a heading carrying the count
- [ ] T042 [US3] Implement `Give it an area` in `features/inbox/inbox-row.tsx` — the item leaves the inbox (FR-021)
- [ ] T043 [US3] Write `tests/e2e/capture-inbox-live.spec.ts` — capture with and without an area, give an inbox item an area, and assert both counts follow. Covers FR-020, FR-021, FR-022a

---

## Phase 6: User Story 4 — Areas mean something (Priority: P4)

**Goal**: Editing an area changes every screen that shows it; removing one does what the confirmation said.

**Independent test**: Change every control on Area edit and confirm Home, Areas, Week and Review follow. Remove an area and confirm the stated consequences occur.

- [ ] T044 [US4] Rewire `app/areas/page.tsx` and `features/areas/area-row.tsx` — unarchived areas in `sortOrder`, each rhythm line derived from `sessionsPerWeek` and `isDaily` (FR-016). `rhythmLabel` is no longer a field, and it is the first thing SC-001 checks
- [ ] T045 [US4] Derive the Areas heading and footer note in `app/areas/page.tsx` — including the one-area footer that drops `Drag to reorder.`, since there is nothing to reorder against
- [ ] T046 [US4] Rewire `features/areas/area-form.tsx` to write through to the store, so changes apply as the footer note has always claimed (FR-017)
- [ ] T047 [US4] Derive the removal confirmation in `features/areas/remove-confirmation.tsx` — one of four strings by whether the area has tasks, sessions, both or neither (spec.md §"Screen copy")
- [ ] T048 [US4] Wire removal to archiving in `features/areas/area-list.tsx`, and make reordering write `sortOrder` (FR-018, FR-019)
- [ ] T049 [US4] Write `tests/e2e/areas-live.spec.ts` — an edit reaching every screen, a removal moving tasks to the inbox while its sessions stay in Review, and a reorder changing Home. Covers FR-017, FR-018, FR-019, SC-008

---

## Phase 7: User Story 5 — Arrive with nothing, and build something (Priority: P5)

**Goal**: The app starts empty, and every empty state has its approved words.

**Independent test**: From empty state, create an area and reach a working Home.

- [ ] T050 [US5] Route to First run whenever there are no unarchived areas, in `app/page.tsx` — and never merely because Home would be empty (FR-025, contracts/derivations.md)
- [ ] T051 [P] [US5] Implement Areas' empty states in `app/areas/page.tsx` — `None right now` with its note, and `One area` with its footer
- [ ] T052 [P] [US5] Implement Home's empty states in `app/page.tsx` — no daily areas, and every daily area attended today
- [ ] T053 [P] [US5] Implement the Picker's two empty states in `features/session/picker-list.tsx` — never started and everything closed. The heading is the same; only the note distinguishes them
- [ ] T054 [P] [US5] Implement the Inbox's empty state in `app/inbox/page.tsx` — `Nothing unsorted` with its note, keeping 001's footer
- [ ] T055 [P] [US5] Implement Week's and Review's empty states in `app/week/page.tsx` and `app/review/page.tsx`, including suppressing Review's closing note when every area was attended, since there is nothing to explain
- [ ] T056 [US5] Write `tests/e2e/first-run-live.spec.ts` — from empty state to a working Home, and no seeded or suggested area anywhere. Covers FR-025, SC-009
- [ ] T057 [P] [US5] Write `tests/e2e/empty-states.spec.ts` — every empty state in spec.md §"Screen copy" renders its approved string, and none shows a zero phrased as a number

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T058 Write `tests/e2e/seed-001-parity.spec.ts` — with `?seed=001`, every screen renders 001's approved copy character for character. **This is the criterion the feature is judged by** (SC-001), and it is the reason the seed pins the clock
- [ ] T059 Confirm 001's thirteen e2e specs still pass unchanged, especially `tests/e2e/persistence.spec.ts` — nothing may be written to `localStorage`, `sessionStorage`, IndexedDB or cookies (FR-023)
- [ ] T060 [P] Update `tests/e2e/minutes.spec.ts` for derived values — minutes reported on Review, the session clock and Home's attended line, with the Picker's `Tend for fifteen minutes` still the one approved duration outside them (SC-006)
- [ ] T061 [P] Update `tests/e2e/no-pressure.spec.ts` — no percentage, no progress element, no streak or badge, and nothing sized to a fraction of its parent. This matters more here than in 001: `sessionsInWeek` and `sessionsPerWeek` now both exist, and dividing them is one line away (FR-004, SC-005, plan.md §"The second gate")
- [ ] T062 [P] Update `tests/e2e/dimensions.spec.ts` and `tests/e2e/navigation.spec.ts` for the new routes and states, at both widths (SC-007)
- [ ] T063 Code review against Article VI — no component performs arithmetic, comparison against a rhythm, date formatting or string assembly, and no function in `lib/derive/` reads the clock. Covers FR-001, SC-010, which are properties of how the code is written rather than of what it renders
- [ ] T064 Verify on a real device at 390px and 320px per quickstart.md, including the clock past zero, a session surviving navigation, and the week boundary
- [ ] T065 Run Article III's addition test over all ten screens, with particular attention to Week now that it carries `Look back on last week`

---

## Dependencies

```
Phase 1 Setup
    ↓
Phase 2 Foundational  ← blocks everything; state, time, derivations
    ↓
    ├── Phase 3 US1 (P1)  Home, Picker, Session    ← MVP
    ├── Phase 4 US2 (P2)  Week, Review
    ├── Phase 5 US3 (P3)  Capture, Inbox
    ├── Phase 6 US4 (P4)  Areas, Area edit
    └── Phase 7 US5 (P5)  First run, empty states
    ↓
Phase 8 Polish  ← needs every screen rewired
```

**Story independence**: All five stories are independently implementable once Phase 2 is done. US5's empty states touch screens the other stories build, so it reads most cleanly last — but each of its tasks is a separate branch in a screen that already works, not a rewrite of it.

**Within-phase ordering**: derivations before the screen that reads them; the screen before its test.

## Parallel execution examples

**Phase 2** — after T004 and T005 (both write `lib/state/`):

```
T010 lib/derive/week.ts      ┐
T012 lib/derive/counting.ts  ├── four different files, no shared dependency
T014 lib/derive/format.ts    │
T009 tests/unit/store.test.ts┘
```

Each derivation's test is parallel with the others, and `lib/derive/screens.ts` (T016) depends on all three.

**Phase 7** — every empty state is a different file:

```
T051 app/areas/page.tsx            ┐
T052 app/page.tsx                  ├── five screens, five branches
T053 features/session/picker-list  │
T054 app/inbox/page.tsx            │
T055 app/week + app/review         ┘
```

## Implementation strategy

**MVP is Phase 1 + Phase 2 + Phase 3.** That is the sit-down-and-tend loop with a real clock and a session that changes what the other screens say — the thing 001 could draw but not do.

Phase 2 is unusually large for a foundational phase, and deliberately so. Every screen in Phases 3–7 is a rewiring rather than a build, because the components already exist and take the props they always took. What makes that possible is that the derivations are finished and unit-tested first.

**Do not run `/speckit-implement` before `/speckit-analyze` passes** — Article VII makes that gate binding, not advisory.
