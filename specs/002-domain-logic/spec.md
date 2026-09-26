# Feature Specification: Domain logic

**Feature Branch**: `002-domain-logic`

**Created**: 2026-09-23

**Status**: Ready to implement — all twenty-seven new strings approved
(§"Screen copy"), every decision settled, and nothing open. The last to
close were the five Week and Review decisions of 2026-09-26, recorded in
§"Clarifications" and §"Open"

**Input**: User description: "Feature 002: la lógica real detrás de las diez pantallas. Las mismas pantallas, los mismos textos, pero los valores se calculan en vez de estar escritos en el fixture, y el estado vive durante la sesión del navegador (sin persistencia todavía; eso es la 003)."

## What this feature is

The same ten screens, answering the same ten questions. What changes is
underneath: **every value a screen shows is derived from state, where
feature 001 stored the finished sentence.**

Feature 001 built `lib/fixtures.ts` so that `Week` could read
`Three tasks on the list. Two sessions attended.` as a literal string. That
was deliberate — it made "no business logic in components" impossible to
fail by accident, and it left this feature's job visible. This feature
replaces those literals with functions in `lib/`, and the components mostly
take the props they always took.

**Two things are genuinely new, and both are argued rather than assumed.**
Twenty-seven strings for states 001 never reached — empty lists, a week with
nothing in it, a session still running — and three elements that passed
Article III's addition test in writing: Week's route to last week, the
Picker's line naming what starting here closes, and the Tend an attended
area keeps. No sentence 001 approved is reworded, and no screen changes the
question it answers. One is retired rather than reworded — Review's line for
an unattended area, which was prose about one area and cannot be derived —
and 001's clarification Q3 is superseded: every area is on Week.

State lives for as long as the browser session. Nothing is written to disk;
persistence is feature 003.

### The test that defines "done"

**Given state equivalent to 001's fixtures, all ten screens must render the
same copy 001 rendered, character for character.** 001's approved strings
become this feature's regression anchor: if the derivation is right, the
sentences come back identical. If a single word differs, either the
derivation is wrong or a rule was never written down.

## Clarifications

### Session 2026-09-23

- Q: Does the app start empty or seeded with 001's example data? → A: Genuinely empty. First run is the first thing anyone sees; nothing is seeded and nothing is suggested (Article I). A separate development mode loads state equivalent to 001's, and is never the default.
- Q: What does "lives for the browser session" mean at a reload? → A: In memory only. A reload restarts. 002 writes to no storage API, so 001's `persistence.spec.ts` carries forward unchanged. Persistence is 003, done once and properly.
- Q: Who writes the copy the empty states need? → A: The product owner. This feature lists every state that needs a string and waits for the wording; no provisional copy is invented.
- Q: How are numbers written? → A: Words up to twelve, figures from thirteen. That is what lets `Three sessions` and `52 minutes` coexist.
- Q: How are past days named? → A: The day's name up to seven days back; beyond that, the date.
- Q: When does an area count as attended today? → A: As soon as a session starts, not when it closes. Leaving mid-session must not erase the day.
- Q: When does the week count as closing? → A: Home's Review entry appears on Sunday and on Monday — Sunday shows the week now closing, Monday the week that just closed. Review must not have a single door: Week gains a permanent way into the previous week's Review, because a finished week must stay lookable-at rather than vanishing at midnight.
- Q: Which areas become Capture's chips? → A: All of them, in the Areas order. No cap and no filtering by daily.
- Q: How does Home's absence note read with more than one non-daily area? → A: One sentence naming the absent areas, never a line per area. With none absent there is no sentence.

### Session 2026-09-23, after `/speckit-analyze`

