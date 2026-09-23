# Phase 1 — Data model: Visual shell

This feature has no persistence, no schema and no domain rules. What
follows is the shape of `lib/fixtures.ts` only.

## The rule that governs every shape below

**Fixtures store the string that is displayed, never the inputs a component
would have to reduce.**

FR-002 forbids computing anything at render time, and Article VI makes a
duration or percentage computed inside a component a defect. If a fixture
stored `sessionsCommitted: 3` and `sessionsAttended: 2`, then Week's row
copy — `Three tasks on the list. Two sessions attended.` — could only be
produced by a component turning numbers into words. So the fixture stores
the sentence.

This looks redundant. It is deliberate, and it is the single most important
decision in this file: it makes the "no logic in components" gate
impossible to fail by accident, and it makes feature 002's job visible —
that feature replaces these literal strings with functions in `lib/`, and
the components do not change.

## Types

```ts
type AreaColor =
  | 'soft'      // #ADEEE3
  | 'recovery'  // #86DEB7
  | 'primary'   // #64B493
  | 'load'      // #F5A65B
  | 'peak'      // #FCD581
```

Names come from the design system's brand tokens (§2). Areas carry a color;
per Article IV the color encodes the area and never a status.

```ts
type Area = {
  id: string            // slug, used in routes: 'health', 'morning-pages'
  name: string          // 'Health'
  color: AreaColor
  rhythmLabel: string   // 'Three sessions a week · in Home daily'
  rhythm: 1|2|3|4|5     // for the Area edit control's selected state only
  isDaily: boolean      // for the Area edit control's selected state only
  sortOrder: number
}
```

`rhythm` and `isDaily` exist so the Area edit controls can show which option
is selected. They are never combined into `rhythmLabel` at render time —
the label is its own field.

```ts
type HomeTreatment = 'to-tend' | 'past-rhythm' | 'attended'

type HomeCard = {
  areaId: string
  treatment: HomeTreatment
  line: string          // 'Last attended Monday.'
                        // or 'Attended today, 15 minutes'
}
```

`treatment` is the fixture's own field, not derived. Nothing compares a
count against a rhythm to decide that Money is past its rhythm; the fixture
says so. FR-014's three treatments map one-to-one onto this union.

```ts
type Task = {
  id: string
  title: string
  areaId: string | null   // null = in the inbox
  onWeekList: boolean
  lastSessionNote: string // 'Not attended yet.' when there is none —
                          // never an empty string, per the edge case
}
```

```ts
type InboxItem = {
  id: string
  title: string
  capturedLabel: string   // 'Captured Monday', 'Captured last Thursday'
}
```

`capturedLabel` is a string, not a date. A date would invite formatting
logic in a component, and Article II forbids the framing a date usually
attracts — nothing here is overdue.

```ts
type SessionState = 'running' | 'zero' | 'past'

type SessionFixture = {
  state: SessionState
  clock: string       // '14:16' | '0:00' | '+17:04'
  clockNote: string
  noteValue: string   // '' when running
}
```

The clock is a string. There is no timer in this feature (FR-004) and no
arithmetic that could turn seconds into `+17:04`.

```ts
type WeekRow = {
  areaId: string
  sessionsLabel: string  // 'Three sessions'
  line: string           // 'Three tasks on the list. Two sessions attended.'
}

type ReviewRow = {
  areaId: string
  attended: boolean
  sessionsLabel: string  // 'Three sessions' | 'One session, 15 minutes'
  line?: string          // '52 minutes. Last note: found the lab…'
}
```

Review is the only place minutes appear (FR-023, SC-006), and they appear
inside these strings rather than as a number.

## The fixture set

Five areas, in the order the Areas screen draws them:

| # | id | name | color | rhythm | daily | On Home as |
|---|---|---|---|---|---|---|
| 1 | `morning-pages` | Morning pages | peak | 3 | yes | to-tend |
| 2 | `health` | Health | primary | 3 | yes | to-tend |
| 3 | `home` | Home | soft | 2 | yes | attended |
| 4 | `people` | People | recovery | 1 | **no** | absent — the note explains it |
| 5 | `money` | Money | load | 2 | yes | past-rhythm |

There is no Learning area. Five areas, one of them non-daily.

**Colors are an assignment this plan makes.** The design draws each area
with a color, but the artboards do not label which token is which. Any
assignment satisfies the spec as long as the five are distinct and come
from the palette; this one is recorded so implementation and review agree.

Tasks — three on Health's week list, plus three unsorted:

| Task | Area | On week list | Last session note |
|---|---|---|---|
| Book the blood test | health | yes | `Found the lab. Need the referral number from the clinic.` |
| Refill the prescription | health | yes | `Not attended yet.` |
| Walk three mornings | health | yes | `Two mornings so far. Thursday is open.` |
| Ask the dentist about the night guard | — | — | `Captured Monday` |
| Look up the bike shop that does tune-ups | — | — | `Captured Monday` |
| Read back the notes from the workshop | — | — | `Captured last Thursday` |

Only Health has week-list tasks, because Health is the only area the Picker
is drawn for. Tapping Tend on Morning pages or Money reaches the same
Picker with that area's name and an empty list — see the note below.

**An unspecified case, resolved here.** The design draws the Picker only
for Health. FR-017 says the Picker shows the selected area's week-list
tasks, and two other Home areas have Tend buttons. Rather than invent copy
for an empty Picker — which would be a new approved string, and the spec has
exactly one of those already — Morning pages and Money each get one
week-list task in the fixture, titled from nothing in the design:

| Task | Area | Title |
|---|---|---|
| — | morning-pages | `Three pages, longhand` |
| — | money | `Reconcile September` |

Their last-session notes are `Not attended yet.` These two titles are
fixture data, not copy: they are one person's example, like every other
name in the fixture set, and they are not user-facing product strings the
way the Home and Review sentences are. Flagged here so the distinction is
deliberate rather than smuggled.

Week rows (four areas, ten sessions — People is absent, per clarification
Q3), and Review rows (three attended, one unattended) follow the spec's
copy tables literally and add nothing.

## What this file is not

- Not a schema. No table, no column, no migration.
- Not validated. Nothing checks that `rhythm` matches `rhythmLabel`; a
  person keeps them consistent, and feature 002 replaces one with the other.
- Not related. `areaId` is a string that happens to match an `Area.id`. No
  foreign key, no lookup helper that could grow into a query layer.
