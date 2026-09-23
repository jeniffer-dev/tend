# Feature Specification: Domain logic

**Feature Branch**: `002-domain-logic`

**Created**: 2026-09-23

**Status**: Draft — three open questions, see §"Questions for /speckit-clarify"

**Input**: User description: "Feature 002: la lógica real detrás de las diez pantallas. Las mismas pantallas, los mismos textos, pero los valores se calculan en vez de estar escritos en el fixture, y el estado vive durante la sesión del navegador (sin persistencia todavía; eso es la 003)."

## What this feature is

The same ten screens, the same words, and nothing new on any of them. What
changes is underneath: **every value a screen shows is derived from state,
where feature 001 stored the finished sentence.**

Feature 001 built `lib/fixtures.ts` so that `Week` could read
`Three tasks on the list. Two sessions attended.` as a literal string. That
was deliberate — it made "no business logic in components" impossible to
fail by accident, and it left this feature's job visible. This feature
replaces those literals with functions in `lib/`, and the components do not
change.

State lives for as long as the browser session. Nothing is written to disk;
persistence is feature 003.

### The test that defines "done"

**Given state equivalent to 001's fixtures, all ten screens must render the
same copy 001 rendered, character for character.** 001's approved strings
become this feature's regression anchor: if the derivation is right, the
sentences come back identical. If a single word differs, either the
derivation is wrong or a rule was never written down.

## Decisions already taken

These are settled and this specification is bound by them. They are not
open for reinterpretation during planning.

- **The week runs Monday 00:00 to Sunday 23:59, local time.** One boundary
  for the whole system: no per-area weeks and no configurable start
  (`PRODUCT-SPEC.md` §4.4).
- **A session belongs to the week containing its start**, however it ends.
  A session begun at 23:58 on Sunday belongs to the week that is closing,
  even if it is closed on Monday.
- **The clock counts fifteen minutes down, reaches 0:00 and keeps counting
  up.** It is never cut off, never interrupted, and never blocked. Passing
  zero changes nothing but the number and the line beneath it.
- **Passing the rhythm is extra; falling short is a fact about the week.**
  No percentages, no streaks, no scoreboards (Constitution Article I).
- **The rhythm is `sessions_per_week`, an integer from 1 to 5.**
  `weekly_budget_minutes` is gone from the model (`PRODUCT-SPEC.md` §3.1,
  amended 0.4). Minutes are recorded per session and shown in exactly three
  places; they are never a budget.

## What each screen must now derive

The table is the feature. Everything on the left was a literal string in
001; everything on the right is what it must be computed from.

| Screen | Value | Derived from |
|---|---|---|
| Areas | `Three sessions a week · in Home daily` | `sessions_per_week`, `is_daily` |
| Areas | `Five, in your order` | the number of areas |
| Areas | the removal explanation's counts | that area's tasks and past sessions |
| Home | `Sunday` | today's date |
| Home | which areas appear | `is_daily` |
| Home | the treatment of each area | sessions this week vs rhythm; attended today |
| Home | `Last attended Monday.` | the most recent session on that area |
| Home | `Past the two sessions you set for this week.` | sessions this week, rhythm |
| Home | `Attended today, 15 minutes` | today's sessions on that area |
| Home | whether the Review entry appears | whether the week is closing |
| Home | the absence note | the non-daily areas |
| Picker | which tasks appear | the area's week-list tasks |
| Picker | each task's last-session note | that task's most recent session |
| Session | the clock and its note | elapsed time since the session started |
| Capture | which area chips appear | the areas |
| Inbox | `Three unsorted` | tasks with no area |
| Inbox | `Captured Monday` | when the task was captured |
| Week | `Four areas, ten sessions` | the week's areas and their rhythms |
| Week | each row's sessions and line | that area's week-list tasks and sessions |
| Review | `Week of 7 September` | the week being reviewed |
| Review | `Six sessions` | sessions in that week |
| Review | attended vs unattended | sessions per area in that week |
| Review | `52 minutes. Last note: …` | that area's sessions and their notes |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tend something, and watch it count (Priority: P1)

Someone opens Home, taps Tend on an area, picks a task and starts a
session. The clock runs. They write where they got to and close it. Home,
Week and Review all now reflect that session — the area's line changes, the
week's count goes up, and the note is there the next time the task comes
around.

**Why this priority**: This is the loop 001 drew and could not close.
A session that does not change anything is not a session. Every other story
depends on sessions existing.

**Independent Test**: Start a session, let the clock run, close it as
progressed with a note, and confirm Home, the Picker and Week each changed
in the way the session implies.

**Acceptance Scenarios**:

