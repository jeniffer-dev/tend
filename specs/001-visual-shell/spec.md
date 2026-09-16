# Feature Specification: Visual shell

**Feature Branch**: `001-visual-shell`

**Created**: 2026-09-09

**Status**: Ready for planning — no open items

**Input**: User description: "Feature 001 — Visual shell. Todas las pantallas de Tend navegables con fixtures hardcodeados. Cero persistencia, cero lógica, cero cálculos. El diseño ya está resuelto y aprobado en docs/design/; esta feature lo construye tal cual. Diez pantallas (First run, Areas, Area edit, Home, Picker, Session, Capture, Inbox, Week, Review), cada una con su única pregunta. Presupuesto semanal contado en SESIONES, no minutos; minutos solo en Review. Copy verbatim desde docs/design/Tend.dc.html. Criterios de aceptación observables y visuales a 390px y 320px."

## What this feature is

Every Tend screen, navigable, built from the approved design in
`docs/design/Tend.dc.html`. Fixture data is hardcoded. Nothing is
calculated, nothing is stored, nothing persists across a reload.

This is the slice that answers one question: **does it feel calm?** That
question is answered by looking at it on a phone, which is why every
acceptance criterion below is something a person can see at 390px and at
320px, and why none of them describes a calculation or a state change that
survives a reload.

### The one question per screen

Per Constitution Article III, each screen's question is stated here before
any component is designed. Anything that does not serve the question is cut.

| # | Screen | Its one question |
|---|---|---|
| 1 | First run | Where do I start? |
| 2 | Areas | What am I paying attention to? |
| 3 | Area edit | What is this area, and how often? |
| 4 | Home | What am I tending right now? |
| 5 | Picker | What do I focus on for fifteen minutes? |
| 6 | Session | What am I doing for these fifteen minutes? |
| 7 | Capture | What did I just remember? |
| 8 | Inbox | What have I not sorted yet? |
| 9 | Week | What am I committing to? |
| 10 | Review | What did I attend, and what went unattended? |

### The rhythm is counted in sessions

A week's commitment for an area is **a number of sessions**, not a number
of minutes. Minutes are recorded, and minutes appear in exactly one place:
Review, as a fact about what happened. No other screen shows a minute
count except the session clock itself and the collapsed "Attended today"
line on Home.

This is a change from `docs/PRODUCT-SPEC.md`, which types the budget as
`weekly_budget_minutes`. See Assumptions.

## Clarifications

### Session 2026-09-09

- Q: When someone is on a screen that is not Home, how do they get back — and how do they reach Areas in the first place? → A: Areas is reached through the two rhythm links already drawn (`Change the rhythm` on Week, `Set this week's rhythm` on Review). Home's bottom navigation stays as approved. Every non-Home screen returns to the screen that opened it; Home is the root and has no back control.
- Q: Is Areas reachable from First run, when Week and Review have nothing to show? → A: No — the edge was missing. Resolved: First run's `Name your first area` opens Area edit with an empty name, and leaving it lands on Areas. Areas reached this way is a root and shows no back control, because First run is a state that no longer exists once an area is named.
- Q: What does Area edit look like when creating an area rather than editing one? → A: The design draws only the editing state. The empty state reuses the same screen with the name field empty, and takes the defaults the design's own prototype carries: rhythm 3, On Home `Every day`, and the fifth palette color preselected.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sit down and tend something (Priority: P1)

Someone opens Tend on their phone in the morning. Home shows the areas
they set for today. One tap on an area's Tend button takes them to a short
list of that area's tasks for the week, with the first already chosen. One
more tap starts the session, and the screen shows the clock, the task, and
a place to write where they got to.

**Why this priority**: This is the product. Constitution Article I — the
unit of success is the completed session — and Article III — Home is
actionable in one tap from cold start. If only this journey exists, Tend is
still Tend. Every other screen supports it.

**Independent Test**: Open Home at 390px, tap Tend on any area, tap through
the picker into the session, and read the three session states. Delivers
the whole "sit down for fifteen minutes" ritual with nothing else built.

**Acceptance Scenarios**:

1. **Given** Home is open at 390px, **When** the person looks at it without
   scrolling, **Then** the day's areas and their Tend buttons are visible
   above the fold, and no inbox list, week list or history is on the screen.
