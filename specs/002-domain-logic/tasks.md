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

- [X] T001 Create `lib/state/`, `lib/derive/` and `lib/seed/`. The split is load-bearing: `state/` is the only part that mutates, `derive/` is pure and takes `now`, and `seed/` never ships as a default path (plan.md §"Structure Decision")
- [X] T002 Extend `lib/copy.ts` with the **twenty-six approved** strings from spec.md §"Screen copy", character-exact. Several are templates — `{area}`, `{n}`, `{names}`, `{sessions}`, `{note}` and `{task}` — and the interpolation points are named there. No user-facing string may be written inline in a component or assembled from fragments in a derivation. Covers FR-027
- [X] T002a Add the Picker's consequence line to `lib/copy.ts` as a template taking the task title — `A session on {task} is still running. Starting here closes it.` Approved 2026-09-24 with its four rules (spec.md §"Screen copy"). The title is interpolated verbatim and never truncated
- [X] T003 Extend `tests/unit/copy.test.ts` to lint the new strings for Article II's forbidden lexicon, emoji, exclamation marks and apologies, calling every template with a sample so its output is linted too. Covers FR-028

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: State, time and the derivations every screen reads from. Nothing in Phase 3+ can begin until this is done.

**⚠️ CRITICAL**: The rule that governs this whole phase — **no function in `lib/derive/` may read the clock.** `now` is an argument everywhere (research.md §2). A function that reads the clock is not pure, not unit-testable and not isolated from its environment, which is three of Article VI's four requirements lost to one habit.

### State

- [X] T004 Define state types in `lib/state/types.ts` per data-model.md — `Area` (with `sessionsPerWeek: 1|2|3|4|5`, `isDaily`, `sortOrder`, `archivedAt: Date | null`), `Task` (with `areaId: string | null` where null means the inbox, `onWeekList`, `capturedAt: Date`, `doneAt: Date | null`), `Session` (with `startedAt`, `endedAt: Date | null`, `plannedMinutes`, `outcome: 'completed' | 'progressed' | null`, `progressNote: string` where `''` means attended without a note), and `State`. **No field may hold a user-facing sentence** — if you can read one in the state, the state is wrong
- [X] T005 Implement the reducer in `lib/state/store.ts` with the **eleven** transitions in data-model.md §"State transitions" — including **create an area** and **edit an area**, which were missing from that table until after `/speckit-analyze` and are what US4's rhythm change and US5's first area both run through. Starting a session **closes a running one** on another area's task, as `progressed` with an empty note and its `actualMinutes` written (FR-015c) — the slot is emptied by the same transition that fills it, which is what makes `One still open.` singular by construction rather than by hope (FR-015d). `actualMinutes` is **written once, at close, and never recalculated** (FR-010a) — a session orphaned by a closed tab has no `endedAt` for a derived figure to come from, which is why PRODUCT-SPEC §3.3 makes it a field
- [X] T006 Implement area removal in `lib/state/store.ts` as **archiving**, not deletion — `archivedAt: now`, tasks get `areaId: null` keeping their titles, sessions untouched (FR-018). PRODUCT-SPEC RF-04 says *archivar*, and it is what lets the confirmation's promise about Review be true
- [X] T007 Create `lib/state/provider.tsx` — a client provider mounted in `app/layout.tsx`, holding state in memory. It writes to no storage API (FR-023). Being above the router is what lets a running session survive navigation (FR-024). **It does not publish the clock**: time is `lib/state/clock.tsx`, and keeping them apart is what stops a one-second tick re-rendering every screen
- [X] T008 Create `lib/state/clock.tsx` with **two contexts**: a ticking `now` that advances once a second while a session is active, and a day-granularity `now` that changes only when the local date changes. The session clock subscribes to the first; every other screen subscribes to the second. Both are the same argument to the same pure functions — a day name, a week boundary and a rhythm comparison cannot change more than once a day, and asking them every second is the whole of plan.md §"Performance Goals" lost to one convenience
- [X] T009 [P] Write `tests/unit/store.test.ts` — **all eleven transitions**, including that creating an area appends it in `sortOrder` and editing one changes it in place without touching `sortOrder` or `archivedAt` (FR-016, FR-017), that closing as done sets `doneAt` and takes the task off the week list, closing as progressed does neither, switching task mid-session leaves `startedAt` alone, archiving an area leaves its sessions intact, and `actualMinutes` is written at close and unchanged by any later action (FR-010a). Assert the invariant directly: **after any sequence of starts, at most one session has no `endedAt`** (FR-015c, FR-015d)

