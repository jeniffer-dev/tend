# Phase 1 — Quickstart: validating the domain logic

How to run this feature and confirm it does what the spec says. A
validation guide, not an implementation guide.

## Prerequisites

Node 20+. No database, no environment variables, no accounts. Nothing is
stored, so there is no state to clear between runs — closing the tab is the
reset.

## Run it

```bash
npm install
npm run dev
```

`next dev` binds `0.0.0.0` and prints a Network address beside the Local
one. Open that on a phone; Article VII wants the criteria verified on a real
device, and 001's T047 found three things no assertion had caught.

## The two ways in

**Empty, which is what anyone gets.** Open `/`. With no areas you land on
First run. Name an area and the app has a Home.

**Seeded, which is what SC-001 needs.** Open `/?seed=001`. This loads state
equivalent to 001's fixtures *and* pins the clock to Sunday 13 September
2026 — the moment 001's copy describes, with the closing week running
Monday the 7th to Sunday the 13th.

Both matter. The empty path is the product; the seeded path is the
regression test. Neither writes anything.

## The checks that matter most

### SC-001: the seeded app is indistinguishable from 001

With `?seed=001`, walk all ten screens and compare against 001's approved
copy. Every sentence should be identical, character for character — `Three
sessions a week · in Home daily`, `Two sessions this week.`'s absence from
Health's card, `Week of 7 September`, all of it.

This is the criterion the feature is judged by. If a word differs, either a
derivation is wrong or a rule was never written down, and both are bugs.

### The clock passes zero without noticing

Start a session and leave it running past fifteen minutes. The clock reads
`0:00`, then counts upward with a `+`. Nothing turns red, nothing pulses,
no dialog appears, both closing actions stay where they were, and the
layout does not move.

Then background the tab for a few minutes and come back. The clock should
be correct, not however far a timer got — it is derived from two
timestamps, not counted (research.md §4).

### Leaving a session does not end it

Start a session, navigate to Home, and come back. The session is still
running and the clock has advanced. Home showed `Tending now` while you
were there, not a minute figure and not nothing (FR-015a, FR-024).

### The week boundary

The hard case is a session that starts Sunday night and ends Monday
morning. It belongs to the week that is closing. Seed, start a session near
the boundary, and confirm Week and Review both count it in the old week.

The second hard case is daylight saving, which is why week starts are built
from date parts rather than by subtracting 24-hour days. Set the device
clock to a DST changeover weekend and confirm Monday 00:00 is still Monday
00:00.

### Empty states, which 001 never reached

Each of these needs its approved string and none of them should show a
count of zero phrased as if it were a number:

- Remove every area, and Areas reads `None right now`
- Keep one area, and the footer stops saying `Drag to reorder.`
- Make every area non-daily, and Home explains itself
- Attend every daily area, and Home says so
- Empty the inbox, the week list, a whole week of sessions

### Minutes are still only in three places

`/review`, the session clock, and Home's attended line — plus the Picker's
`Tend for fifteen minutes`, which SC-006 records as the one approved
duration outside them. Week is the screen most tempted by minutes and must
never show one.

### Nothing is stored

Open DevTools and confirm `localStorage`, `sessionStorage`, IndexedDB and
cookies are all empty after a full session of use. 001's
`tests/e2e/persistence.spec.ts` asserts exactly this and must still pass
unchanged.

## Run the tests

```bash
npm run test          # Vitest — the derivations, as pure functions
npm run test:e2e      # Playwright — the screens, at 390px and 320px
```

The unit suite grows enormously in this feature and that is the point. 001
had nineteen assertions over a module of strings, because there was nothing
else to test. Every rule in this feature is a pure function of state and a
moment, so the week boundary, the rhythm comparison, the day naming, the
number words and the clock string are all testable without a browser.

The e2e suite inherits 001's thirteen spec files unchanged, and they keep
their meaning: the dimensional sweeps, the navigation rules, the motion
rules and the persistence assertions are all still true statements about
this feature.

## What "done" looks like

- The empty app works from First run to a running session.
- The seeded app is character-identical to 001 on all ten screens.
- A session survives navigation, passes zero, and ends only when closed.
- Both suites green, at both widths.
- A phone in your hand, and the answer to "does it still feel calm?" is yes
  — now that the numbers are real.