2. **Given** Home is open, **When** the person taps Tend on Health,
   **Then** the Picker appears showing only Health's week-list tasks, with
   the first task already selected.
3. **Given** the Picker is open, **When** the person taps "Tend for fifteen
   minutes", **Then** the Session screen appears with the selected task as
   its heading.
4. **Given** the Session screen is open, **When** the person reads it,
   **Then** the clock, the task, the area, the note field and both closing
   actions are all present, and no spinner appears anywhere.
5. **Given** the Session screen is open, **When** the person taps "Tend
   something else in Health", **Then** they return to the Picker for the
   same area without leaving the session.

---

### User Story 2 - Declare and reorder the areas (Priority: P2)

Someone decides what they are paying attention to. They see their areas in
their own order, drag one to a new position, open one to change its name,
color and rhythm, and remove one — being told first what happens to its
tasks and its history.

**Why this priority**: Areas are the spine of the product; Home renders in
this order. It ranks below the session because a person with no areas sees
First run, and a person with areas can already tend them.

**Independent Test**: Open Areas at 390px, reorder the list, open one area
into its edit screen, change every control, and trigger the removal
confirmation. Delivers area management without any session existing.

**Acceptance Scenarios**:

1. **Given** the Areas screen, **When** the person looks at the list,
   **Then** five areas appear in the fixture order, each showing its color,
   its name, its rhythm and whether it appears on Home daily.
2. **Given** the Areas screen, **When** the person drags an area to a new
   position, **Then** the list shows it in the new position.
3. **Given** the Areas screen, **When** the person triggers removal of an
   area, **Then** the confirmation states what happens to that area's tasks
   and to its past sessions before any destructive action is offered.
4. **Given** the Area edit screen, **When** the person taps a color, a
   rhythm number, or an On Home option, **Then** the tapped control shows
   as selected and the others do not.
5. **Given** the Area edit screen at 390px, **When** the person reads the
   rhythm control, **Then** the numbers 1 through 5 are each at least
   44x44px and all five fit on one row without horizontal scrolling.

---

### User Story 3 - Capture now, sort later (Priority: P3)

Something surfaces mid-day. The person opens Capture, types one line,
optionally taps an area, and it is gone from their head. Later, the Inbox
shows what has not been given an area yet.

**Why this priority**: Capture protects the session from becoming a sorting
exercise. It ranks third because the ritual works without it, but the
product's promise — a list that reflects your life rather than growing
forever — needs the unsorted pile to be visible and unhurried.

**Independent Test**: Open Capture at 390px, type into the single field,
toggle an area chip on and off, and open the Inbox to see three unsorted
items. Delivers the capture-and-sort loop independently.

**Acceptance Scenarios**:

1. **Given** the Capture screen, **When** the person looks at it, **Then**
   exactly one text field is present and no area is preselected.
2. **Given** the Capture screen, **When** the person taps an area chip,
   **Then** that chip shows as selected; tapping it again clears it.
3. **Given** the Inbox screen, **When** the person looks at it, **Then**
   three unsorted items appear, each with when it was captured and a way to
   give it an area, and none of them shows a date framed as due or late.

---

### User Story 4 - Look at the week and look back (Priority: P4)

At the end of the week, Home offers a way into Review. The Week screen
shows what the person committed to; Review shows what they attended and
what went unattended, in that order.

**Why this priority**: Reflection is Article I's payoff, but it is the
least frequent journey — once a week against the session's daily rhythm.

**Independent Test**: Open Week and Review at 390px and read both. Delivers
the reflection ritual with no other screen involved.

**Acceptance Scenarios**:

1. **Given** Home on the last day of the week, **When** the person looks at
   the top of the screen, **Then** the entry into Review is there, above the
   areas, presented as a line they can tap and not as a notification or badge.
2. **Given** the Week screen, **When** the person reads an area's row,
   **Then** it shows the sessions committed and the sessions attended, with
   no percentage, no bar framed as a target and no minute count.
3. **Given** the Review screen, **When** the person reads it, **Then**
   Attended and Unattended appear as two labelled sections, Attended first.