### Derivations

- [X] T010 [P] Implement `lib/derive/week.ts` — `startOfWeek`, `endOfWeek`, `weekOf(session)`, `isWeekClosing(now)`. **Week starts are built from local date parts, never by subtracting milliseconds**: days are not reliably 86,400,000ms apart under daylight saving (research.md §3). `weekOf` reads `startedAt` and never `endedAt` (FR-006)
- [X] T011 [P] Write `tests/unit/week.test.ts` — Monday 00:00 and Sunday 23:59:59.999 boundaries, a session starting Sunday 23:58 and ending Monday 00:20 belonging to the closing week, and a week spanning a daylight-saving changeover still starting at local midnight. Covers FR-005, FR-006, SC-002
- [X] T012 [P] Implement `lib/derive/counting.ts` — `sessionsInWeek`, `minutesInWeek`, `openSessionInWeek`, `isPastRhythm`, `attendedToday`, `lastAttended`. **`sessionsInWeek` counts open sessions and `minutesInWeek` does not** (FR-006a): a session counts from its start and measures from its close, and `actualMinutes` is null until then. `openSessionInWeek` is what lets Review name the session the figure omits (FR-008a). **No function here returns a ratio.** `isPastRhythm` returns a boolean; dividing sessions by rhythm is one line away at every call site and is the shape Article I forbids (plan.md §"The second gate")
- [X] T013 [P] Write `tests/unit/counting.test.ts` — counts at, below and above the rhythm; `attendedToday` true for a session that has started and not closed (FR-015a); `lastAttended` across a week boundary; and an open session counted by `sessionsInWeek`, ignored by `minutesInWeek` and returned by `openSessionInWeek` (FR-006a)
- [X] T014 [P] Implement `lib/derive/format.ts` — `numberWord` (words to twelve, figures from thirteen, FR-029), `dayName` (day name to seven days back, date beyond, FR-030), `joinNames` (`A and B`, `A, B and C`, FR-022b), `clockString` derived from `startedAt` and `now` rather than counted down. Covers FR-003 through its terms
- [X] T015 [P] Write `tests/unit/format.test.ts` — the twelve/thirteen boundary in both directions, day names at exactly seven and eight days back, joining at one, two and three names, and `clockString` before zero, at zero and past it. Covers FR-011, FR-029, FR-030, FR-022b
- [X] T016 Implement `lib/derive/screens.ts` — one function per screen region per contracts/derivations.md, each taking `(state, now)` and returning finished strings. Derivations **choose between templates in `lib/copy.ts` and fill them**; they never concatenate prose
- [X] T017 [P] Write `tests/unit/screens.test.ts` — each region's output for the ordinary case and for every empty case in spec.md §"Screen copy"

### The seed

- [X] T018 Create `lib/seed/fixture-001.ts` — state equivalent to 001's fixtures **and** a clock origin of Sunday 13 September 2026, **13:00 local**. The seeded `now` is `origin + real elapsed time since mount`, not a frozen moment: a frozen clock leaves the session screen dead under the only state the parity test runs against, and quickstart asks for the clock to be watched past zero under seed. Parity holds until local midnight, which is eleven hours. Both halves are required: 001's copy says `Sunday`, `Last attended Monday.` and `Week of 7 September`, which are functions of the date, so seeding data without seeding time makes SC-001 fail every day but one (research.md §5)
- [X] T019 Wire `?seed=001` in `lib/state/provider.tsx` and `lib/state/clock.tsx` — read once on mount, never the default, writing nothing (FR-025, FR-026). It seeds both halves: the state in the provider and the clock origin in the clock

**Checkpoint**: `lib/` is complete and unit-tested. Screens can now be rewired in any order.

---

## Phase 3: User Story 1 — Tend something, and watch it count (Priority: P1) 🎯 MVP

**Goal**: Home → Picker → Session, with a real clock and a session that changes things.

**Independent test**: Seed, start a session, let the clock run past zero, close it with a note, and confirm Home, the Picker and Week each changed in the way the session implies.

