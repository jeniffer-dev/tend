# Phase 0 — Research: Domain logic

Feature 001 had one genuinely open technical question. This feature has
five, and they are all consequences of the same shift: values are now
derived, so there has to be something to derive them *from* and a defined
moment to derive them *at*.

---

## 1. Where does state live, when nothing may be stored?

**Decision**: One client-side store, provided at the root layout, holding
areas, tasks and sessions in memory. Screens become client components.

**Rationale**: FR-023 forbids every storage API, so state exists only as
JavaScript in a running tab. A server component cannot read it, which means
the server/client split 001 used stops paying for itself — 001's pages were
server components because their data was a module import, and 002's data is
a live object graph in the browser.

Mounting the provider in `app/layout.tsx` (which stays a server component
and simply renders the client provider around `children`) is what satisfies
FR-024: a running session survives navigation because the store is above
the route, not inside it.

**Alternatives considered**:

- *Module-level singleton without context* — rejected. It works, but nothing
  re-renders when it changes, and wiring subscriptions by hand is a state
  library written badly.
- *A state management dependency* — rejected by Article VI, which presumes
  them rejected. The store is one object and a reducer; there is nothing
  here a library would carry.
- *Server state with route handlers* — rejected. It is persistence wearing a
  different hat, and it is feature 003's decision to make.

---

## 2. What is "now", and who is allowed to ask?

**Decision**: `now` is passed into every derivation as an argument. **No
function in `lib/` reads the clock.** A single provider owns the current
time and re-publishes it once a second while a session is running.

**Rationale**: This is the rule that makes 002 testable, and it is the
direct descendant of 001's "fixtures store the displayed string". Every
sentence on every screen depends on the current time — which day it is,
which week, how long ago a session was, whether the week is closing. If
derivations call `new Date()` internally they are untestable and SC-001 is
unverifiable, because the expected output changes every day.

Article VI already requires domain rules to be "pure, synchronous functions
with unit tests, isolated from React and from persistence". A function that
reads the clock is none of those things. Passing `now` makes each rule a
pure function of state and time, which is exactly what can be unit-tested —
something 001 had no need for and therefore never established.

**Who publishes it, and how often.** State and time are two contexts. The
ticking `now` is subscribed to by the session clock and nothing else; every
other screen subscribes to a `now` that changes only when the local date
changes. Both are the same argument to the same pure functions, so no rule
changes shape — what changes is how many screens React re-renders each
second. One provider holding state and a one-second tick together would
re-render every subscribed screen every second while a session runs, which
is the constraint plan.md §"Performance Goals" names, lost to the more
obvious structure.

A day name, a captured label, a week boundary and a rhythm comparison
cannot change more than once a day. Asking them every second is not wrong,
it is merely waste — and on a phone, waste during the one screen that must
feel calm.

**Alternatives considered**:

- *A `getNow()` helper inside `lib/`* — rejected. It hides the dependency
  rather than removing it, and every test then has to mock a module.
- *Freezing time per render* — rejected for the running clock, which must
  advance; it is the same decision with a worse name.
- *One context for state and time* — rejected above. It satisfies every
  rule about purity and fails the only performance constraint the feature
  has.

**How a browser test moves `now`.** Playwright's clock API — `page.clock`,
available since 1.45 and the suite is on 1.49 — installs a controllable
clock before the app mounts and fast-forwards it on demand. It is the right
tool because the app reads real time in exactly one place, the provider's
tick, and derives everything else from the `now` that tick publishes. A test
can therefore jump the clock past fifteen minutes without waiting fifteen
minutes, and without the app growing a test-only entry point.

The alternative was a query parameter that sets the moment, e.g.
`?seed=001&at=...`. Rejected: it is a second dev affordance to keep out of
the default path, and it can only set a moment rather than move one, which
is not what SC-003 asks for. The unit tests need none of this — they pass
`now` as an argument, which is the whole reason it is one.

---

## 3. Date arithmetic without a date library

**Decision**: Hand-rolled, on the platform `Date`, using local-time
accessors only. Roughly six functions: start of week, end of week, same day,
days between, day name, and a `7 September` date format.

**Rationale**: Article VI presumes date libraries rejected and requires a
written justification to add one. None is needed here. The whole surface is
a Monday-based week boundary, a day-name lookup, a difference in days, and
one date format — all of it local time, no parsing of user input, no
timezone conversion, no locale negotiation.