4. **Given** the Review screen, **When** the person reads an attended area,
   **Then** minutes appear there as a plain figure, and this is the only
   screen other than the session clock where minutes appear.
5. **Given** the Review screen, **When** the person reads the unattended
   area, **Then** it is described as unattended and no word from the
   forbidden lexicon (overdue, missed, failed, behind) appears anywhere.

---

### User Story 5 - Arrive with nothing (Priority: P5)

Someone opens Tend for the first time. There are no areas and no tasks.
The screen invites them to name their first area and tells them nothing was
set up for them.

**Why this priority**: It is seen once per person and never again. It ranks
last by frequency, not by importance — it is the only screen that sets the
expectation that Tend brings no opinions of its own.

**Independent Test**: Open First run at 390px and read it. It is a static
screen; it is testable entirely on its own.

**Acceptance Scenarios**:

1. **Given** the First run screen, **When** the person reads it, **Then**
   the copy invites them to name an area and contains no apology, no
   exclamation mark and no emoji.
2. **Given** the First run screen, **When** the person looks for suggested
   or sample areas, **Then** none are offered, and the screen says so.
3. **Given** the First run screen, **When** the person taps `Name your first
   area`, **Then** Area edit opens with an empty name field, rhythm 3 and
   On Home set to `Every day`.
4. **Given** Area edit was opened from First run, **When** the person leaves
   it, **Then** they land on Areas, and Areas shows no back control.

---

### Edge Cases

- **The clock passes zero.** At 0:00 and beyond, the session keeps
  recording and the count continues upward with a `+` prefix. Nothing turns
  red, nothing pulses, nothing counts down toward an alarm, and no action is
  taken away. The past-zero state is styled exactly as the running state.
- **An area is past its rhythm.** Its Tend button changes from solid to
  outline and the copy says so plainly. It stays tappable. Nothing is
  blocked and no red appears.
- **An area was already attended today.** It collapses to a single line and
  loses its Tend button.
- **An area is not a daily area.** It does not appear on Home, and Home
  explains its absence rather than hiding it silently.
- **A task has no note from last time.** The Picker still shows the last
  session row, saying it has not been attended yet rather than showing an
  empty space.
- **The narrowest phone (320px).** Every screen remains readable and every
  control remains at least 44x44px. Nothing scrolls horizontally, no text is
  clipped, and no control overlaps another.
- **Long area or task names.** Text wraps rather than truncating into an
  ellipsis, and the row grows to fit.
- **A reload mid-flow.** Everything returns to the fixture state. This is
  expected and is not an error; no screen claims anything was saved.
- **The very first area.** From First run there is no Week and no Review to
  pass through, so `Name your first area` opens the empty Area edit
  directly and lands on Areas afterwards. Areas shows no back control in
  this case — there is nowhere behind it to go.
- **Areas opened from two different places.** Reached from Week or Review it
  returns there; reached from First run it is a root. The screen is the
  same either way; only the back control differs.

## Requirements *(mandatory)*

### Functional Requirements

#### Scope and behaviour

- **FR-001**: The system MUST present all ten screens, each reachable from
  another screen by tapping, with no dead ends.
- **FR-002**: The system MUST derive every displayed value from a hardcoded
  fixture. No screen may compute a duration, a total, a percentage or a
  remaining count at render time.
- **FR-003**: The system MUST NOT persist anything. A reload returns every
  screen to its fixture state.
- **FR-004**: The session clock MUST be a static display of the fixture's
  value for the state being shown. It MUST NOT tick.
- **FR-005**: The system MUST NOT show any streak, badge, level, or
  completion percentage, on any screen.
- **FR-006**: The system MUST NOT use red, pulsing, or countdown urgency for
  elapsed time or for an exceeded rhythm.
- **FR-007**: Every tappable control MUST be at least 44x44px at both 390px
  and 320px viewport widths.
- **FR-008**: No screen may scroll horizontally at 320px.

#### Per-screen structure

- **FR-009**: **First run** MUST show the invitation, the color dots, one
  primary action, and the line stating that nothing is set up in advance.
  It MUST NOT list or suggest any area.
- **FR-010**: **Areas** MUST list the five fixture areas in fixture order,
  each with its color, name, and a line stating its rhythm and whether it
  appears on Home daily. It MUST offer reordering by dragging, a way to
  create an area, and a way to open one for editing.