1. **Given** an area with no sessions this week, **When** the person closes
   a session on it, **Then** Home's line for that area reports it as
   attended today, and Week's row counts one more session attended.
2. **Given** a session closed as progressed with a note, **When** the person
   returns to that area's Picker, **Then** the task shows that note as its
   last-session note.
3. **Given** a session closed as done, **When** the person returns to the
   Picker, **Then** the task is no longer on the week list.
4. **Given** a running session, **When** the clock passes 0:00, **Then** it
   continues counting upward, the layout does not change, and both closing
   actions remain available.
5. **Given** a session started before midnight on Sunday, **When** it is
   closed after midnight on Monday, **Then** it counts toward the week that
   contained its start.

---

### User Story 2 - The week counts itself (Priority: P2)

Someone opens Week and sees what they committed to and what they have
attended. They open Review and see the week in two parts: what was
attended, with minutes, and what was not.

**Why this priority**: The rhythm is the product's unit of intent, and it
is meaningless until something counts against it. It ranks below the
session because a session is what produces the count.

**Independent Test**: With sessions recorded across several areas, open Week
and Review and confirm every figure matches the sessions that exist.

**Acceptance Scenarios**:

1. **Given** areas with rhythms and sessions this week, **When** the person
   opens Week, **Then** each row states that area's rhythm and the sessions
   attended, and no minutes appear anywhere on the screen.
2. **Given** an area with more sessions than its rhythm, **When** the person
   reads its row, **Then** the extra sessions are presented as extra and
   nothing is presented as an excess or a failure.
3. **Given** an area with no sessions this week, **When** the person opens
   Review, **Then** that area appears under Unattended, described as a fact
   about the week.
4. **Given** the week has sessions, **When** the person reads Review,
   **Then** minutes appear there as plain figures and on no other screen
   except the session clock and Home's attended line.

---

### User Story 3 - Capture and sort for real (Priority: P3)

Someone captures a line. It appears in the Inbox because it has no area.
Later they give it an area, and it leaves the Inbox and becomes available
to that area's week list.

**Why this priority**: Capture is what keeps the session from becoming a
sorting exercise, and in 001 it did nothing at all.

**Independent Test**: Capture two items, give one an area, and confirm the
Inbox count and the area's task list both change accordingly.

**Acceptance Scenarios**:

1. **Given** the Capture screen, **When** the person captures a line with no
   area, **Then** it appears in the Inbox with when it was captured.
2. **Given** the Capture screen, **When** the person captures a line with an
   area chosen, **Then** it belongs to that area and does not appear in the
   Inbox.
3. **Given** an item in the Inbox, **When** the person gives it an area,
   **Then** the Inbox count decreases by one and the item belongs to that
   area.

---

### User Story 4 - Areas mean something (Priority: P4)

Someone changes an area's rhythm, its colour, its name or whether it waits
on Home, and every screen that shows the area reflects the change. They
remove an area and are told first what happens to its tasks and its past
sessions — and then it happens.

**Why this priority**: Areas are the spine, and 001 could describe a change
but not make one.

**Independent Test**: Change every control on Area edit and confirm Home,
Areas, Week and Review all follow. Remove an area and confirm the
consequences stated in the confirmation are the consequences that occur.

**Acceptance Scenarios**:

1. **Given** an area shown on Home, **When** the person sets it to appear
   only when added, **Then** it leaves Home and the absence note accounts
   for it.
2. **Given** an area with a rhythm of two, **When** the person sets it to
   four, **Then** Areas, Week and Home all state the new rhythm.
3. **Given** an area with tasks and past sessions, **When** the person
   removes it, **Then** its tasks move to the Inbox keeping their names, and
   its past sessions remain in Review, exactly as the confirmation said.
4. **Given** the reordered Areas list, **When** the person opens Home,
   **Then** the areas appear in the new order.

---

### User Story 5 - Arrive with nothing, and build something (Priority: P5)

Someone opens the app with no areas. First run invites them to name one.
They make it, and from then on they have a Home.

**Why this priority**: It is seen once, and it is the only path that proves
the app works from genuinely empty state rather than from example data.

**Independent Test**: From empty state, create an area and confirm Home
renders it.

**Acceptance Scenarios**:

1. **Given** no areas exist, **When** the person opens the app, **Then**
   First run is what they see.
2. **Given** First run, **When** the person names an area and leaves Area
   edit, **Then** Areas lists exactly that one area.
3. **Given** one area exists, **When** the person opens Home, **Then** that
   area is on it if it is a daily area.

---

### Edge Cases