- [X] T020 [US1] Rewire `app/page.tsx` (Home) to the store — day-name heading, daily unarchived areas in `sortOrder`, each card's treatment and line derived (FR-013). Ordering is unchanged from 001 and is **001's FR-013a**, not this feature's: attended below what is still open. Ids are per feature, and 002's own FR-013 is about closing a session as done
- [X] T021 [US1] Add the `tending-now` treatment to `features/home/area-card.tsx`. It is a fourth treatment rather than a variant of `attended`, so the card cannot render a figure that does not exist yet (FR-015a). **Its line depends on the day**: `Tending now` alone when the running session is the area's first today, and `Attended today, {n} minutes · tending now` when minutes were already attended — a session in progress adds to the day rather than erasing it (FR-015b). The card is handed whichever string applies, never the pieces. Depends on T002a
- [X] T022 [P] [US1] Derive Home's absence note in `app/page.tsx` — one sentence naming the non-daily areas, joined per FR-022b, and no sentence at all when none is absent (FR-022)
- [X] T023 [US1] Rewire `app/tend/[areaId]/page.tsx` and `features/session/picker-list.tsx` — the area's week-list tasks that are not done, each with its last-session note in one of its three forms (FR-014)
- [X] T024 [US1] Rewire `app/session/[taskId]/page.tsx` and `features/session/session-clock.tsx` to the live clock, and **remove `?state=`** — it was an inspection affordance for three static fixtures and there is now one real clock
- [X] T025 [US1] Implement starting a session from the Picker's primary action, and switching task mid-session without ending it (FR-015). Switching changes `taskId` and leaves `startedAt` alone: it is one session. Starting in **another** area closes the running session as progressed with an empty note and starts a new one, without blocking or confirming (FR-015c, FR-012)
- [X] T025a [US1] Render the consequence line in `features/session/picker-list.tsx`, **inside the `StickyFooter`, directly above the action** (FR-015c) — the consequence beside the button it belongs to, styled as the removal confirmation's explanation is: `text-sm leading-relaxed text-muted-foreground text-pretty`. Nothing when the session runs in this area: that is a switch, and the 001 footer note already says so. The screen is handed the finished sentence or nothing, never the running session to phrase itself from
- [X] T025b [US1] Recalculate the sticky footer's pre-hydration reservation in `components/sticky-footer.tsx` and its nine call sites. T025a makes a **fourth footer shape** — line, action, note — and it is the tallest, so the `9rem` fallback documented as "the tallest footer" is now short, which is the first-paint bug that comment describes. At 320px the container's `px-5` leaves 280px, and the shape measures `pt-7` 28 + three wrapped lines of `text-sm leading-relaxed` 69 + `gap-2` 8 + `h-11` 44 + `gap-2` 8 + two wrapped lines of `text-xs` 32 + `pb-6` 24 ≈ **213px**. The new fallback is **`15rem`** (240px), which also covers a four-line wrap. **Define it once** — the literal is currently repeated in nine files, and a number in nine places drifts in eight of them
- [X] T025c [US1] Write `tests/e2e/footer-reservation.spec.ts` — at 320px, with a session running on another area's task and the longest seeded title, measure the Picker's footer and assert it is **not taller than the fallback**, and that the last item in the list is not covered by the bar. This is what pins the number: a longer string or a fourth line makes the test fail rather than making a slow phone fail. Covers SC-007
- [X] T026 [US1] Implement both closing actions in `app/session/[taskId]/page.tsx` — done and progressed, each recording `endedAt`, `actualMinutes`, outcome and note (FR-010, FR-010a, FR-013). The live clock stays derived; the record is written once and never recomputed
- [X] T027 [US1] Write `tests/e2e/session-loop.spec.ts` — start a session, close it, and assert Home, the Picker and Week all changed. Covers US1's acceptance scenarios and SC-004
- [X] T028 [US1] **Rewrite** `tests/e2e/session-states.spec.ts` for a real clock. The test is remade, not deleted: what it protected is still a requirement. Assert the three moments of a session — before zero, at zero, and well past it — are identical in layout, colour and controls, differing only in the clock string and the line beneath it. It moves `now` with **Playwright's `page.clock`** — `install()` before navigating, then `fastForward()` past fifteen minutes — which works because the app reads real time in exactly one place, the provider's tick, and derives the rest from what that tick publishes (research.md §2). No test-only entry point is added to the app. Covers **FR-011** and **SC-003** (001's SC-007 carried forward; renumbered because SC-007 here is the dimensional criterion)
- [X] T029 [P] [US1] Write `tests/e2e/session-continuity.spec.ts` — a running session survives navigating to Home and back, the clock has advanced (`page.clock.fastForward`), and Home showed `Tending now` while away. Add the two-session case: starting one in another area closes the first as progressed, the Picker said so first, and exactly one session is open afterwards. Covers FR-024, FR-015a, FR-015c, FR-015d
- [X] T030 [P] [US1] Write `tests/e2e/session-uninterrupted.spec.ts` — past zero, nothing turns red, nothing pulses, no dialog appears, both closing actions stay in place and the layout does not move. Covers FR-012

**Checkpoint**: the loop 001 drew and could not close now closes.

---

## Phase 4: User Story 2 — The week counts itself (Priority: P2)

**Goal**: Week and Review, counting real sessions, with Review reachable every day.

**Independent test**: With sessions across several areas, open Week and Review and confirm every figure matches the sessions that exist.

- [ ] T031 [US2] Rewire `app/week/page.tsx` and `features/week/week-row.tsx` — heading, rows, sessions committed and attended, all derived. An open session is already counted here and Week says nothing about it, because Week has no minutes for the omission to explain (FR-006a). **No minutes reach this screen** (FR-007): the derivation that would produce a minute total is not offered to it
- [ ] T032 [US2] Add `Look back on last week` to `app/week/page.tsx` — a tertiary text link beneath `Change the rhythm`, not a button, present every day (FR-019b). It passes Article III's addition test on its merits, argued in spec.md §"Why Week carries a route to last week"
- [ ] T033 [US2] Rewire `app/review/page.tsx` and `features/review/review-section.tsx` — Attended before Unattended, minutes as plain figures, the week's date in the eyebrow (FR-008). Minutes sum the **closed** sessions, and an open session is named on its area's row in one of the three forms, so a short figure is explained rather than merely short (FR-006a, FR-008a). An area whose only session this week is the open one renders no figure at all, never a zero. Depends on T002a
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
- [ ] T046 [US4] Rewire `features/areas/area-form.tsx` to write through to the store — **both** transitions, creating from `/areas/new` and First run, and editing an existing area, so changes apply as the footer note has always claimed (FR-016, FR-017). These are the two transitions data-model.md was missing before `/speckit-analyze`
- [ ] T047 [US4] Derive the removal confirmation in `features/areas/remove-confirmation.tsx` — one of four strings by whether the area has tasks, sessions, both or neither (spec.md §"Screen copy")
- [ ] T048 [US4] Wire removal to archiving in `features/areas/area-list.tsx`, and make reordering write `sortOrder` (FR-018, FR-019)
- [ ] T049 [US4] Write `tests/e2e/areas-live.spec.ts` — an edit reaching every screen, a removal moving tasks to the inbox while its sessions stay in Review, and a reorder changing Home. Covers FR-017, FR-018, FR-019, SC-008

---

## Phase 7: User Story 5 — Arrive with nothing, and build something (Priority: P5)

**Goal**: The app starts empty, and every empty state has its approved words.

**Independent test**: From empty state, create an area and reach a working Home.

- [ ] T050 [US5] Route to First run whenever there are no unarchived areas, in `app/page.tsx` — and never merely because Home would be empty (FR-025). **The route lives on `/` alone** (FR-025a): no other screen redirects, which is what keeps `None right now` on Areas reachable, since that is the screen a person is standing on when they remove the last area
- [ ] T051 [P] [US5] Implement Areas' empty states in `app/areas/page.tsx` — `None right now` with its note, and `One area` with its footer
- [ ] T052 [P] [US5] Implement Home's empty states in `app/page.tsx` — no daily areas, and every daily area attended today. The all-attended note is **withheld while a session is open**: an area counts as attended from the moment its session starts (FR-015a), so `Nothing is waiting.` beside a card reading `Tending now` would be contradicted one line below. It returns when the session closes
- [ ] T053 [P] [US5] Implement the Picker's two empty states in `features/session/picker-list.tsx` — never started and everything closed. The heading is the same; only the note distinguishes them
- [ ] T054 [P] [US5] Implement the Inbox's empty state in `app/inbox/page.tsx` — `Nothing unsorted` with its note, keeping 001's footer
- [ ] T055 [P] [US5] Implement Week's and Review's empty states in `app/week/page.tsx` and `app/review/page.tsx`, including suppressing Review's closing note when every area was attended, since there is nothing to explain
- [ ] T056 [US5] Write `tests/e2e/first-run-live.spec.ts` — from empty state to a working Home, and no seeded or suggested area anywhere. Covers FR-025, SC-009
- [ ] T057 [P] [US5] Write `tests/e2e/empty-states.spec.ts` — every empty state in spec.md §"Screen copy" renders its approved string, and none shows a zero phrased as a number

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T058 Write `tests/e2e/seed-001-parity.spec.ts` — with `?seed=001`, every screen renders 001's approved copy character for character. **This is the criterion the feature is judged by** (FR-002, SC-001), and it is the reason the seed sets a clock origin rather than only data
- [ ] T059 **Seed 001's e2e specs, and confirm each screen still renders the same copy.** Every one of them navigates to `?seed=001` and then moves by tapping, never by a second `page.goto`. `tests/e2e/persistence.spec.ts` keeps its assertions unchanged: nothing may be written to `localStorage`, `sessionStorage`, IndexedDB or cookies (FR-023), and a reload still resets.

  **Why this changed.** It read "confirm 001's thirteen e2e specs still pass unchanged", which this feature made impossible. 001's app was its fixtures, so any visit to `/` rendered five areas; 002's app starts genuinely empty (FR-025), so an unseeded visit renders First run and every assertion about a card, a task or a row is asserting about a screen that is not there. Seventy-seven of them failed the first time the rewired screens met them, and a test that only passes because the thing it checks is absent is worse than no test.

  What they protect did not change with the mechanism. **Given state equivalent to 001's, every screen must render exactly the copy 001 rendered**, and that is still the backbone of SC-001 — these specs are where it is checked screen by screen, with T058 checking it end to end.

  The second half is the one that bites: state lives in memory, so `page.goto` mid-test is a reload and a reload is the reset. A spec that navigates with `goto` tests the empty app while appearing to test the seeded one, which is the same failure wearing the opposite face. Covers FR-002, FR-023, SC-001
- [ ] T059a Write `tests/e2e/empty-start.spec.ts` — **with no seed, the app starts empty and lands on First run.** Visit `/` with no query at all and confirm First run is what is rendered, that no area, task or session is suggested anywhere on it (FR-025, Article I), and that `/areas` renders `None right now` rather than redirecting, because the route to First run lives on `/` alone (FR-025a).

  This is the behaviour that made seventy-seven tests fail, and nothing verified it. Every spec in the suite either seeds or asserts about a screen with data on it, so the default path — the one every real first visit takes — was the one path no test walked. Covers FR-025, FR-025a, SC-009

- [ ] T060 [P] Update `tests/e2e/minutes.spec.ts` for derived values — minutes reported on Review, the session clock and Home's attended line, with the Picker's `Tend for fifteen minutes` still the one approved duration outside them (SC-006). Add the open-session rule: with a session running, Week's count includes it, Review names it and omits its minutes, and Home's line keeps the minutes already attended today (FR-006a, FR-008a, FR-015b)
- [ ] T061 [P] Update `tests/e2e/no-pressure.spec.ts` — no percentage, no progress element, no streak or badge, and nothing sized to a fraction of its parent. This matters more here than in 001: `sessionsInWeek` and `sessionsPerWeek` now both exist, and dividing them is one line away (FR-004, SC-005, plan.md §"The second gate")
- [ ] T062 [P] Update `tests/e2e/dimensions.spec.ts` and `tests/e2e/navigation.spec.ts` for the new routes and states, at both widths (SC-007)
- [ ] T063 Code review against Article VI — no component performs arithmetic, comparison against a rhythm, date formatting or string assembly, and no function in `lib/derive/` reads the clock. Covers FR-001, SC-010, which are properties of how the code is written rather than of what it renders
- [ ] T063a Review the clock subscriptions — **only the session clock subscribes to the ticking `now`**; every other screen reads the day-granularity value (plan.md §"Performance Goals"). Grep the subscribers and name them in the review. This is the only check the constraint has: a re-render count is not observable from an e2e assertion, so like SC-010 it is verified by reading the code rather than by running it
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

**Nothing in the MVP is gated on anything outside the code.** The Picker's consequence line was the last approval outstanding and it landed on 2026-09-24, so T002a, T025a and T025b are ordinary tasks in the order the phase already sets.

Phase 2 is unusually large for a foundational phase, and deliberately so. Every screen in Phases 3–7 is a rewiring rather than a build, because the components already exist and take the props they always took. What makes that possible is that the derivations are finished and unit-tested first.

**Do not run `/speckit-implement` before `/speckit-analyze` passes** — Article VII makes that gate binding, not advisory.
