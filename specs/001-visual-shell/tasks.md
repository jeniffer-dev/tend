---

description: "Task list for feature 001 — Visual shell"
---

# Tasks: Visual shell

**Input**: Design documents from `/specs/001-visual-shell/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/screens.md, quickstart.md

**Tests**: Included, and not optional here. Constitution Article VII requires every acceptance criterion in a feature spec to have at least one test naming it.

**Organization**: Tasks are grouped by user story so each story can be implemented, tested and demonstrated on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel — different files, no dependency on an incomplete task
- **[Story]**: The user story this task serves (US1–US5, from spec.md)
- Every task names an exact file path

## Path Conventions

Frontend-only Next.js App Router at the repository root, per plan.md
§"Project Structure": `app/`, `components/`, `features/`, `lib/`, `tests/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Get a Next.js project standing with the design system's values in place before any screen exists.

- [X] T001 Initialize Next.js 15 App Router project with TypeScript at repository root — `package.json`, `tsconfig.json`, `next.config.ts`, `app/`
- [X] T002 Install and configure TailwindCSS in `tailwind.config.ts` and `postcss.config.mjs`, with `content` covering `app/`, `components/` and `features/`
- [X] T003 Create `app/globals.css` from design system v1.1.0 §8 verbatim — brand tokens with `--current-primary: #64B493`, semantic tokens with `--primary: 155 35% 55%` and `--ring: 155 35% 55%`, the `border-border` and `body` base layers. No `.dark` block and no theme toggle (Constitution Article IV). Add the `prefers-reduced-motion: reduce` block that removes transitions — Article V requires it be honoured
- [X] T004 Create `app/layout.tsx` — Geist via `next/font/google` as `--font-geist`, `font-sans antialiased` on `<body>`, and the page container `w-full max-w-[720px] mx-auto px-5 pt-6 pb-8 sm:px-8 sm:pt-7 space-y-4` from design system §4. No `1120px` container, no `md:grid-cols-*`
- [X] T005 [P] Configure Playwright in `playwright.config.ts` with two projects, `390` (viewport 390x844) and `320` (viewport 320x568), both naming the width in the project name so failures identify it
- [X] T006 [P] Configure Vitest in `vitest.config.ts` and add `test` and `test:e2e` scripts to `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The three `lib/` modules every screen reads from, plus the primitives and the one shared component.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete. Every screen imports from `lib/copy.ts` and `lib/fixtures.ts`.

- [X] T007 Define fixture types in `lib/fixtures.ts` per data-model.md — `AreaColor` (union of `'soft' | 'recovery' | 'primary' | 'load' | 'peak'`), `Area`, `HomeTreatment` (union of `'to-tend' | 'past-rhythm' | 'attended'`), `HomeCard`, `Task`, `InboxItem`, `SessionState` (union of `'running' | 'zero' | 'past'`), `SessionFixture`, `WeekRow`, `ReviewRow`
- [X] T008 Populate the fixture set in `lib/fixtures.ts` per data-model.md — the five areas in `sortOrder` (morning-pages/peak/3/daily, health/primary/3/daily, home/soft/2/daily, people/recovery/1/**not** daily, money/load/2/daily); Health's three week-list tasks plus one each for Morning pages and Money; three inbox items; three session states; four week rows; four review rows. Store every displayed value as a literal string — never the inputs a component would reduce (data-model.md §"The rule that governs every shape below"). `Task.lastSessionNote` is `'Not attended yet.'` when there is none, never an empty string. This fixture shape is what upholds FR-002
- [X] T009 [P] Transcribe every user-facing string into `lib/copy.ts`, one export per screen, character-exact from spec.md §"Screen copy" — including the em dashes (—) and middots (·). No user-facing string may be written inline in a component
- [X] T010 [P] Create `lib/routes.ts` — the route table and the back rule from contracts/screens.md. Area edit always returns to `/areas`; `/areas` returns to its opener (Week, Review) and returns nothing when opened from First run; Home and First run are roots
- [X] T011 Initialize shadcn/ui and add only Button, Card, Input and Textarea into `components/ui/`. Do not scaffold Badge or Tabs — they are permitted but unused (research.md §4)
- [X] T012 [P] Create `components/back-link.tsx` rendering the conditional back control by reading `lib/routes.ts`, and rendering nothing when the route has no opener (FR-031)
- [X] T013 [P] Write `tests/unit/copy.test.ts` — scan every export of `lib/copy.ts` for Article II's forbidden terms (start task, timer, pomodoro, category, bucket, project, overdue, missed, failed, behind, streak), for emoji, and for exclamation marks. Covers FR-026, FR-027, SC-005

**Checkpoint**: `lib/` is complete and the copy lint passes. Screens can now be built in any order.

---

## Phase 3: User Story 1 — Sit down and tend something (Priority: P1) 🎯 MVP

**Goal**: Home → Picker → Session. The whole fifteen-minute ritual.

**Independent test**: Open `/` at 390px, tap Tend on an area, tap into the session, and read all three session states. Delivers the product's core loop with no other screen built.

- [X] T014 [US1] Create `features/home/area-card.tsx` rendering the three treatments per FR-014 — `to-tend` with a solid Tend button, `past-rhythm` with an outline Tend button plus its line, `attended` collapsed to one line with no button. The treatment comes from the fixture's own field; nothing compares a count against a rhythm
- [X] T015 [P] [US1] Create `features/home/review-entry.tsx` — the tappable line `The week closes tonight. Look back on it.`, rendered at the top of the screen above the areas, never as a badge or notification (FR-016)
- [X] T016 [US1] Create `app/page.tsx` (Home) — the four daily areas in `sortOrder`, the People absence note, the bottom navigation `Capture · Inbox · Week` with no Areas entry (FR-013, FR-015, FR-029). Nothing else on the screen
- [X] T017 [P] [US1] Create `features/session/picker-list.tsx` — the area's week-list tasks, each with its `Last session` row and note, first task selected on arrival (FR-017)
- [X] T018 [US1] Create `app/tend/[areaId]/page.tsx` (Picker) — eyebrow with the area name, the scope note, the primary action, the footer note about switching inside the session
- [X] T019 [P] [US1] Create `features/session/session-clock.tsx` — renders the fixture's clock string and clock note. No ticking (FR-004), no red, no pulsing, no countdown framing (FR-006)
- [X] T020 [P] [US1] Create `features/session/session-note.tsx` — Textarea with the label `Where you got to`, its placeholder and its note
- [X] T021 [US1] Create `app/session/[taskId]/page.tsx` (Session) — reads `?state=running|zero|past`, defaulting to `running`. One component renders all three states with identical layout and treatment (FR-018, FR-019). No visible state switcher, no pause or stop control
- [X] T022 [US1] Write `tests/e2e/home-picker-session.spec.ts` — required and forbidden elements for the three screens per contracts/screens.md, covering FR-013 through FR-019. Include a two-tap assertion: from `/`, tapping an area's Tend button and then the Picker's primary action reaches `/session/*` with no interaction in between (SC-001)
- [X] T023 [P] [US1] Write `tests/e2e/session-states.spec.ts` — the three states differ only in the clock string, the clock note and the note content; layout and treatment are identical. Covers FR-019 and SC-007

**Checkpoint**: The MVP is demonstrable on a phone.

---

## Phase 4: User Story 2 — Declare and reorder the areas (Priority: P2)

**Goal**: Areas and Area edit, including the removal confirmation and the creating state.

**Independent test**: Open `/areas` directly at 390px, reorder, open an area, change every control, and trigger the removal confirmation.

- [X] T024 [P] [US2] Create `features/areas/area-row.tsx` — color dot, name, and the rhythm line (`Three sessions a week · in Home daily`) as a literal fixture string (FR-010)
- [X] T025 [P] [US2] Create `features/areas/remove-confirmation.tsx` — states what happens to the area's tasks **and** to its past sessions before offering `Remove the area`, alongside `Keep it` (FR-011)
- [X] T026 [US2] Create `app/areas/page.tsx` — five areas in `sortOrder`, drag to reorder (visual only, not persisted), `New area`, the footer note, and the conditional back control from `components/back-link.tsx` (FR-010, FR-030, FR-031). No Tend button on this screen
- [X] T027 [P] [US2] Create `features/areas/area-form.tsx` — name field, five color swatches, rhythm 1–5, the On Home two-way choice, and the three section notes (FR-012). Every control shows which option is selected; each rhythm control is at least 44x44px and all five fit one row at 320px
- [X] T028 [US2] Create `app/areas/[areaId]/page.tsx` and `app/areas/new/page.tsx` — the same screen. Editing prefills the name with the area's value; creating leaves it empty showing the placeholder, with defaults rhythm `3`, On Home `Every day`, fifth palette color (spec.md §3 "Editing vs. creating"). Top action is `Back to areas`, never `Done` (FR-012, FR-025, clarification Q1). No delete action here
- [X] T029 [US2] Write `tests/e2e/areas.spec.ts` — the list, the reorder, the removal confirmation's two statements, the creating-state defaults, and the absence of a `Done` label

---

## Phase 5: User Story 3 — Capture now, sort later (Priority: P3)

**Goal**: Capture and Inbox.

**Independent test**: Open `/capture` at 390px, type, toggle an area chip on and off, then open `/inbox` and see three unsorted items.

- [X] T030 [P] [US3] Create `features/capture/capture-form.tsx` — exactly one text field, four optional area chips with none preselected and each toggleable off, the note about where an item with no area goes (FR-020). No date field, no priority control
- [X] T031 [US3] Create `app/capture/page.tsx` — the form plus the primary action `Capture`
- [X] T032 [P] [US3] Create `features/inbox/inbox-row.tsx` — title, the captured label as a literal string, and `Give it an area`. No date framed as due or late
- [X] T033 [US3] Create `app/inbox/page.tsx` — three unsorted items and the footer note that nothing expires (FR-021)
- [X] T034 [US3] Write `tests/e2e/capture-inbox.spec.ts` — one field only, no chip preselected, chips toggle off, three inbox items, no due-date framing

---

## Phase 6: User Story 4 — Look at the week and look back (Priority: P4)

**Goal**: Week and Review, and the two links into Areas.

**Independent test**: Open `/week` and `/review` at 390px and read both.

- [X] T035 [P] [US4] Create `features/week/week-row.tsx` — area name, sessions committed, and the line about tasks and sessions attended, all as literal fixture strings. No minutes, no percentage, no bar framed as a target (FR-022)
- [X] T036 [US4] Create `app/week/page.tsx` — four areas totalling ten sessions with People absent (clarification Q3), and `Change the rhythm` linking to `/areas` (FR-029)
- [X] T037 [P] [US4] Create `features/review/review-section.tsx` — `Attended` and `Unattended` as two labelled sections, Attended first, with minutes appearing inside the row strings (FR-023)
- [X] T038 [US4] Create `app/review/page.tsx` — the two sections, the closing note that unattended is a fact about the week and not about the person (FR-024), and `Set this week's rhythm` linking to `/areas`. No chart, no trend, no comparison with last week
- [X] T039 [US4] Write `tests/e2e/week-review.spec.ts` — section order, People's absence from Week, no minutes on Week, and both links reaching `/areas`

---

## Phase 7: User Story 5 — Arrive with nothing (Priority: P5)

**Goal**: First run, and the edge into Area edit that clarification found missing.

**Independent test**: Open `/first-run` at 390px, read it, and follow `Name your first area` through to Areas.

- [X] T040 [US5] Create `app/first-run/page.tsx` — the invitation, the four color dots with their caption, `Name your first area`, and the closing line about nothing being set up in advance. No area listed, none suggested, no navigation to Home (FR-009)
- [X] T041 [US5] Wire `Name your first area` to `/areas/new` in `lib/routes.ts` and confirm leaving that screen lands on `/areas` with no back control rendered (FR-031, FR-032)
- [X] T042 [US5] Write `tests/e2e/first-run.spec.ts` — no suggested areas, no apology or exclamation mark, and the route through `/areas/new` to a rootless `/areas`

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: The sweeps that need every route to exist, and the two checks a machine cannot make.

- [X] T043 Write `tests/e2e/dimensions.spec.ts` — walk every route from `lib/routes.ts` and assert, at both widths: every `button`, `a`, `input`, `textarea` and `[role=button]` has a bounding box of at least 44x44; `documentElement.scrollWidth <= clientWidth`; no text container clips; no two interactive controls overlap. Covers FR-007, FR-008, SC-002, SC-003
- [X] T044 [P] Write `tests/e2e/navigation.spec.ts` — walk `lib/routes.ts`, assert no dead ends and that the conditional back rule holds, including `/areas` rendering no back control when opened from First run. Covers FR-001, FR-028 through FR-033, SC-011
- [X] T045 [P] Write `tests/e2e/minutes.spec.ts` — minutes appear on `/review`, on the session clock, and in Home's `Attended today, 15 minutes`, and nowhere else. Covers SC-006
- [X] T046 [P] Write `tests/e2e/motion.spec.ts` — no element declares a transition or animation on any property other than color, and under an emulated `prefers-reduced-motion: reduce` no element declares a transition duration above zero. Covers Constitution Article V
- [X] T047 Verify all ten screens on a real device at 390px and 320px per quickstart.md, using `npm run dev -- --host`. Article VII requires device or emulator verification; the README is right that the device is more honest
- [X] T048 Run Article III's addition test over all ten screens — for each screen, remove one element at a time and confirm its question from contracts/screens.md can no longer be answered. Anything that survives removal comes out. Covers SC-009. This is the check that cannot be automated and is the reason the feature exists
- [X] T049 [P] Write `tests/e2e/persistence.spec.ts` — on every route, interact with what is interactive (select a Picker task, toggle a Capture chip, change an Area edit control, drag an area), reload, and assert the screen returns to its fixture state. Assert no screen renders any word claiming something was saved, and that `localStorage`, `sessionStorage`, `indexedDB` and `document.cookie` are untouched. Covers FR-003 and SC-008
- [X] T050 [P] Write `tests/e2e/no-pressure.spec.ts` — walk every route and assert no rendered text contains a `%` character, no element is a progress or meter element, and no element renders a streak, badge, level or day-count. This is FR-005's UI half; T013 covers only the words. Covers FR-005

---

## Dependencies

```
Phase 1 Setup
    ↓
Phase 2 Foundational  ← blocks everything
    ↓
    ├── Phase 3 US1 (P1)  Home, Picker, Session      ← MVP
    ├── Phase 4 US2 (P2)  Areas, Area edit
    ├── Phase 5 US3 (P3)  Capture, Inbox
    ├── Phase 6 US4 (P4)  Week, Review
    └── Phase 7 US5 (P5)  First run
    ↓
Phase 8 Polish  ← needs every route to exist
```

**Story independence**: All five stories are independently implementable and testable once Phase 2 is done. Two link *into* US2 without depending on it — US4's `Change the rhythm` and US5's `Name your first area` both reach Areas — so if US2 is not built yet, those links are the only failing assertions and each story still stands on its own.

**Within-phase ordering**: components before the page that composes them; the page before its test.

## Parallel execution examples

**Phase 2** — after T007 and T008 (both write `lib/fixtures.ts`, so they are sequential):

```
T009 lib/copy.ts      ┐
T010 lib/routes.ts    ├── three different files, no shared dependency
T012 components/back-link.tsx (after T010)
T013 tests/unit/copy.test.ts (after T009)
```

**Phase 3** — the leaf components:

```
T015 features/home/review-entry.tsx     ┐
T017 features/session/picker-list.tsx   ├── four different files
T019 features/session/session-clock.tsx │
T020 features/session/session-note.tsx  ┘
```

**Phase 8** — every sweep but T043 is parallel; T043 walks all routes and is the longest, so start it first.

## Implementation strategy

**MVP is Phase 1 + Phase 2 + Phase 3.** That is Home, Picker and Session — the sit-down-and-tend loop. It is demonstrable on a phone and answers the question this feature exists to answer.

After the MVP, the stories can land in any order. Priority order (US2 → US3 → US4 → US5) is recommended because it fills in the screens a person meets soonest, and because US5 is the only one seen exactly once per person.

**Do not run `/speckit-implement` before `/speckit-analyze` passes** — Constitution Article VII makes that gate binding, not advisory.