- **FR-011**: **Areas** MUST, before removing an area, state what happens to
  that area's tasks and what happens to its past sessions, and offer both
  removing and keeping it.
- **FR-012**: **Area edit** MUST offer a name field, a color choice from the
  palette, a sessions-a-week choice of 1 through 5, and a choice of whether
  the area appears on Home daily. Each control MUST show which option is
  selected.
- **FR-013**: **Home** MUST show the day's areas in the order set on the
  Areas screen and nothing else. The inbox, the week list and history are
  reachable only through the bottom navigation.
- **FR-014**: **Home** MUST render an area in one of three treatments: to be
  tended (solid Tend button), past its rhythm (outline Tend button plus the
  copy saying so), or already attended today (collapsed to one line, no
  button).
- **FR-015**: **Home** MUST explain the absence of a non-daily area rather
  than omitting it silently.
- **FR-016**: **Home** MUST show the entry into Review at the top of the
  screen when the week is ending, as a tappable line rather than a
  notification or a badge.
- **FR-017**: **Picker** MUST list only the selected area's week-list tasks,
  each with its last-session note, and MUST have the first task selected on
  arrival.
- **FR-018**: **Session** MUST show the area, the task, the clock, the note
  field, a way to switch to another task in the same area, and the two ways
  to close the session.
- **FR-019**: **Session** MUST be built in all three fixture states —
  running, at zero, and well past zero — with identical layout and identical
  visual treatment in each.
- **FR-020**: **Capture** MUST offer exactly one text field, with the area
  choice optional and nothing preselected, and MUST state where an item with
  no area goes.
- **FR-021**: **Inbox** MUST list the three unsorted fixture items, each
  with when it was captured and a way to give it an area, and MUST state
  that nothing there expires.
- **FR-022**: **Week** MUST list the areas with sessions committed and
  sessions attended. It MUST NOT show minutes.
- **FR-023**: **Review** MUST present Attended and Unattended as two
  labelled sections, Attended first, and MUST show minutes only here.
- **FR-024**: **Review** MUST describe an unattended area as a fact about
  the week and not about the person.

#### Navigation

- **FR-028**: Every screen other than Home MUST return to the screen that
  opened it. Home is the root and MUST NOT show a back control.