- **The clock passes zero and keeps going.** At 0:00 and beyond the session
  keeps recording and counts upward. Nothing turns red, nothing pulses, no
  action is taken away, and no prompt interrupts. A session has no maximum.
- **A session crosses the week boundary.** It counts to the week containing
  its start, so a session begun Sunday 23:58 and closed Monday 00:20 is part
  of the closing week.
- **A session crosses midnight within a week.** "Attended today" follows the
  session's start, for the same reason.
- **An area is past its rhythm.** Its extra sessions are extra. It stays
  tendable, nothing is blocked, and no red appears.
- **An area has no week-list tasks.** The Picker has nothing to offer.
- **A week has no sessions at all.** Review has an empty Attended section.
- **The Inbox is empty.** Nothing is unsorted.
- **There are no areas.** First run is the whole app.
- **One area, or more than five.** The counts in headings must read
  correctly at both ends.
- **A task has never been attended.** Its last-session note says so rather
  than showing a gap.
- **Two sessions on the same area on the same day.** Both count toward the
  week; the area is attended today either way.

## Requirements *(mandatory)*

### Functional Requirements

#### Derivation

- **FR-001**: Every value shown on every screen MUST be derived from state.
  No displayed sentence, count, label or treatment may be stored as a
  literal string, and no derivation may live in a component (Constitution
  Article VI).
- **FR-002**: Given state equivalent to 001's fixtures, every screen MUST
  render copy character-identical to what 001 rendered.
- **FR-003**: The system MUST spell quantities as the approved copy spells
  them, and MUST state minutes as figures where the approved copy does.
- **FR-004**: The system MUST NOT show a percentage, a streak, a badge, a
  level, a scoreboard or any completion proportion, on any screen or as the
  size of any element.

#### The week

- **FR-005**: The week MUST run Monday 00:00 to Sunday 23:59 in the device's
  local time, as one boundary for the whole system.
- **FR-006**: A session MUST count toward the week containing its start,
  regardless of when or how it ends.
- **FR-007**: Week MUST count in sessions and MUST NOT show minutes.
- **FR-008**: Review MUST present the week that is closing or has closed,
  with Attended before Unattended, and MUST show minutes as plain figures.
- **FR-009**: An area with more sessions than its rhythm MUST be presented
  as having extra sessions. An area with fewer MUST be presented as a fact
  about the week and never about the person.

#### The session

- **FR-010**: A session MUST record when it started, when it ended, the
  minutes actually elapsed, its outcome and its progress note.
- **FR-011**: The clock MUST count down from fifteen minutes, reach 0:00 and
  continue counting upward, with no maximum and no interruption.
- **FR-012**: The system MUST NOT block, pause, warn, or prompt during a
  session for any reason, including elapsed time.
- **FR-013**: Closing a session as done MUST take its task off the week
  list. Closing as progressed MUST leave the task on the week list with the
  note attached.
- **FR-014**: A task's last-session note MUST be the note from its most
  recent session, and MUST state that it has not been attended when there is
  none.
- **FR-015**: The person MUST be able to switch to another task in the same
  area without ending the session.

#### Areas, tasks and capture

- **FR-016**: An area MUST carry a name, a colour from the palette, a rhythm
  of 1 to 5 sessions a week, and whether it waits on Home daily.
- **FR-017**: Changing any of those MUST be reflected on every screen that
  shows the area.
- **FR-018**: Removing an area MUST move its tasks to the Inbox keeping
  their names, and MUST leave its past sessions in Review — the consequences
  its confirmation states.
- **FR-019**: Reordering areas MUST change the order on Home.
- **FR-020**: Capturing with no area MUST place the item in the Inbox.
  Capturing with an area MUST assign it and keep it out of the Inbox.
- **FR-021**: Giving an Inbox item an area MUST remove it from the Inbox.
- **FR-022**: Home MUST show only daily areas, and MUST account for the
  others rather than omitting them silently.

#### State

- **FR-023**: State MUST live for the browser session and MUST NOT be
  written to durable storage. Persistence is feature 003.
- **FR-024**: The system MUST NOT lose a running session while the person
  moves between screens.

#### Copy

- **FR-025**: All copy MUST remain as approved in 001 §"Screen copy". Any
  string this feature needs that 001 does not have is new approved copy and
  MUST be written down before it is built.
- **FR-026**: No screen may use a word from the forbidden lexicon
  (Constitution Article II), an emoji, an exclamation mark or an apology.

### Key Entities

- **Area**: a name, a colour, `sessions_per_week` (1–5), whether it appears
  on Home daily, and its order.
- **Task**: a title, the area it belongs to or none, whether it is on this
  week's list, and when it was captured.
