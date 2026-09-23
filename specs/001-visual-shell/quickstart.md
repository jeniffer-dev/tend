# Phase 1 — Quickstart: validating the visual shell

How to run this feature and confirm it meets its acceptance criteria. This
is a validation guide, not an implementation guide — the build steps live in
`tasks.md`.

## Prerequisites

Node 20+. No database, no environment variables, no accounts. The feature
has no back end and makes no network call after the fonts load.

## Run it

```bash
npm install
npm run dev
```

`next dev` binds `0.0.0.0` already and prints a Network address beside the
Local one. Open that on a phone. (There is no `--host` flag; the option is
`-H, --hostname`, and it is not needed because the default is what you
want.) Per Article VII the
criteria are verified "on a real device or device emulator", and the README
is right that the real device is more honest — text rendering, tap target
comfort and thumb reach do not survive the DevTools emulator faithfully.

## Walk the ten screens

The routes, in the order a person would first meet them:

| Step | URL | What you are checking |
|---|---|---|
| 1 | `/first-run` | Invitation, not apology. No suggested areas. |
| 2 | `/areas/new` | Empty name, rhythm 3, `Every day`. No back control other than `Back to areas`. |
| 3 | `/areas` | Five areas in order. Drag one; it moves. |
| 4 | `/areas/health` | Name prefilled. Every control shows a selection. |
| 5 | `/` | Four areas in three treatments. Review entry at top. |
| 6 | `/tend/health` | Three tasks, first selected, each with a last-session note. |
| 7 | `/session/book-the-blood-test` | Running state. |
| 8 | `?state=zero` then `?state=past` | Same layout, same treatment, different clock. |
| 9 | `/capture`, `/inbox` | One field; three unsorted items. |
| 10 | `/week`, `/review` | Ten sessions; Attended before Unattended. |

## The checks that matter most

### At 320px, not just 390px

Set the narrowest viewport first, not last. Article IV says design at 390px
first, but 320px is where the 44px rule and the single column actually
collide — the Area edit rhythm row (five controls of at least 44px, plus
gaps, plus page padding) is the tightest thing in the product and the first
place to break.

### The three session states are indistinguishable except for three strings

Open all three and flip between them. Layout, spacing, weight and color must
not move. If anything shifts, FR-019 has failed — and the usual cause is a
clock string of a different length pushing something.

### Nothing is red and nothing pulses

Particularly `?state=past`. The clock reads `+17:04` and the treatment is
identical to running. Article V and FR-006.

### Minutes are reported in exactly three places

`/review`, the session clock, and Home's `Attended today, 15 minutes`.
Anywhere else is a defect against SC-006 — most likely on `/week`, which is
the screen most tempted by them.

**One approved string names a duration outside those three** and is not a
defect: the Picker's `Tend for fifteen minutes`. It is the length of the
session in the label of the button that starts it, not a figure about what
happened. spec.md §SC-006 records the exception, and
`tests/e2e/minutes.spec.ts` carries the same single entry.

### Every screen answers its one question with nothing else on it

Take each screen, cover one element at a time, and ask whether the question
in `contracts/screens.md` can still be answered. If it can, that element
fails Article III's addition test and comes out. This is the check that
cannot be automated and is the reason the feature exists.

## Run the tests

```bash
npm run test          # Vitest — the copy lint
npm run test:e2e      # Playwright — layout, dimensions, navigation
```

The Playwright suite runs every spec twice, in a 390px project and a 320px
project. A failure names the width, so `44px minimum [320]` tells you the
control is fine on the design width and too small on the narrow one.

### What each suite covers

| Suite | Criteria |
|---|---|
| `tests/unit/copy.test.ts` | FR-026, FR-027, SC-005 — scans every export of `lib/copy.ts` for forbidden terms, emoji, exclamation marks |
| `tests/e2e/home-picker-session.spec.ts` | FR-013–FR-019, SC-001 — the three MVP screens, and two taps from Home to a session |
| `tests/e2e/session-states.spec.ts` | FR-019, SC-007 — the three states differ only in the three permitted strings |
| `tests/e2e/areas.spec.ts` | FR-010–FR-012, FR-033 — the list, the reorder, the removal confirmation, the creating defaults |
| `tests/e2e/capture-inbox.spec.ts` | FR-020, FR-021 — one field, no chip preselected, three unsorted items |
| `tests/e2e/week-review.spec.ts` | FR-022–FR-024 — section order, People's absence, no minutes on Week |
| `tests/e2e/first-run.spec.ts` | FR-009, FR-032 — no suggested areas, and the route to a rootless Areas |
| `tests/e2e/dimensions.spec.ts` | FR-007, FR-008, SC-002, SC-003 — touch targets, horizontal overflow, clipping, overlap |
| `tests/e2e/navigation.spec.ts` | FR-001, FR-028–FR-033, SC-011 — walks `lib/routes.ts`, asserts no dead ends and the conditional back rule |
| `tests/e2e/minutes.spec.ts` | SC-006 — minutes are reported on three screens and nowhere else, with the Picker's duration named as the one exception |
| `tests/e2e/motion.spec.ts` | Article V — only color transitions, and none at all under reduced motion |
| `tests/e2e/persistence.spec.ts` | FR-003, SC-008 — a reload returns every screen to fixture state; no storage API is touched |
| `tests/e2e/no-pressure.spec.ts` | FR-005 — no percentage, no progress element, no streak or badge on any route |

Every acceptance criterion in `spec.md` is named by at least one test, per
Article VII — except FR-002, SC-004 and SC-010, which are verified by code
review, by review and by observation respectively. spec.md §"How FR-002,
SC-004 and SC-010 are verified" explains why a test for any of the three
would only appear to check it.

## What "done" looks like

- All ten screens reachable, no dead ends, at both widths.
- Both suites green.
- A phone in your hand, on the LAN address, and the answer to "does it feel
  calm?" is yes.

That last one is the actual acceptance criterion for this feature. The
others exist so it can be answered without being distracted by a clipped
line of text.
