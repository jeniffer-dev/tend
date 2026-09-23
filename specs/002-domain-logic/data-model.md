# Phase 1 — Data model: Domain logic

Feature 001's `lib/fixtures.ts` stored the sentence a screen displays. This
feature stores the facts a sentence is derived from, and the sentences move
into functions.

## The rule that governs every shape below

**State holds facts; `lib/` holds the functions that turn facts and a moment
into sentences; components hold neither.**

001's rule was "store the displayed value, never the inputs a component
would reduce". That rule existed to keep the reduction out of components
while there was nowhere else to put it. Now there is somewhere: `lib/`. The
rule inverts, and its purpose does not change — a duration or a percentage
computed inside a React component is still a defect (Article VI).

The practical test: **if you can read a user-facing sentence in the state,
the state is wrong.** `Three sessions a week · in Home daily` is no longer a
field. It is `sessions_per_week: 3` and `is_daily: true`, and a function.

## Stored state

Three collections and a clock. Nothing else is stored, and nothing derived
is stored beside it.

```ts
type State = {
  areas: Area[]
  tasks: Task[]
  sessions: Session[]
  activeSessionId: string | null
}
```

### Area

```ts
type Area = {
  id: string
  name: string
  color: AreaColor          // the five brand tokens, as in 001
  sessionsPerWeek: 1|2|3|4|5
  isDaily: boolean
  sortOrder: number
  archivedAt: Date | null   // set by Remove the area; never deleted
}
```

**An area is archived, not deleted.** PRODUCT-SPEC RF-04 says *archivar*,
and that is what makes the removal confirmation honest: its past sessions
"stay in Review", and Review has to be able to name the area they belong to.
A deleted area leaves its sessions pointing at nothing.

An archived area is gone from Areas, Home, Week and Capture's chips. It
survives only as the name its old sessions resolve to.

`rhythmLabel` is gone. `Three sessions a week · in Home daily` is now
`rhythmLabel(area)`, and it is the first thing SC-001 checks.

### Task

```ts
type Task = {
  id: string
  title: string
  areaId: string | null     // null = in the inbox
  onWeekList: boolean
  capturedAt: Date
  doneAt: Date | null       // set when a session closes it as completed
}
```

`lastSessionNote` is gone. A task's last-session note is a question asked of
`sessions`, and it has three answers rather than 001's two: never attended,
attended with a note, attended without one (spec §"Screen copy").

`capturedAt` is a real moment, where 001 stored `Captured Monday`. The
formatting rule — day name to seven days back, date beyond — is a function.

### Session

```ts
type Session = {
  id: string
  taskId: string
  areaId: string            // denormalised, as PRODUCT-SPEC §3.3 has it
  startedAt: Date
  endedAt: Date | null      // null while running
  plannedMinutes: number    // 15
  actualMinutes: number | null   // written once at close; null while running
  outcome: 'completed' | 'progressed' | null   // null while running
  progressNote: string      // '' is meaningful: attended, no note left
}
```

**`actualMinutes` is stored, written once at close, and never recomputed.**
PRODUCT-SPEC §3.3 types it as a field and calls the difference between
planned and actual "el dato central del sistema", and the product spec
stands.

The reason it is a field rather than a derivation is the orphaned session.
Closing the tab or running out of battery is ordinary, not exceptional, and
a session with no `endedAt` has nothing for a derived figure to be computed
from. A recorded minute count survives what the timestamps do not.

**The live clock is still derived** from `startedAt` and `now`, and that
does not change (research.md §4). The two coexist because they answer
different questions: the clock is how long this session has been going, and
`actualMinutes` is how long it went. One is a view, the other a record.

The rule that keeps the redundancy from becoming a contradiction:
**`actualMinutes` is written exactly once, at close, and is never
recalculated afterwards.** Nothing reads the timestamps to correct it and
nothing recomputes it on load. If it ever disagrees with
`endedAt − startedAt`, the record is right and the arithmetic is stale.

**A session with no `endedAt` is feature 003's problem.** It cannot arise
while state lives only in memory — losing the tab loses the session with it
— and 003 is where persistence makes it both possible and detectable.
PRODUCT-SPEC §7 already parks the same question, and this is the same
question wearing a different hat.