- **FR-029**: Areas MUST be reachable from Week's `Change the rhythm` and
  from Review's `Set this week's rhythm`. Home's bottom navigation MUST
  remain `Capture · Inbox · Week` and MUST NOT gain an Areas entry.
- **FR-030**: Area edit MUST return to Areas. Areas MUST return to whichever
  screen opened it — Week, Review, or First run.
- **FR-031**: When Areas was reached from First run, it MUST show no back
  control and MUST behave as a root, because First run describes a state
  that no longer exists once an area has been named.
- **FR-032**: First run's `Name your first area` MUST open Area edit with an
  empty name field. Leaving that screen MUST land on Areas.
- **FR-033**: Areas' `New area` MUST open the same empty Area edit as
  FR-032.

#### Copy

- **FR-025**: Every user-facing string MUST match the approved copy in
  §"Screen copy" below, character for character. Copy is a requirement of
  this feature, not an implementation choice.
- **FR-026**: No screen may use a word from the forbidden lexicon
  (Constitution Article II): start task, timer, pomodoro, category, bucket,
  project, overdue, missed, failed, behind, streak.
- **FR-027**: No screen may contain an emoji, an exclamation mark, or an
  apology.

### Screen copy *(verbatim — transcribed from `docs/design/Tend.dc.html`)*

Strings are reproduced exactly, including em dashes (—) and middots (·).

#### 1. First run

| Role | String |
|---|---|
| Eyebrow | `Tend` |
| Heading | `This is where your areas will live.` |
| Body | `An area is a part of your life you come back to. Your health, your money, the hour you write in. It is never finished — you tend it.` |
| Body | `Name one. Two or three is a whole practice; you can add more whenever.` |
| Caption | `Each area carries a color you choose.` |
| Primary action | `Name your first area` |
| Footer note | `Nothing is set up in advance, and nothing is suggested for you.` |

#### 2. Areas

| Role | String |
|---|---|
| Eyebrow | `Your areas` |
| Heading | `Five, in your order` |
| Row 1 | `Morning pages` / `Three sessions a week · in Home daily` |
| Row 2 | `Health` / `Three sessions a week · in Home daily` |
| Row 3 | `Home` / `Two sessions a week · in Home daily` |
| Row 4 | `People` / `One session a week · not in Home daily` |
| Row 5 | `Money` / `Two sessions a week · in Home daily` |
| Removal explanation | `Removing Money keeps its five tasks. They move to the inbox carrying the name, and its eleven past sessions stay in Review.` |
| Removal action | `Remove the area` |
| Keep action | `Keep it` |
| Footer note | `Drag to reorder. Home shows them in this order. Tap an area to change its name, color or rhythm.` |
| Secondary action | `New area` |

#### 3. Area edit

| Role | String |
|---|---|
| Eyebrow | `Area` |
| Top action | `Back to areas` |
| Field label | `Name` |
| Field value (editing an area) | `Morning pages` |
| Field placeholder | `Morning pages` |
| Section label | `Color` |
| Section note | `The color marks the area wherever it appears. It carries no meaning of its own.` |
| Section label | `Sessions a week` |
| Options | `1` `2` `3` `4` `5` |
| Section note | `A rhythm, not a target. Three sessions is what you are aiming to come back for; sessions beyond it are extra, and a week under it is a fact about the week.` |
| Section label | `On Home` |
| Options | `Every day` / `When I add it` |
| Section note | `Either way it stays on the week list. This only decides whether it waits for you on Home.` |
| Footer note | `Changes apply as you make them.` |

**Editing vs. creating.** The design draws only the editing state: the name
field carries the value `Morning pages`, not just the placeholder. The
creating state is the same screen with the name field empty and the
placeholder showing. Its defaults are taken from the design's own
prototype rather than invented: rhythm **3**, On Home **`Every day`**, and
the fifth palette color preselected. All other copy is identical.

#### 4. Home

| Role | String |
|---|---|
| Eyebrow | `Tending today` |
| Heading | `Sunday` |
| Review entry | `The week closes tonight. Look back on it.` |
| Area — to tend | `Health` / `Two sessions this week. Last attended Monday.` / action `Tend` |
| Area — to tend | `Morning pages` / `Last attended Thursday.` / action `Tend` |
| Area — past rhythm | `Money` / `Past the two sessions you set for this week. Tend it anyway if it is what you want.` / action `Tend` (outline) |
| Area — attended | `Home` / `Attended today, 15 minutes` (no action) |
| Absence note | `People keeps a rhythm of one session a week. It is not a daily area, so it does not wait for you here.` |
| Bottom navigation | `Capture` · `Inbox` · `Week` |

#### 5. Picker

| Role | String |
|---|---|
| Eyebrow | `Health · this week` |
| Heading | `Pick one thing` |
| Task 1 | `Book the blood test` / `Last session` / `Found the lab. Need the referral number from the clinic.` |
| Task 2 | `Refill the prescription` / `Last session` / `Not attended yet.` |
| Task 3 | `Walk three mornings` / `Last session` / `Two mornings so far. Thursday is open.` |
| Scope note | `Only what you put on the week list for Health shows here. Anything captured since sits in the inbox.` |
| Primary action | `Tend for fifteen minutes` |
| Footer note | `You can switch to another task inside the session.` |

#### 6. Session — running

| Role | String |
|---|---|
| Eyebrow | `Session · Health` |
| Heading | `Book the blood test` |
| Switch action | `Tend something else in Health` |
| Clock | `14:16` |
| Clock note | `Fifteen minutes on Health.` |
| Field label | `Where you got to` |
| Field placeholder | `What moved, and what is left for next time` |
| Field note | `The note is what you read when this task comes back around.` |
| Action | `Done for now` |
| Action | `Mark it done` |

#### 6b. Session — at zero

Identical to running, except:

| Role | String |
|---|---|
| Clock | `0:00` |
| Clock note | `Fifteen minutes. The session keeps recording from here.` |
| Field content | `Called the lab. They need the referral number before they will book.` |

#### 6c. Session — well past

Identical to running, except:

| Role | String |
|---|---|
| Clock | `+17:04` |
| Clock note | `Thirty-two minutes on Health. Close it when you are ready.` |
| Field content | `Referral number found in the old email. Booked for the 22nd, 8:40.` |

#### 7. Capture

| Role | String |
|---|---|
| Eyebrow | `Capture` |
| Field placeholder | `One thing` |
| Section label | `Area, if you know it` |
| Chips | `Health` · `Morning pages` · `Money` · `Home` |
| Footer note | `With no area it goes to the inbox, where you can sort it later.` |
| Primary action | `Capture` |

#### 8. Inbox

| Role | String |
|---|---|
| Eyebrow | `Inbox` |
| Heading | `Three unsorted` |
| Item 1 | `Ask the dentist about the night guard` / `Captured Monday` / `Give it an area` |
| Item 2 | `Look up the bike shop that does tune-ups` / `Captured Monday` / `Give it an area` |
| Item 3 | `Read back the notes from the workshop` / `Captured last Thursday` / `Give it an area` |
| Footer note | `An item stays here until it has an area. Nothing here expires.` |

#### 9. Week

| Role | String |
|---|---|
| Eyebrow | `This week` |
| Heading | `Four areas, ten sessions` |
| Row 1 | `Health` / `Three sessions` / `Three tasks on the list. Two sessions attended.` |
| Row 2 | `Morning pages` / `Three sessions` / `One session attended. Wednesday and Friday are open.` |
| Row 3 | `Money` / `Two sessions` / `Both sessions attended. Anything further is extra.` |
| Row 4 | `Home` / `Two sessions` / `Two tasks on the list. One session attended.` |
| Action | `Change the rhythm` |

#### 10. Review

| Role | String |
|---|---|
| Eyebrow | `Week of 7 September` |
| Heading | `Six sessions` |
| Section label | `Attended` |
| Row 1 | `Health` / `Three sessions` / `52 minutes. Last note: found the lab, need the referral number.` |
| Row 2 | `Money` / `Two sessions` / `31 minutes. Last note: statements sorted through August.` |
| Row 3 | `Home` / `One session, 15 minutes` |
| Section label | `Unattended` |
| Row 4 | `Morning pages` / `No sessions this week. The pages are where you left them.` |
| Closing note | `Unattended is a fact about the week, not about you. Next week starts with the same areas.` |
| Action | `Set this week's rhythm` |