- Q: Does a session that has started and not closed count as a session? → A: Yes, from the moment it starts. It counts as a session on Week and in Review's count, and it contributes no minutes until it is closed. Counting and measuring are two different questions and they close at two different moments.
- Q: What does Review say when a session is still open? → A: It names it. Minutes report the closed sessions, and one sentence says one is still open, so a figure that looks short is explained rather than wrong.
- Q: Does `Tending now` erase what was already attended today? → A: No. If the area already has minutes from a closed session today, the line keeps them and adds the tending clause. Only the first session of the day shows `Tending now` alone.
- Q: Does the First run route apply to the whole app or to Home? → A: To Home. Every other route renders its own empty state, which is what keeps `None right now` on Areas reachable — you are standing on Areas when you remove the last one.
- Q: What happens when a session is started while another is running? → A: The running one closes as `progressed` with an empty note, and nothing is blocked. The Picker says so before the action, in the pattern the removal confirmation set: state the consequence, then offer the button. At most one session is open at any moment, which is what makes `One still open.` true in the singular.

### Session 2026-09-25

- Q: An attended card loses its Tend button, so `Attended today, {n} minutes · tending now` can only be reached by a route Home no longer offers. Does an area attended today stay tendable from Home? → A: Yes. The attended card keeps a Tend, in the outline variant, as Money's does when it passes its rhythm. Nothing is blocked, and tending the same area twice in a day is valid.

### Session 2026-09-26, before Phase 4

Deriving Week and Review from state surfaced five places where 001's
fixtures had stored an answer no rule produces. Each was decided by the
product owner rather than resolved in code.

- Q: Are non-daily areas on Week and in Review? 001's clarification Q3 kept People off Week, and 002's contract says Week lists every area with a rhythm. → A: Every unarchived area, daily or not. A non-daily area keeps a weekly rhythm — Home's absence note says so — and Week is where rhythms are counted. This supersedes 001's Q3: with 001-equivalent state Week reads `Five areas, eleven sessions` and lists People.
- Q: An area whose closed sessions this week carry no note — 001 draws `One session, 15 minutes` on one line, and 002 approved `{n} minutes. No note this time.` for the same state. Which applies? → A: Both, by count. Exactly one closed session and no note keeps 001's one-line form, `One session, {n} minutes`. Two or more keep the sessions label and take 002's line.
- Q: What line does an unattended area carry in Review? 001's `No sessions this week. The pages are where you left them.` is prose about Morning pages and cannot be derived. → A: None. The row is the area's name, faded. The closing note beneath the section is what explains absence, and a line per row would say the same thing once per area.
- Q: Which week does `/review` show with no parameter on Tuesday to Saturday, or when Areas returns to it? → A: The week that last closed. On Sunday the week that is closing; on every other day the one before. `?week=last` always means the week before the current one.
- Q: How does a Week row say an area has no sessions yet this week? The ordinary template produced `Zero sessions attended.`, an unapproved string and a zero phrased as a number. → A: `No sessions attended.`, in the pattern of the approved `No tasks on the list.` It is the twenty-seventh string.

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
- **Numbers are words up to twelve and figures from thirteen.** This is
  what lets `Three sessions` and `52 minutes` both be correct.
- **A past day is named up to seven days back, and dated beyond that.**
- **An area counts as attended today as soon as a session starts**, not when
  it closes. Leaving mid-session must not erase the day.
- **An area attended today stays tendable from Home.** Its card keeps a Tend
  in the outline variant, the way a card past its rhythm does. Tending the
  same area twice in a day is valid, and nothing blocks it. This supersedes
  001's FR-014 on one point only: the attended treatment no longer loses its
  button, and with it goes the collapse and the fade.
- **The Review entry appears on Sunday and on Monday.** Sunday shows the
  week closing; Monday shows the week that just closed.
- **Week carries a permanent way into the previous week's Review.** A
  finished week must stay reachable rather than disappearing at midnight.
- **Capture's chips are all the areas, in the Areas order**, with no cap and
  no filtering by daily.
- **Home's absence note is one sentence naming the absent areas**, never a
  line each. With none absent there is no sentence.
- **A session counts from its start and measures from its close.** An
  open session is a session everywhere something is counted, and minutes
  are the total of the closed ones.
- **First run is Home's rule, not the app's.** Only `/` routes to First
  run when there are no unarchived areas. Every other screen keeps its own
  empty state.