`progressNote: ''` is a real state, not a missing value. A session closed
without a note produces `Attended. No note left.`, which is a different fact
from `Not attended yet.` and now has its own string.

### The clock

```ts
type Clock = { now: Date; pinned: boolean }
```

`now` is published by the provider and passed into every derivation. It
advances once a second while a session runs, and is pinned to
**Sunday 13 September 2026** under `?seed=001` so SC-001 compares against a
fixed moment rather than against today (research.md §5).

## Derivations

Every one is a pure function of state and `now`, in `lib/`, unit-tested.
This list is the feature.

### The week

| Function | Answers |
|---|---|
| `startOfWeek(now)` | Monday 00:00 local, built from date parts and never by subtracting milliseconds |
| `endOfWeek(now)` | Sunday 23:59:59.999 local |
| `weekOf(session)` | The week containing `startedAt` — never `endedAt` (FR-006) |
| `isWeekClosing(now)` | Sunday or Monday, which decides Home's Review entry (FR-019a) |

### Counting

| Function | Answers |
|---|---|
| `sessionsInWeek(area, week)` | How many sessions that area has in that week |
| `minutesInWeek(area, week)` | Their total elapsed minutes — Review only |
| `isPastRhythm(area, week)` | `sessionsInWeek > sessionsPerWeek`; the extra ones are extra |
| `attendedToday(area, now)` | Any session **started** today, running or closed (FR-015a) |
| `lastAttended(area, now)` | The most recent session's start, as a day name or date |

### Formatting

| Function | Answers |
|---|---|
| `numberWord(n)` | Words to twelve, figures from thirteen (FR-029) |
| `dayName(then, now)` | Day name to seven days back, date beyond (FR-030) |
| `joinNames(names)` | `A and B`, `A, B and C` (FR-022b) |
| `clockString(startedAt, now)` | `14:16`, `0:00`, `+17:04` — derived, never counted (research.md §4) |

### Screen copy

One function per sentence 001 stored as a literal: `rhythmLabel`,
`homeLine`, `absenceNote`, `weekRowLine`, `reviewRowLine`,
`removalExplanation`, `lastSessionNote`, and the headings that carry counts.
Each takes state and `now`; each returns an approved string from
`lib/copy.ts` with values interpolated. **No function builds a sentence out
of fragments** — the templates live in `copy.ts` exactly as 001's literals
did, and the derivations choose between them and fill them.

## State transitions

The only transitions in the feature. Everything else is a read.

| Event | Effect |
|---|---|
| Capture with no area | New `Task`, `areaId: null`, `capturedAt: now` — it is in the inbox |
| Capture with an area | New `Task` with that `areaId`, not in the inbox |
| Give an inbox item an area | `areaId` set; it leaves the inbox |
| Start a session | New `Session` with `startedAt: now`, `endedAt: null`; `activeSessionId` set. The area is attended today from this moment (FR-015a) |
| Switch task mid-session | The running session's `taskId` changes; `startedAt` does not. It is one session |
| Close as done | `endedAt: now`, `outcome: 'completed'`, note saved; the task's `doneAt` is set and it leaves the week list |
| Close as progressed | `endedAt: now`, `outcome: 'progressed'`, note saved; the task stays on the week list |
| Remove an area | `archivedAt: now`. Its tasks get `areaId: null` and keep their titles, so they appear in the inbox. Its sessions are untouched (FR-018) |
| Reorder areas | `sortOrder` rewritten; Home follows (FR-019) |

**Archiving is the reason the removal confirmation can be true.** It
promises that the area's past sessions stay in Review, and Review names the
area each session belongs to. Deleting the area would leave those sessions
pointing at nothing, and the screen would either drop them or invent a
label — one of which breaks the promise and the other breaks Article II.

So every lookup of an area is one of two questions, and the distinction is
load-bearing:

- **"Which areas are there?"** — Areas, Home, Week, Capture's chips, and
  every count in a heading. Archived areas are excluded.
- **"Which area was this session against?"** — Review only. Archived areas
  are included, because the session happened.

## What this file is not

- Not a schema. Nothing is persisted; feature 003 decides what durable
  shape any of this takes.
- Not a component contract. `contracts/derivations.md` fixes what each
  screen asks for; this fixes what exists to ask about.