### Key Entities

These describe the **shape of the fixture only**. No storage, no
relationships enforced, no rules applied.

- **Area**: a name, a color from the palette, a rhythm expressed as
  sessions per week, and whether it appears on Home daily. Five exist:
  Morning pages, Health, Home, People, Money.
- **Task**: a title, the area it belongs to (or none, meaning it sits in the
  inbox), whether it is on this week's list, and the note left by the last
  session on it.
- **Session fixture**: the three states of one session against one task —
  running, at zero, and well past. A clock string and a note, nothing more.
- **Week fixture**: per area, sessions committed and sessions attended.
- **Review fixture**: per area, sessions attended, minutes, and the last
  note; plus the areas with no sessions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A person can go from opening Home to a running session in two
  taps.
- **SC-002**: All ten screens render at 390px and at 320px with no
  horizontal scrolling, no clipped text, and no overlapping controls.
- **SC-003**: Every tappable control measures at least 44x44px at both
  widths.
- **SC-004**: Every user-facing string on every screen matches the approved
  copy character for character. **Verified by review, not by test** — see
  §"How SC-004 and SC-010 are verified".
- **SC-005**: No screen contains a word from the forbidden lexicon, an
  emoji, an exclamation mark, or an apology.
- **SC-006**: Minutes appear only on Review, on the session clock, and on
  Home's collapsed "Attended today" line — nowhere else.
- **SC-007**: The three session states are visually identical in layout and
  treatment, differing only in the clock string, the clock note and the note
  content.
- **SC-008**: Reloading any screen returns it to its fixture state, and no
  screen claims that anything was saved.
- **SC-009**: Each of the ten screens answers its stated question with
  nothing else on it — verified by removing any element and confirming the
  question would no longer be answered.
- **SC-010**: A person shown Home on a phone, without instruction, taps an
  area's Tend button as their first action. **Verified by observation, not
  by test** — see §"How SC-004 and SC-010 are verified".