- **At most one session is open at any moment.** Starting a session closes
  a running one as `progressed` with an empty note. Nothing is blocked and
  nothing is asked twice; the Picker states the consequence before the
  action. This is what makes the singular in `One still open.` a fact
  rather than an assumption.
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
6. **Given** a session running on one area, **When** the person opens
   another area's Picker, **Then** the screen states which task is still
   running and that starting here closes it, before the action and without
   blocking it (FR-015c).
7. **Given** that same state, **When** the person starts the session
   anyway, **Then** the first session is recorded as progressed with the
   minutes it ran and an empty note, the new one is running, and exactly
   one session is open (FR-015c, FR-015d).
8. **Given** a session running on an area, **When** the person opens that
   same area's Picker and picks another task, **Then** no consequence line
   is shown, the session stays open and only its task changes (FR-015).

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
- **A session is open while Review is read.** It counts in the week's
  sessions and adds no minutes. Review names it, so the figure is short for
  a stated reason rather than for an unstated one. There is never more than
  one to name (FR-015d).
- **A session is started while one is running elsewhere.** The running one
  closes as progressed with an empty note, and the Picker said so before the
  button. The minutes it ran are recorded, because they happened.
- **A session is running and Home would say nothing is waiting.** The
  all-attended note is not shown while a session is open. Something is
  waiting: the session you are in.
- **An area is tended again after being attended earlier today.** It is
  reached from the attended card's outline Tend (FR-015e). Home's line keeps
  the earlier minutes and adds the tending clause. The day is cumulative and
  a session in progress never subtracts from it.
- **The last area is removed.** Areas shows `None right now` and Home shows
  First run. Both are correct, and neither redirects the other.

## Requirements *(mandatory)*

### Functional Requirements

#### Derivation

- **FR-001**: Every value shown on every screen MUST be derived from state.
  No displayed sentence, count, label or treatment may be stored as a
  literal string, and no derivation may live in a component (Constitution
  Article VI).
- **FR-002**: Given state equivalent to 001's fixtures, every screen MUST
  render copy character-identical to what 001 rendered.
- **FR-003**: Quantities and dates MUST be written the way the approved copy
  writes them. The two rules that say how are **FR-029** (words to twelve,
  figures from thirteen) and **FR-030** (day names to seven days back, dates
  beyond); this requirement is the obligation, and those are its terms.
- **FR-004**: The system MUST NOT show a percentage, a streak, a badge, a
  level, a scoreboard or any completion proportion, on any screen or as the
  size of any element.

#### The week

- **FR-005**: The week MUST run Monday 00:00 to Sunday 23:59 in the device's
  local time, as one boundary for the whole system.
- **FR-006**: A session MUST count toward the week containing its start,
  regardless of when or how it ends.
- **FR-006a**: A session that has started and not closed MUST count as a
  session wherever sessions are counted, and MUST contribute no minutes
  until it closes. `actualMinutes` is the figure minutes are summed from
  (FR-010a), and it does not exist until the session ends. Counting and
  measuring answer different questions and close at different moments.
