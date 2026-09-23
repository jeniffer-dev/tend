# Phase 1 — Contract: what each screen asks for

001's contract fixed the screens, their routes and the edges between them.
That contract still holds unchanged. **This one fixes what each screen asks
of `lib/`, and what it is given back.**

The rule underneath: a screen receives finished strings and booleans. It
never receives two numbers and a reason to divide them.

Every function takes `now` explicitly. None reads the clock (research.md §2).

## The shape of every call

```
derive(state, now) → what the screen renders
```

A screen calls one function per region, not one per value. If a screen needs
four strings, that is one call returning four strings, so the screen cannot
combine them wrongly and the test has one thing to assert against.

## Per screen

### `/first-run` — Where do I start?

Shown when `areas` is empty. No derivation; the copy is static.

**Contract**: `/` MUST route here whenever there are no unarchived areas,
and MUST NOT route here merely because Home would be empty.

**The route lives on `/` alone** (FR-025a). No other screen redirects. Areas
keeps its own `None right now`, which is what a person sees at the moment
they remove the last area, because that is the screen they are standing on.
A redirect from every route would make that approved string unreachable and
would answer a question the person did not ask.

### `/areas` — What am I paying attention to?

| Asks | Gets |
|---|---|
| The list | Unarchived areas in `sortOrder`, each with its `rhythmLabel` |
| The heading | `Five, in your order` · `One area` · `None right now` by count |
| The footer note | The 001 note, or the one-area note that drops `Drag to reorder.` |
| A removal confirmation | One of four strings by whether the area has tasks, sessions, both or neither |

**Must not** receive counts to phrase itself with. `numberWord` is applied
in `lib/`, not in the row.

### `/areas/[areaId]`, `/areas/new` — What is this area, and how often?

No derivation beyond the area itself. Creating starts from the documented
defaults; editing starts from the area. Changes apply to state immediately,
which is what the footer note has always claimed.

### `/` — What am I tending right now?

| Asks | Gets |
|---|---|
| The heading | Today's day name |
| The cards | Unarchived daily areas in `sortOrder`, each with a treatment and a line |
| A card's treatment | `to-tend` · `past-rhythm` · `attended` · `tending-now` |
| The absence note | One sentence naming the non-daily areas, or nothing |
| The review entry | The Sunday string, the Monday string, or nothing |
| The empty cases | The no-daily-areas note, or the all-attended note, which is withheld while a session is open |

`tending-now` is new in 002 and exists because FR-015a made it possible to
be attended and unfinished at once. It is a fourth treatment rather than a
variant of `attended`, so the screen cannot render a figure that does not
exist yet.

Its line depends on what the day already holds (FR-015b). With no closed
session on that area today it reads `Tending now`. With minutes already
attended today it keeps them and adds the clause:
`Attended today, {n} minutes · tending now`. The figure is always the
closed minutes; the running session joins it when it closes. The card is
handed whichever of the two strings applies and never the pieces.

**Ordering is unchanged**: FR-013a still puts attended areas below the ones
still to be tended, and `tending-now` sorts with the open ones — it is the
area you are in the middle of.

### `/tend/[areaId]` — What do I focus on for fifteen minutes?

| Asks | Gets |
|---|---|
| The tasks | That area's week-list tasks, not done, each with its last-session note |
| A last-session note | `Not attended yet.` · the note · `Attended. No note left.` |
| The empty case | The never-started note, or the everything-closed note |
| The consequence line | The sentence naming what starting here closes, or nothing |

The two empty notes differ and the heading does not. A screen that has
finished everything is not the same as one that never had anything, and the
distinction is the note's whole job.

**The consequence line** is given whole or not at all. It is present only
when a session is running on a task in **another** area, and it names that
task by its title verbatim (spec.md §"Screen copy"). A session running in
this same area produces nothing: picking another task there switches the
task inside the open session (FR-015), and the 001 footer note already says
so.

It sits above the primary action and gates nothing. The action keeps its
approved words, both ways forward stay available, and no confirmation step
is added (FR-012, FR-015c). The Picker is handed the finished sentence or
`null`, never the running session to phrase itself from.

### `/session/[taskId]` — What am I doing for these fifteen minutes?

| Asks | Gets |
|---|---|
| The clock | `14:16` · `0:00` · `+17:04`, derived from `startedAt` and `now` |
| The clock note | The line under it, which names elapsed minutes |
| The task and area | The running session's, not the route's, if they differ |

**Must not** be reachable without a running session, and **must not** end
one by being navigated away from. The session ends when a closing action
ends it, and at no other moment (FR-012, FR-024).

`?state=` is gone. It was a fixture-inspection affordance for three static
states, and there is now one real clock.

### `/capture` — What did I just remember?

| Asks | Gets |
|---|---|
| The chips | Every unarchived area in `sortOrder` (FR-022a) |

### `/inbox` — What have I not sorted yet?

| Asks | Gets |
|---|---|
| The items | Tasks with no area, each with its captured label |
| A captured label | Day name to seven days back, date beyond |
| The heading | The count as a word or figure, or `Nothing unsorted` |

### `/week` — What am I committing to?

| Asks | Gets |
|---|---|
| The heading | Areas and total committed sessions, or the no-tasks note |
| The rows | Unarchived areas with a rhythm, each with a sessions label and a line |
| A row's line | Tasks on the list and sessions attended, or the no-tasks form |
| The link out | `Look back on last week`, always |

**Must not** receive minutes. Week counts in sessions (FR-007), and the
derivation that would produce a minute total is not offered to this screen.

Week counts a session from its start, so an open session is already in the
figures here (FR-006a). Week says nothing about it being open, because Week
has no minutes for the omission to explain — the count is simply correct.

### `/review` — What did I attend, and what went unattended?

| Asks | Gets |
|---|---|
| Which week | The closing week on Sunday, last week on Monday and from Week's link |
| The eyebrow | `Week of {date}` for whichever week it is showing |
| Attended | Areas with sessions that week, with minutes from the closed ones and the last note |
| An open session | Named on its area's row, so a short figure is explained (FR-008a) |
| Unattended | Areas with none, or the every-area-attended line |
| The closing note | Shown only when something went unattended |

Review resolves area names **including archived areas**, because the
sessions happened (data-model.md). Every other screen excludes them.

`One still open.` is singular by construction, not by optimism: starting a
session closes any running one, so one is the maximum at any moment
(FR-015c, FR-015d). A derivation that returned a count here would be
answering a question the state cannot pose.

**Counted and measured are two different questions** (FR-006a). The
heading's session count and each row's sessions label include a session
that has started and not closed; the minute figures do not, because
`actualMinutes` does not exist until the close. The row says which session
is the open one rather than leaving the arithmetic to look short for an
unstated reason. An area whose only session this week is the open one gets
no figure at all — a zero would be a number where there is no measurement.

## Contract-level invariants

1. No component performs arithmetic, comparison against a rhythm, date
   formatting or string assembly. Verified by code review, as 001 verified
   FR-002.
2. Every derivation is pure, synchronous and takes `now` as an argument.
   The session clock is handed the ticking `now`; every other screen is
   handed a `now` that changes only when the local date does. Which one a
   screen subscribes to is a React question, not a domain one, and no
   derivation can tell the difference.
3. Every user-facing string comes from `lib/copy.ts`. Derivations choose
   between templates and fill them; they never concatenate prose.
4. 001's `contracts/screens.md` holds unchanged — same screens, same routes,
   same back rule, same ordering, and no new element except Week's
   `Look back on last week`.
5. Given `?seed=001`, every screen renders 001's approved copy character for
   character (SC-001).