- **SC-011**: Every screen can be left without using the browser's back
  button, and every screen is reachable from First run or from Home in at
  most three taps.

## How SC-004 and SC-010 are verified

Article VII requires every acceptance criterion to have at least one test
naming it. Two criteria here cannot be satisfied that way, and saying so is
better than writing a test that only appears to check them.

**SC-004 — copy matches character for character.** `lib/copy.ts` *is* the
transcription of the approved copy, so a test comparing the two compares a
file against itself and proves nothing. Extracting the strings from
`docs/design/Tend.dc.html` at test time was considered and rejected: the
design file carries three strings this spec has deliberately overruled
(clarifications Q1, Q2, Q3), so the test would need a documented exception
list, and an exception list is where such a test rots.

The transcription was made with a parser rather than by eye, and diffed
against the Round 2 handoff on 2026-09-16 with zero differences across all
twelve artboards. **SC-004 is verified by that review.** What a test *can*
check, and does, is that the strings obey the rules: `tests/unit/copy.test.ts`
covers the lexicon, emoji and punctuation constraints (FR-026, FR-027,
SC-005).

If this recurs in feature 002, the better answer is to generate `lib/copy.ts`
from the spec's copy tables so the spec becomes the machine-readable source.

**SC-010 — an unprompted person taps Tend first.** This is a usability
observation about a real person, not an assertion about the build. It is
recorded because it is the truest statement of whether Home works, and it is
verified by watching someone open the app. SC-001 (two taps to a session)
and SC-009 (each screen answers its question with nothing else) carry the
buildable half of the same intent and both have tests.

## Assumptions

- **The rhythm is sessions, not minutes.** The approved design counts a
  week's commitment in sessions; `docs/PRODUCT-SPEC.md` §3.1 types it as
  `weekly_budget_minutes`. This feature builds what the design shows.
  Because feature 001 computes nothing, the two do not conflict yet — but
  they will in feature 002, and the product spec will need an amendment
  before the domain is built. Flagged here rather than silently resolved.
- **`default_session_minutes` is fixed at fifteen** throughout the fixtures.
  The design shows no control for changing it, and the Area edit screen does
  not offer one.
- **Areas carry no rules in this feature.** The removal explanation on the
  Areas screen states what would happen to tasks and history; nothing
  actually happens.
- **The reorder interaction is visual.** Dragging reorders the rendered
  list. The order is not saved and returns to fixture order on reload.
- **The fixtures are one person's example.** The design file says so
  explicitly. No area is shipped as a default, and the fixture names must
  not become suggestions offered to a new user.
- **Review's week is "Week of 7 September"**, matching the fixture. Since
  the week starts Monday (product spec §4.4, as amended 2026-09-09) and
  7 September 2026 is a Monday, the fixture is consistent with that rule.
- **Navigation is not drawn in the design and was decided in clarification.**
  The design file contains no links between screens at all. The topology is
  now specified in FR-028 through FR-033 rather than assumed.
- **The empty Area edit state is not drawn.** The design's only Area edit is
  prefilled with `Morning pages` as a value. Its creating-state defaults
  come from the prototype script embedded in the same design file — the
  designer's own values — not from a fresh judgement call.
- **Testing at 320px is additive.** The constitution requires 390px
  verification; 320px was requested for this feature and is treated as a
  second required width, not a replacement.

## Out of scope

Named explicitly so they are not added opportunistically during
implementation:

- Any recalculation of a budget or a rhythm.
- A functioning task hierarchy — subtasks are not in any screen here.
- A real clock. The session time is a fixture string.
- Any storage of any kind.
- Statistics, charts, or any dashboard.
- Anything in Constitution Article III's v1 exclusion list.

## Resolved decisions

Three contradictions were found inside the approved artifacts. All three
are decided; the resolutions are applied in §"Screen copy" above.