- **Session**: the task and area it was against, when it started and ended,
  the minutes elapsed, its outcome (`completed` or `progressed`), and its
  progress note.
- **Week**: not stored. A week is a span derived from a date, and everything
  weekly is a question asked of the sessions that fall inside it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With state equivalent to 001's fixtures, all ten screens
  render copy identical to 001's, character for character.
- **SC-002**: A session started at 23:58 on Sunday and closed at 00:20 on
  Monday is counted in the closing week, on both Week and Review.
- **SC-003**: A session's clock reaches 0:00 and continues upward, and
  nothing on the screen changes but the number and its line.
- **SC-004**: Closing a session changes Home, the Picker, Week and Review in
  one step, with no screen left stale.
- **SC-005**: No screen renders a percentage, a progress element, a streak, a
  badge or any element sized to a fraction of its parent.
- **SC-006**: Minutes are reported on Review, the session clock and Home's
  attended line, and nowhere else; the Picker's `Tend for fifteen minutes`
  remains the one approved duration outside them.
- **SC-007**: Every screen renders correctly at 390px and at 320px with no
  horizontal scrolling and every tappable control at least 44x44px.
- **SC-008**: An area removed leaves its tasks in the Inbox and its sessions
  in Review, matching what its confirmation stated.
- **SC-009**: From no areas at all, a person can create an area and reach a
  working Home.
- **SC-010**: No value displayed on any screen is stored as a display string
  — verified by code review against `lib/`, as FR-001's property is about how
  the code is written rather than what it renders.

## Assumptions

- **The screens and their copy do not change.** 001's `contracts/screens.md`
  remains the UI contract, including FR-013a's ordering rule and the
  addition-test removals from T048.
- **`default_session_minutes` stays at fifteen.** No screen offers a control
  for it, and the approved copy names fifteen minutes in the Picker's action.
- **Minutes are recorded but never budgeted.** `PRODUCT-SPEC.md` §3.1 as
  amended in 0.4 governs.
- **The device's local time is the only clock.** No timezone selection, no
  server time, no travel handling.
- **Subtasks remain out of scope.** `PRODUCT-SPEC.md` types them, no screen
  in 001 draws them, and nothing here introduces them.
- **Reminders remain out of scope.** The eight Round 2 artboards belong to a
  later feature.

## Out of scope

- Persistence of any kind. That is feature 003, and it is also where a
  session orphaned by a closed tab gets decided (`PRODUCT-SPEC.md` §7).
- Subtasks, recurring tasks, tags, filters, notifications, statistics,
  charts, multi-user, sharing, sync, calendar integration — Constitution
  Article III's v1 exclusions.
- Any new screen, and any new element on an existing screen.

## Questions for /speckit-clarify

Three items are genuinely open, and each would change what gets built. They
are recorded here rather than assumed, and `/speckit-clarify` should settle
them before planning.

- **Q1 — Where does the app start?** [NEEDS CLARIFICATION: does feature 002
  begin from genuinely empty state, so the first thing anyone sees is First
  run, or does it begin seeded with 001's example areas and tasks so the
  computed screens have something to compute from?]

- **Q2 — What does "lives for the browser session" mean at a reload?**
  [NEEDS CLARIFICATION: is state held in memory only, so a reload returns to
  the starting state as it did in 001, or does it survive a reload within
  the same tab? 001 asserts that no storage API is touched at all, and that
  assertion either carries into 002 or is replaced.]

- **Q3 — Who writes the copy the empty states need?** [NEEDS CLARIFICATION:
  computed screens reach states 001's fixtures never produced — an area with
  no week-list tasks, a week with no sessions, an empty Inbox, a single area
  where the copy says five. None of these has approved copy. Is writing
  those strings in scope for 002, and does the existing design need extending
  before they can be built?]

### Smaller items, also for /speckit-clarify

Not blocking the shape of the feature, but each affects whether SC-001 can
pass:

- **Number words.** The copy spells counts as words (`Three sessions`,
  `Six sessions`, `eleven past sessions`) and minutes as figures
  (`52 minutes`). The rule and its ceiling are not written down anywhere.
- **Relative days.** `Last attended Monday.` and `Captured last Thursday.`
  use different forms. When a day becomes `last X`, and what today and
  yesterday read as, is not specified.
- **When the week is closing.** Home shows the Review entry with
  `The week closes tonight.` 001 fixed it to Sunday. Whether it appears all
  of Sunday, from a time on Sunday, or across a wider window is not stated.
- **What makes an area attended today.** Whether a session must be closed to
  count, or merely started, is not stated — it matters for an area tended
  right now.