The trap worth naming: **week arithmetic must not be done by adding
milliseconds.** Days are not reliably 86,400,000ms apart under daylight
saving, so the start of the week is computed by taking the local date parts
and constructing midnight from them, never by subtracting a duration.

**Alternatives considered**:

- *date-fns / Day.js / Temporal polyfill* — rejected. Each is a runtime
  dependency for six functions that fit on one screen, and Article VI's bar
  is "what it replaces and why hand-rolling is worse". Hand-rolling is not
  worse here.
- *`Intl.DateTimeFormat` for day names* — accepted for the day name and the
  date, since it is a platform API rather than a dependency, and it is what
  keeps `7 September` from being a hand-built month table.

---

## 4. A clock that counts down, passes zero, and keeps going

**Decision**: The clock is derived, not counted. The session stores
`startedAt`; the displayed string is a pure function of `startedAt` and
`now`. A one-second tick updates `now` and nothing else.

**Rationale**: FR-011 requires the clock to pass 0:00 and continue upward
with no maximum, and FR-012 forbids any interruption. Deriving from two
timestamps rather than decrementing a counter gets both for free: there is
no terminal state to handle, negative remaining time simply renders with a
`+`, and a tick that is late or dropped cannot make the clock wrong.

It also means a backgrounded tab — which throttles timers — shows the
correct time the moment it is foregrounded again, rather than however far
the counter got.

Article V still applies: the clock has one treatment in every state, and
the tick changes a number, never a style.

**Alternatives considered**:

- *`setInterval` decrementing a stored remaining-seconds value* — rejected.
  It drifts, it is wrong after throttling, and it needs an explicit branch
  at zero, which is exactly where the product must not behave specially.

---

## 5. How is 001-equivalent state loaded without becoming the default?

**Decision**: A query parameter, `?seed=001`, handled once at the provider.
It loads the 001-equivalent state **and** pins `now` to Sunday 13 September
2026. It writes nothing, so 001's `persistence.spec.ts` stays true.

**Rationale**: FR-025 requires the app to start empty and FR-026 requires
dev state to exist without being the default. A query parameter is the only
mechanism that satisfies both without storing anything: it is explicit, it
is per-tab, it disappears on navigation, and it cannot leak into a normal
session.

**It starts the clock, it does not stop it.** The seeded `now` is
`Sunday 13 September 2026, 13:00 local + the real time elapsed since
mount`. A frozen clock would satisfy SC-001 and break everything else: the
session clock derives from `startedAt` and `now`, so a `now` that never
moves is a clock that never moves, and the session screen — the feature's
centre — could not be exercised under the only state the parity test runs
against. Quickstart asks for the clock to be watched past zero under seed,
and a frozen clock cannot do it.

The hour matters for one reason. Parity holds while the seeded moment is
still Sunday, and at local midnight the heading becomes `Monday` and Home's
Review entry changes string. Thirteen hundred leaves eleven hours, which is
longer than any sitting, and it is an hour at which 001's fixture reads
true: something has been attended today, and the week still closes tonight.

**The fixed clock is not optional.** SC-001 compares rendered copy against
001's approved strings, and those strings contain `Sunday`,
`Last attended Monday.`, `Week of 7 September` and
`The week closes tonight.` Every one of those is a function of the current
date. 001's fixture describes a specific moment — Sunday 13 September 2026,
with the closing week running Monday 7th to Sunday 13th — and SC-001 is
only meaningful if the app is standing at that moment. Seeding the data
without seeding the time would make the criterion fail every day except one.

**Alternatives considered**:

- *An environment variable* — rejected. It is a build-time switch, so it
  cannot coexist with the real app in one running instance, and the e2e
  suite needs both.
- *A `/dev` route* — rejected. It is a screen that is not one of the ten,
  and Article III's exclusions are about what exists, not only about what
  users are shown.
- *Seeding data but not time* — rejected above. It is the difference between
  SC-001 being a regression test and being a calendar.
- *Freezing the seeded clock rather than offsetting it* — rejected above. It
  buys parity that does not expire and pays with a session screen that
  cannot be tested at all.

---

## Resolved

No `NEEDS CLARIFICATION` markers remain. The spec's own open list closed at
`/speckit-clarify`, and `/speckit-analyze` closed the five it raised.
All twenty-six new strings are approved and recorded in spec.md
§"Screen copy". Nothing remains in spec.md §"Open". The last decision to
close there, on 2026-09-25, was that an attended card keeps an outline Tend
(FR-015e); it needed no research and added no string.