- **FR-007**: Week MUST count in sessions and MUST NOT show minutes.
- **FR-007a**: Week MUST list every unarchived area, daily or not
  (supersedes 001's clarification Q3). A row with no sessions this week
  MUST say `No sessions attended.` rather than write a zero.
- **FR-008**: Review MUST present the week that is closing or has closed,
  with Attended before Unattended, and MUST show minutes as plain figures.
- **FR-008b**: Review MUST list every unarchived area, attended or not, and
  every archived area with a session that week. An unattended row carries
  the area's name and no line. An area with exactly one closed session and
  no note reads `One session, {n} minutes` on one line; with two or more
  and no note it takes the sessions label and `{n} minutes. No note this
  time.` The last note is the most recent non-empty note that week.
- **FR-008a**: When the week being reviewed contains a session that has not
  closed, Review MUST say so on that area's row. The minute figure reports
  the closed sessions, and the sentence naming the open one is what keeps a
  short figure from reading as a wrong one. An area whose only session this
  week is the open one MUST NOT render a minute figure of zero.
- **FR-009**: An area with more sessions than its rhythm MUST be presented
  as having extra sessions. An area with fewer MUST be presented as a fact
  about the week and never about the person.

#### The session

- **FR-010**: A session MUST record when it started, when it ended, the
  minutes actually elapsed, its outcome and its progress note.
- **FR-010a**: The recorded minutes MUST be written exactly once, when the
  session is closed, and MUST NOT be recalculated afterwards. The live clock
  remains derived from the start time and the current moment; the record and
  the view answer different questions and MUST NOT be conflated. A session
  with no end time is out of scope here and is decided in feature 003.
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
- **FR-015a**: An area MUST count as attended today from the moment a
  session on it starts, not from when it closes. Leaving a session without
  closing it MUST NOT remove the area's attended state for that day.

- **FR-015c**: Starting a session while one is running on a task in
  **another area** MUST close the running session as `progressed` with an
  empty note. It MUST NOT block, interrupt, or ask for a confirmation step
  (FR-012), and the Picker MUST state the consequence before its primary
  action. Starting one in the area the session is already running in MUST
  switch the task and leave the session open, which is FR-015 and not this.
- **FR-015d**: At most one session MUST be open at any moment. FR-015c is
  what enforces it, and FR-008a's singular wording depends on it.
- **FR-015b**: While a session is running, Home's line for that area MUST
  keep the minutes already attended today and add the tending clause. Only
  when the running session is the area's first of the day does the line read
  `Tending now` alone. A session in progress adds to the day; it does not
  replace it.
- **FR-015e**: An area attended today MUST keep a Tend action on Home, in
  the outline variant, leading to its Picker exactly as any other card's
  does. Its line stays `Attended today, {n} minutes`, it still sorts below
  the areas still to be tended (001's FR-013a), and nothing about it may
  read as disabled. This is what makes FR-015b reachable by tapping: without
  it, the second session of the day could only be started from a route Home
  does not offer.

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
  others in a single sentence naming them. With no non-daily area there is
  no sentence.
- **FR-022a**: Capture MUST offer every area as a chip, in the order set on
  Areas, with no cap and no filtering by whether the area is daily.
- **FR-022b**: When two or more areas are non-daily, Home's absence note
  MUST name them in one sentence, joined as `A and B` for two and
  `A, B and C` for three or more, in the Areas order.

#### Navigation

- **FR-019a**: Home MUST show the Review entry on Sunday and on Monday, and
  on no other day. On Sunday it MUST open the week that is closing; on
  Monday, the week that has just closed.
- **FR-019b**: Week MUST carry a permanent way into the previous week's
  Review, available on every day of the week. A finished week MUST remain
  reachable rather than ceasing to be at midnight.
- **FR-019c**: Review MUST remain reachable on every day of the week by at
  least one route, and MUST state which week it is showing.
- **FR-019d**: With no parameter, Review MUST show the week closing on
  Sunday and the week that last closed on every other day. `?week=last`
  MUST show the week before the current one on every day. Returning from
  Areas therefore lands on the same week wherever Review was opened from,
  except when Week's link is followed on a Sunday.

#### State

- **FR-023**: State MUST live in memory for the browser session only. The
  system MUST NOT write to `localStorage`, `sessionStorage`, IndexedDB or
  cookies. A reload returns to the starting state, so 001's
  `tests/e2e/persistence.spec.ts` carries forward unchanged. Persistence is
  feature 003.
- **FR-024**: The system MUST NOT lose a running session while the person
  moves between screens.
- **FR-025**: The app MUST start empty. With no areas, First run is what a
  person sees, and nothing is seeded or suggested (Article I).
- **FR-025a**: The route to First run MUST live on `/` alone. No other
  route may redirect to it, because every other screen has an approved empty
  state of its own and `None right now` on Areas is reached by removing the
  last area while standing on Areas.
- **FR-026**: A development mode MUST be able to load state equivalent to
  001's fixtures, and MUST NOT be what the app does by default. It is what
  makes SC-001 runnable.

#### Copy

- **FR-027**: All copy MUST remain as approved in 001 §"Screen copy". Any
  string this feature needs that 001 does not have is new approved copy and
  MUST be written down before it is built. No provisional wording may be
  invented to unblock work.
- **FR-028**: No screen may use a word from the forbidden lexicon
  (Constitution Article II), an emoji, an exclamation mark or an apology.
- **FR-029**: Quantities MUST be written as words up to twelve and as
  figures from thirteen.
- **FR-030**: A past day MUST be named by its day name up to seven days
  back, and by its date beyond that.

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
- **SC-003**: The three moments of a session — before zero, at zero, and
  well past it — are identical in layout, colour and controls, differing
  only in the clock string and the line beneath it. The clock reaches 0:00
  and continues upward, and nothing else on the screen changes.

  This is 001's SC-007 carried forward. It is numbered SC-003 here because
  SC-007 in this feature is the dimensional criterion. 001 verified it by
  rendering three fixtures through `?state=`; this feature has one real
  clock, so it is verified by moving `now` instead.
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

- **001's approved copy is not rewritten, and its screens keep their
  shape.** Every sentence 001 approved says the same words here; what this
  feature adds, it adds — twenty-seven new strings for states 001 never
  reached, and three elements that passed the addition test in writing.
  Nothing approved is reworded and no screen changes the question it
  answers. Three 001 rules are superseded rather than inherited: FR-014's
  attended treatment no longer loses its Tend button (FR-015e); clarification
  Q3's Week without People gives way to every area on Week (FR-007a); and
  Review's per-area unattended line is retired, since no rule produces it
  (FR-008b). 001's
  `contracts/screens.md` remains the UI contract otherwise, including
  **001's FR-013a** ordering rule — what is still to be tended sorts above
  what was attended today — and the addition-test removals from 001's T048. Requirement ids are per feature:
  `FR-013a` belongs to 001's numbering and this feature's own `FR-013` is
  about closing a session as done. Where a task cites an inherited rule it
  names the feature it comes from.
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
- Any new screen.
- Any element that has not passed Article III's addition test **in
  writing**. Three have, and each is argued in its own section rather than
  exempted: Week's `Look back on last week`, the Picker's line naming what
  starting here closes, and the Tend an attended area keeps on Home. An
  element arrives by being argued, not by
  being useful, and "it might help" remains a rejection.

  This bullet used to read "and any new element on an existing screen",
  which the feature contradicted twice while claiming to be bound by it. A
  rule the work does not follow is worse than no rule: it teaches the reader
  that the list is decoration. The bar has not moved — it is the addition
  test, which is what Article III actually requires — and it is now stated
  as the bar the feature is really held to.

## Screen copy — the strings 002 adds

Approved 2026-09-23. These are the only new user-facing strings in this
feature; every other word on every screen stays exactly as 001 approved it.
Strings are reproduced verbatim, and where a value is interpolated the
braces mark it.

**Twenty-seven strings, all approved.** The list closed at twenty-one before
`/speckit-analyze`. Four were added after it and approved on 2026-09-23: one
on Home and three on Review, all of them consequences of the decision that a
session counts from its start and measures from its close (FR-006a). The
twenty-sixth is the Picker's consequence line, added with the
concurrent-session decision and approved on 2026-09-24 with its four rules:
the title verbatim, only when the session runs in another area, nothing when
it runs in this one, and inside the sticky bar above the action. The
twenty-seventh is Week's `No sessions attended.`, approved on 2026-09-26
when putting every area on Week made a row with no sessions ordinary.

### Areas

| Condition | Role | String |
|---|---|---|
| No areas remain | Heading | `None right now` |
| No areas remain | Note under the heading | `You removed the last one. Name another whenever you want.` |
| Exactly one area | Heading | `One area` |
| Exactly one area | Footer note | `Tap the area to change its name, color or rhythm.` |
| Removing an area with no tasks | Confirmation | `Removing {area} keeps its {n} past sessions in Review.` |
| Removing an area with no past sessions | Confirmation | `Removing {area} moves its {n} tasks to the inbox, carrying the name.` |
| Removing an area with neither | Confirmation | `Removing {area} removes the name. Nothing else is in it.` |

With one area the footer cannot say `Drag to reorder.` — there is nothing to
reorder against — so the whole footer note is replaced rather than trimmed.

### Home

| Condition | Role | String |
|---|---|---|
| Areas exist, none daily | Note in place of the cards | `No area waits for you here. You set each one to appear when you add it, so Home fills as you do.` |
| Every daily area attended today, and no session is open | Note | `Every daily area was attended today. Nothing is waiting.` |
| Every area is daily | — | No sentence. There is nothing to explain |
| Two or more non-daily areas | Absence note | `{names} keep a weekly rhythm. They are not daily areas, so they do not wait for you here.` |
| A session is running, and it is the area's first today | Replaces the attended line | `Tending now` |
| A session is running, and the area was already attended today | The attended line | `Attended today, {n} minutes · tending now` |
| It is Monday | Review entry | `Last week closed. Look back on it.` |

**Joining names**: `A and B` for two, `A, B and C` for three or more, in the
Areas order. The one-area form stays the 001 string, which is singular
throughout.

**The all-attended note is not shown while a session is open.** An area
counts as attended from the moment its session starts (FR-015a), so the
condition can be met while someone is still tending — and
`Nothing is waiting.` beside a card reading `Tending now` would be a
sentence the screen contradicts one line below. The note returns when the
session closes, which is when it becomes true.

The line reports the day, and a session in progress is part of the day
rather than a replacement for it (FR-015b). An area tended for the first
time today has no figure yet and reads `Tending now` alone. An area tended
again keeps the minutes it already earned and adds the clause, because
erasing a closed session's figure to describe an open one loses a fact to
report a fact.

The minutes in the line are always closed minutes. The running session
joins them when it closes, which is the same rule Review follows and the
reason both screens can be read mid-session without either of them lying.

**The attended card's Tend adds no string** (FR-015e). The button says
`Tend`, 001's approved label, and the line above it stays
`Attended today, {n} minutes`. The outline variant is the whole of the
difference from a card still to be tended, as it already is for a card past
its rhythm. Nothing says "again": the line already states the day, and a
second word for the same action would imply the first one was special.

The all-attended note is unchanged. `Nothing is waiting.` stays true when every
card carries an outline button: an area that can be tended again is available, not
waiting.

### Picker

| Condition | Role | String |
|---|---|---|
| No tasks on the week list | Heading | `Nothing on the list` |
| No tasks on the week list | Note | `Capture something for {area}, or give an inbox item this area.` |
| Every task closed as done | Heading | `Nothing on the list` |
| Every task closed as done | Note | `You closed everything on the {area} list. Put something new on it when there is something.` |
| A session is running on a task in another area | Consequence, inside the sticky bar above the action | `A session on {task} is still running. Starting here closes it.` |

The heading is the same either way; only the note distinguishes never
having started from having finished.

**`{task}` is the running task's title, verbatim.** No truncation, no
quotation marks, no ellipsis: a title is what the person wrote when they
captured it, and `Look up the bike shop that does tune-ups` wraps to two
lines rather than becoming `Look up the bike shop…`. Shortening it to fit
would name the task badly at exactly the moment naming it is the point.
The area the session runs in is not named — what is about to close is a
session on a task, and the task is what identifies it.

**The line sits inside the sticky bar, directly above the action.** It is
the consequence of that button and it belongs beside it, in the pattern the
design system already has for a message inside the sticky bar (§4).
Putting it in the page flow would leave it above the fold while the button
sits at the thumb, which is the one arrangement that lets someone act
without reading it — which is the design system's own stated reason for the
pattern.

**No design system amendment is required.** §4 names error messages, but it
states a rule about position rather than about severity, and the bar already
carries non-error prose: the Picker's own
`You can switch to another task inside the session.` has been inside it
since 001. No token, no spacing value and no type value is new here.

That makes a **fourth footer shape** — a line, the action, the existing note
— and it is the tallest of the four. `components/sticky-footer.tsx`
publishes its measured height and the nine screens reserve it, but the
pre-hydration fallback is a constant documented as "the tallest footer",
and it would now be short. It is recalculated in T025b, at 320px, where the
line wraps to three lines.

**The line does not appear when the session is running in this same area.**
Picking another task there switches the task inside the open session and
closes nothing (FR-015), which is what the 001 footer note
`You can switch to another task inside the session.` already says. A
consequence line where there is no consequence would fail Article III's
addition test, and it would teach the person to distrust the line in the
case where it is true.

### Inbox

| Condition | Role | String |
|---|---|---|
| Nothing unsorted | Heading | `Nothing unsorted` |
| Nothing unsorted | Note under the heading | `Everything you captured has an area.` |

The 001 footer, `An item stays here until it has an area. Nothing here
expires.`, is unchanged and still shown.

### Week

| Condition | Role | String |
|---|---|---|
| No area has tasks on its list | Note | `No tasks on any list. The rhythms are set; tasks are what fill them.` |
| An area has a rhythm and no tasks | Row line | `No tasks on the list. {sessions} sessions attended.` |
| An area has no sessions this week | Second sentence of the row line | `No sessions attended.` |
| Always | Link to last week's Review | `Look back on last week` |

The row line's second sentence follows the ordinary rule; only the first is
replaced. With no sessions it is replaced too, never written as a zero
(approved 2026-09-26): `One task on the list. No sessions attended.` and
`No tasks on the list. No sessions attended.`

`Look back on last week` is a **tertiary text link beneath `Change the
rhythm`**, not a button. It is present on every day.

### Review

| Condition | Role | String |
|---|---|---|
| The week has no sessions | Heading | `No sessions` |
| The week has no sessions | Note under the heading | `Nothing was attended this week.` |
| Every area was attended | In place of the empty Unattended section | `Every area was attended this week.` |
| An area attended with no note on any session | Row line | `{n} minutes. No note this time.` |
| An area with closed sessions and one still open, with a note | Row line | `{n} minutes. One still open. Last note: {note}` |
| An area with closed sessions and one still open, with no note | Row line | `{n} minutes. One still open. No note this time.` |
| An area whose only session this week is the open one | Row line | `One still open. Minutes are recorded when it closes.` |

When every area was attended, the closing note `Unattended is a fact about
the week, not about you. Next week starts with the same areas.` is **not
shown**. There is nothing to explain.

The open session is named rather than hidden or silently counted. The
week's heading counts it, because it is a session (FR-006a); the minute
figure does not include it, because it has none yet. Without the sentence
the two would look inconsistent, and the reader would have no way to tell a
short figure from a wrong one. An area whose only session this week is the
open one has no figure at all, and says why instead of rendering a zero.

The row's sessions label counts the open session throughout, so an area
with two closed sessions and one open reads `Three sessions`.

**Which row form applies** (FR-008b, decided 2026-09-26). An area with
exactly one closed session and no note keeps 001's one-line form,
`One session, {n} minutes`. With two or more closed sessions and no note it
takes the sessions label and `{n} minutes. No note this time.` Any note
takes the `Last note:` line, and the note is the most recent non-empty one
that week. An **unattended row has no line** — the name, faded, and the
closing note beneath the section. 001's
`No sessions this week. The pages are where you left them.` was prose about
one area and is not carried forward.

**No label over nothing** (approved 2026-09-26). When every area was
attended, `Every area was attended this week.` takes the place of the whole
Unattended section, label included, and the closing note goes with it. When
the week has no sessions, the Attended section is not drawn. A section
label above no rows is worse than no section.

### A task's last session

| Condition | String |
|---|---|
| The last session was closed with an empty note | `Attended. No note left.` |

`Not attended yet.` is reserved for a task that has never been tended. A
task attended without a note is a different thing and says so.

## Why the Picker states what starting here closes

The consequence line adds an element to the Picker, so Article III's
addition test applies to it as it did to Week's link. It passes, and it is
recorded here as passing rather than as an exception.

The Picker's question is *what do I focus on for fifteen minutes?* Starting
a session here ends one that is running somewhere else, and the minutes it
ran are recorded as they stand. Without the line the screen answers its
question by quietly discarding something the person chose earlier, and they
find out afterwards on Review. Remove the line and the screen still renders,
but it takes an action whose cost it declined to show.

It is a statement, not a gate. Nothing is blocked, nothing is confirmed
twice, and the primary action keeps its approved words and its place
(FR-012, FR-015c). That is the difference between this and a dialog: the
removal confirmation offers two buttons because removing an area is
destructive and reversible only by retyping it, while starting a session is
ordinary and its consequence is a session recorded rather than lost.

## Why an attended area keeps its Tend

001 took the button away from an attended card, and 002 gives it back, so
Article III's addition test applies to it as it did to the other two. It
passes, and it is recorded here as passing rather than as an exception.

Home's question is *what am I tending right now?* Someone who sat down for
fifteen minutes this morning and wants fifteen more tonight is answering
that question, and the answer is an area Home already shows. Without the
button the screen shows the area and withholds the one action that area
exists for. Home stops being actionable in one tap for exactly the person
who is tending most (Article III), and the approved
`Attended today, {n} minutes · tending now` becomes a string no tap can
reach.

Leaving it off also blocks, without saying so. Article I lets a budget warn
but never block, and a card past its rhythm keeps its Tend for that reason.
A card that is attended today has done less than one past its rhythm, so
removing its button is a stricter rule for a smaller cause.

The outline variant keeps 001's ordering meaningful. What is still to be
tended keeps the solid button and sits above; what was attended today sinks
below with the quieter one (001's FR-013a). The day still reads as
attended, and it stays open.

**What this costs.** The attended card no longer collapses to one line, and
it is no longer faded. `opacity-55` is the design system's treatment for a
finished, inactive thing (§6). An area that can be tended again is not
inactive, and a faded button reads as disabled, which is the one thing
FR-015e forbids. The card takes the past-rhythm card's shape. Its line and
its position are what say it was attended.

## Why Week carries a route to last week

`Look back on last week` adds an element to Week, so Article III's addition
test applies to it. It passes, and it is recorded here as passing rather
than as an exception.

Week's question is *what am I committing to?* Setting this week's rhythm
without being able to see the last one is deciding blind. The link is not
history parked on a planning screen; it is the evidence the decision needs.
Remove it and the screen still renders, but the question it exists to answer
gets a worse answer.

## Open

Nothing. Every decision is taken and all twenty-seven strings are approved.

The last to close were the five Week and Review decisions of 2026-09-26
(§"Clarifications"): every area on Week and in Review, superseding 001's
Q3; the one-session row keeping 001's form; no line on an unattended row;
the week `/review` shows by default; and `No sessions attended.`

**What they cost SC-001 on Review.** 001's fixtures disagree with
themselves, and `lib/seed/fixture-001.ts` follows Home and Week where they
do. Derived from that state, Review reads `Seven sessions` where 001 read
`Six sessions`, lists Morning pages as attended with one session, Money with
three, Health's and Money's last notes as the seed's, and People under
Unattended. The minute figures, 52 and 31, still match. SC-001 holds on
Review for the strings the decisions kept and cannot hold for the rest;
T058 asserts it that way and names each exception.

Before them, FR-015e closed on 2026-09-25, approved on 2026-09-25: an attended area
keeps an outline Tend, the card takes the past-rhythm card's full shape with
no collapse and no fade, and no string is added. 001's
`contracts/screens.md` records it as superseding part of 001's FR-014.
001's `home-picker-session.spec.ts` asserts the attended card has no Tend;
T059 changes that assertion because the requirement changed, and it is not
deleted to make a test pass.

Before it, the Picker's consequence line closed on 2026-09-24 with the four
rules recorded in §"Screen copy". With it, the
concurrent-session question is fully answered: FR-015c and FR-015d make the
transition, and the line makes it visible before it happens. That is what
lets `One still open.` on Review be singular by construction rather than by
hope.

Three analyze passes are recorded in the git history rather than here. The
one pattern worth carrying forward is in `CLAUDE.md`: framing sentences get
written before the decisions and nobody returns to them.