| # | Contradiction | Resolution (2026-09-09) |
|---|---|---|
| Q1 | Area edit's `Done` violated Article II and duplicated the footer | Button becomes `Back to areas`. Footer becomes `Changes apply as you make them.` |
| Q2 | Two past-zero session notes in the same design file | The artboard string stands: `Fifteen minutes. The session keeps recording from here.` The script's variant was prototype scaffolding. |
| Q3 | Home claimed People was on the week list; Week omitted it | Week stays exactly as drawn. Home's absence note becomes `People keeps a rhythm of one session a week. It is not a daily area, so it does not wait for you here.` |

`docs/design/Tend.dc.html` still carries the superseded strings for Q1 and
Q2. It is a design artifact, not a build input; this spec is what the
implementation follows. Updating the design file is optional and, if done,
belongs in its own commit.

## The one string that is not transcribed

Every other string in §"Screen copy" is transcribed from
`docs/design/Tend.dc.html`. This one is new, written for this spec and
chosen on 2026-09-09:

> `People keeps a rhythm of one session a week. It is not a daily area, so it does not wait for you here.`

**Why it was rewritten**: the approved string — `People sits outside today.
It stays on the week list until you put it here.` — conflated two different
things, not being on Home today and being on the week list, and the second
half contradicted the Week screen (Q3).

**Why this wording**: it states that the area exists and keeps its rhythm,
says plainly that it is not a daily area, and asserts nothing about the
week list. `does not wait for you here` deliberately reuses the vocabulary
of the Area edit screen's `This only decides whether it waits for you on
Home.`, so both screens explain the same idea in the same words.

**Scope note**: the wording is singular because exactly one fixture area is
non-daily. If a second non-daily area is ever added, this string is
rewritten then rather than generalised now.

---

### Superseded — the original clarification tables

Kept for the reasoning, which is why the decisions hold.

### Q1: The Area edit screen's top action reads "Done"

**Context**: Area edit, top action `Done`; footer note `Changes apply as
you make them. Done takes you back to your areas.`

**What we need to know**: Constitution Article II reserves **Done** for task
completion and nothing else. Here it labels a navigation action, which is a
violation as written. The footer note also restates what the button does.

| Option | Answer | Implications |
|--------|--------|--------------|
| A | Rename to `Back to areas`, and cut the second sentence of the footer note | Resolves the Article II violation and the duplication. The footer note becomes `Changes apply as you make them.` Requires updating the design file. |
| B | Rename to `Back to areas`, keep the footer note reworded to match | Resolves the violation; keeps a closing reassurance. Footer becomes `Changes apply as you make them. Back to areas when you are finished.` |
| C | Keep `Done` | Ships a known Article II violation. Not recommended. |
| Custom | Provide your own wording | Any label that is not a lexicon-reserved word. |

**Your choice**: _[Wait for user response]_

### Q2: The past-zero session note exists in two versions

**Context**: The at-zero artboard renders `Fifteen minutes. The session
keeps recording from here.` The script inside the same design file sets
`Fifteen minutes passed. The session keeps recording.` for the same state.

**What we need to know**: Which string is the approved one.

| Option | Answer | Implications |
|--------|--------|--------------|
| A | `Fifteen minutes. The session keeps recording from here.` | The string visible in the artboard, which is what was reviewed. Recommended. |
| B | `Fifteen minutes passed. The session keeps recording.` | The string in the prototype's script, likely the older draft. |
| C | Use A at zero, and the well-past artboard's own line beyond it | Matches all three artboards exactly as drawn; treats the script as prototype scaffolding. |
| Custom | Provide your own wording | — |

**Your choice**: _[Wait for user response]_

### Q3: Is People on the week list or not?

**Context**: Home says `People sits outside today. It stays on the week list
until you put it here.` The Week screen heading reads `Four areas, ten
sessions` and lists Health, Morning pages, Money and Home — not People.
The Areas screen gives People `One session a week`.

**What we need to know**: Whether the Week screen should include People.

| Option | Answer | Implications |
|--------|--------|--------------|
| A | Add People to Week; heading becomes `Five areas, eleven sessions` | Makes Home's copy true. Changes the Week artboard and its heading. |
| B | Keep Week as drawn; reword Home's absence note so it does not claim People is on the week list | Keeps the approved Week screen. Home's note needs new copy. |
| C | Keep both as drawn | Ships a fixture that contradicts itself on two screens. Not recommended. |
| Custom | Provide your own resolution | — |

**Your choice**: _[Wait for user response]_
