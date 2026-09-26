/**
 * Every user-facing string in Tend, one export per screen.
 *
 * FR-025 makes copy a requirement of this feature, not an implementation
 * choice: the strings here are character-exact against spec.md §"Screen
 * copy", em dashes (—) and middots (·) included. No user-facing string may
 * be written inline in a component.
 *
 * Centralising them buys three things (research.md §2): the spec's copy
 * tables and this file can be diffed by a person; one test enforces the
 * Article II lexicon, the no-emoji rule and the no-exclamation rule across
 * the whole product by scanning a single module; and when feature 002 makes
 * strings dynamic, the interpolation points are already isolated.
 *
 * A few entries are functions of an area name. That is composition, not
 * calculation, and it lives in lib/ for the same reason everything else
 * here does — a component that built `Session · Health` from two pieces
 * would be assembling copy, which is the thing this module exists to stop.
 */

/** 1. First run — Where do I start? */
export const firstRun = {
  eyebrow: 'Tend',
  heading: 'This is where your areas will live.',
  body: [
    'An area is a part of your life you come back to. Your health, your money, the hour you write in. It is never finished — you tend it.',
    'Name one. Two or three is a whole practice; you can add more whenever.',
  ],
  caption: 'Each area carries a color you choose.',
  primaryAction: 'Name your first area',
  footerNote: 'Nothing is set up in advance, and nothing is suggested for you.',
} as const;

/** 2. Areas — What am I paying attention to?
 *  Row strings are fixture data (each area's own rhythmLabel), not copy. */
export const areas = {
  eyebrow: 'Your areas',
  heading: 'Five, in your order',
  /* The removal explanation is NOT here. It differs per area — it names
     that area's task and session counts — so it lives on the area in
     lib/fixtures.ts, one home rather than two. Money's is the approved
     string verbatim. */
  removalAction: 'Remove the area',
  keepAction: 'Keep it',
  footerNote:
    'Drag to reorder. Home shows them in this order. Tap an area to change its name, color or rhythm.',
  secondaryAction: 'New area',

  /* FLAGGED — accessible names taken from the artboard's own aria-labels,
     not from spec.md §"Screen copy", which lists no accessible names. They
     are user-facing: a screen reader says them aloud. */
  reorderLabel: (areaName: string) => `Reorder ${areaName}`,
} as const;

/** 3. Area edit — What is this area, and how often?
 *  The top action is `Back to areas`, never `Done`: Article II reserves Done
 *  for task completion (clarification Q1). */
export const areaEdit = {
  eyebrow: 'Area',
  topAction: 'Back to areas',
  nameLabel: 'Name',
  namePlaceholder: 'Morning pages',
  colorLabel: 'Color',
  /* FLAGGED — the artboard's own aria-labels for the five swatches. They
     match the design system §2 token descriptions, in palette order. */
  colorOptionLabels: {
    soft: 'Pale aqua',
    recovery: 'Mint',
    primary: 'Green',
    load: 'Warm orange',
    peak: 'Soft gold',
  },
  colorNote:
    'The color marks the area wherever it appears. It carries no meaning of its own.',
  rhythmLabel: 'Sessions a week',
  rhythmOptions: ['1', '2', '3', '4', '5'],
  rhythmNote:
    'A rhythm, not a target. Three sessions is what you are aiming to come back for; sessions beyond it are extra, and a week under it is a fact about the week.',
  onHomeLabel: 'On Home',
  onHomeOptions: ['Every day', 'When I add it'],
  onHomeNote:
    'Either way it stays on the week list. This only decides whether it waits for you on Home.',
  footerNote: 'Changes apply as you make them.',
} as const;

/** 4. Home — What am I tending right now?
 *  The absence note is the one string in this module that is not transcribed
 *  from the design. It was written for the spec (clarification Q3), because
 *  the approved string claimed People was on the week list and the Week
 *  screen says otherwise. */
export const home = {
  eyebrow: 'Tending today',
  heading: 'Sunday',
  reviewEntry: 'The week closes tonight. Look back on it.',
  tendAction: 'Tend',
  absenceNote:
    'People keeps a rhythm of one session a week. It is not a daily area, so it does not wait for you here.',
  nav: {
    capture: 'Capture',
    inbox: 'Inbox',
    week: 'Week',
  },
} as const;

/** 5. Picker — What do I focus on for fifteen minutes? */
export const picker = {
  eyebrow: (areaName: string) => `${areaName} · this week`,
  heading: 'Pick one thing',
  scopeNote: (areaName: string) =>
    `Only what you put on the week list for ${areaName} shows here. Anything captured since sits in the inbox.`,
  primaryAction: 'Tend for fifteen minutes',
  footerNote: 'You can switch to another task inside the session.',
} as const;

/** 6. Session — What am I doing for these fifteen minutes?
 *  The clock and its note come from the fixture, because they are the only
 *  three things that differ between the three states (FR-019). */
export const session = {
  eyebrow: (areaName: string) => `Session · ${areaName}`,
  switchAction: (areaName: string) => `Tend something else in ${areaName}`,
  noteLabel: 'Where you got to',
  notePlaceholder: 'What moved, and what is left for next time',
  noteNote: 'The note is what you read when this task comes back around.',
  doneForNow: 'Done for now',
  markItDone: 'Mark it done',

  /* 002 — the line beneath the clock, which 001 stored as three fixture
     strings because they were the only thing that differed between its
     three states. They are the same approved sentences, with the moment
     interpolated instead of written in.

     NOTE the minutes are spelled out here (`Thirty-two minutes on Health.`)
     while Home writes figures (`Attended today, 15 minutes`). Both are
     approved 001 copy and FR-029 cannot produce both. Recorded at the
     Phase 3 checkpoint rather than resolved by inventing wording. */
  clockNoteBefore: (planned: string, area: string) => `${planned} minutes on ${area}.`,
  clockNoteAtZero: (planned: string) =>
    `${planned} minutes. The session keeps recording from here.`,
  clockNoteAfter: (elapsed: string, area: string) =>
    `${elapsed} minutes on ${area}. Close it when you are ready.`,
} as const;

/** 7. Capture — What did I just remember? */
export const capture = {
  eyebrow: 'Capture',
  fieldPlaceholder: 'One thing',
  areaLabel: 'Area, if you know it',
  chips: ['Health', 'Morning pages', 'Money', 'Home'],
  footerNote: 'With no area it goes to the inbox, where you can sort it later.',
  primaryAction: 'Capture',
} as const;

/** 8. Inbox — What have I not sorted yet? */
export const inbox = {
  eyebrow: 'Inbox',
  heading: 'Three unsorted',
  giveItAnArea: 'Give it an area',
  footerNote: 'An item stays here until it has an area. Nothing here expires.',
} as const;

/** 9. Week — What am I committing to? */
export const week = {
  eyebrow: 'This week',
  heading: 'Four areas, ten sessions',
  action: 'Change the rhythm',
} as const;

/** 10. Review — What did I attend, and what went unattended? */
export const review = {
  eyebrow: 'Week of 7 September',
  heading: 'Six sessions',
  attendedLabel: 'Attended',
  unattendedLabel: 'Unattended',
  closingNote:
    'Unattended is a fact about the week, not about you. Next week starts with the same areas.',
  action: "Set this week's rhythm",
} as const;

/**
 * Back-control labels.
 *
 * FLAGGED: three of these are not in spec.md §"Screen copy". The design
 * file draws no navigation at all, so the spec's copy tables supply exactly
 * one back label — Area edit's `Back to areas` — while FR-028 requires a
 * way back on seven screens.
 *
 * Rather than invent a voice, they are built on that one approved string's
 * construction: `Back to ` plus the destination screen's own name,
 * lowercased, using the name Home's bottom navigation already gives it.
 * Session is absent on purpose: its switch action and both closing actions
 * already lead to the Picker, and a fourth control going the same place
 * would fail Article III's addition test.
 */
export const back = {
  home: 'Back to home',
  areas: 'Back to areas',
  week: 'Back to week',
  review: 'Back to review',
} as const;

/* ==================================================================== 002
 *
 * Feature 002's strings, approved in
 * specs/002-domain-logic/spec.md §"Screen copy".
 *
 * The rule that shapes this section: **a template is one approved sentence
 * with holes, never a sentence built from fragments.** A derivation picks
 * which template applies and fills it. If you find yourself joining two
 * exports with a `+`, the sentence you want is a template that does not
 * exist yet (data-model.md §"Screen copy").
 *
 * Every hole takes an **already-formatted** string. `numberWord` and
 * `dayName` live in lib/derive/format.ts and run before the template does,
 * which is why these take `count: string` rather than `count: number`:
 * `Four areas, ten sessions` capitalises the first and not the second, and
 * that is a decision the caller has already made.
 */

/** Agreement, not arithmetic. `One session` and `Two sessions` are one
 *  sentence in two forms, so the form lives with the sentence rather than
 *  in the derivation that fills it. Case-insensitive because the same count
 *  is capitalised at the start of a sentence and not in the middle. */
const s = (count: string) => (count.toLowerCase() === 'one' ? '' : 's');

/** 2. Areas — the headings, the footer, and the four removal explanations. */
export const areas002 = {
  headingNone: 'None right now',
  headingOne: 'One area',
  heading: (count: string) => `${count}, in your order`,

  noteNone: 'You removed the last one. Name another whenever you want.',
  /** With one area there is nothing to reorder against, so the whole note
   *  is replaced rather than trimmed (spec.md §"Screen copy"). */
  footerNoteOne: 'Tap the area to change its name, color or rhythm.',

  /** The rhythm line, which 001 stored whole as `rhythmLabel`. */
  rhythm: (count: string, daily: boolean) =>
    `${count} session${s(count)} a week · ${daily ? 'in' : 'not in'} Home daily`,

  /** Four forms by what the area holds. All four state what happens to the
   *  tasks *and* to the past sessions before anything is removed. */
  removalBoth: (area: string, tasks: string, sessions: string) =>
    `Removing ${area} keeps its ${tasks} tasks. They move to the inbox carrying the name, and its ${sessions} past sessions stay in Review.`,
  removalNoTasks: (area: string, sessions: string) =>
    `Removing ${area} keeps its ${sessions} past sessions in Review.`,
  removalNoSessions: (area: string, tasks: string) =>
    `Removing ${area} moves its ${tasks} tasks to the inbox, carrying the name.`,
  removalNeither: (area: string) =>
    `Removing ${area} removes the name. Nothing else is in it.`,
} as const;

/** 4. Home — the lines under each card, the absence note, the empty cases.
 *  The heading is the day's name and nothing else, so it has no template
 *  here: `dayName` produces it whole. */
export const home002 = {
  attended: (minutes: string) => `Attended today, ${minutes} minutes`,
  /** FR-015b: a session in progress adds to the day, it does not replace
   *  it. `Tending now` stands alone only on the first session of the day. */
  tendingNow: 'Tending now',
  attendedAndTending: (minutes: string) =>
    `Attended today, ${minutes} minutes · tending now`,

  lastAttended: (day: string) => `Last attended ${day}.`,
  neverAttended: 'Not attended yet.',
  pastRhythm: (count: string) =>
    `Past the ${count} sessions you set for this week. Tend it anyway if it is what you want.`,

  /** One sentence naming the absent areas, never a line each (FR-022b).
   *  The one-area form is 001's string, which is singular throughout. */
  absenceNoteOne: (area: string, count: string) =>
    `${area} keeps a rhythm of ${count} session${s(count)} a week. It is not a daily area, so it does not wait for you here.`,
  absenceNoteMany: (names: string) =>
    `${names} keep a weekly rhythm. They are not daily areas, so they do not wait for you here.`,

  noDailyAreas:
    'No area waits for you here. You set each one to appear when you add it, so Home fills as you do.',
  /** Withheld while a session is open: something is waiting, and it is the
   *  session you are in (spec.md §"Screen copy"). */
  allAttended: 'Every daily area was attended today. Nothing is waiting.',

  reviewEntrySunday: 'The week closes tonight. Look back on it.',
  reviewEntryMonday: 'Last week closed. Look back on it.',
} as const;

/** 5. Picker — the two empty notes, and what starting here closes. */
export const picker002 = {
  /** The heading is the same either way; only the note distinguishes never
   *  having started from having finished. */
  headingEmpty: 'Nothing on the list',
  noteNeverStarted: (area: string) =>
    `Capture something for ${area}, or give an inbox item this area.`,
  noteAllDone: (area: string) =>
    `You closed everything on the ${area} list. Put something new on it when there is something.`,

  /** FR-015c. Shown only when the running session is on a task in another
   *  area; in this area, picking another task switches it and the 001
   *  footer note already says so. The title is interpolated verbatim and
   *  never truncated (spec.md §"Screen copy"). */
  stillRunning: (task: string) =>
    `A session on ${task} is still running. Starting here closes it.`,

  /** A task's last-session note has three answers, not 001's two. The
   *  middle one is the person's own note, returned as it was written. */
  neverAttended: 'Not attended yet.',
  attendedNoNote: 'Attended. No note left.',
} as const;

/** 8. Inbox — the count, the captured label, the empty state. */
export const inbox002 = {
  heading: (count: string) => `${count} unsorted`,
  headingEmpty: 'Nothing unsorted',
  noteEmpty: 'Everything you captured has an area.',
  captured: (day: string) => `Captured ${day}`,
} as const;

/** 9. Week — the heading, the row lines, the route to last week. */
export const week002 = {
  heading: (areaCount: string, sessionCount: string) =>
    `${areaCount} areas, ${sessionCount} sessions`,
  sessionsLabel: (count: string) => `${count} session${s(count)}`,
  rowLine: (tasks: string, sessions: string) =>
    `${tasks} task${s(tasks)} on the list. ${sessions} session${s(sessions)} attended.`,
  /** Only the first sentence is replaced; the second follows the ordinary
   *  rule, agreement included (spec.md §"Screen copy"). */
  rowLineNoTasks: (sessions: string) =>
    `No tasks on the list. ${sessions} session${s(sessions)} attended.`,
  /** String 27, approved 2026-09-26 (FR-007a). A row with no sessions says
   *  so rather than writing `Zero sessions attended.`; whole sentences for
   *  both cases, so nothing is joined from fragments. */
  rowLineNoSessions: (tasks: string) =>
    `${tasks} task${s(tasks)} on the list. No sessions attended.`,
  rowLineNothing: 'No tasks on the list. No sessions attended.',
  noTasksAnywhere:
    'No tasks on any list. The rhythms are set; tasks are what fill them.',
  /** A tertiary text link beneath `Change the rhythm`, not a button, and
   *  present on every day (FR-019b). */
  lastWeekLink: 'Look back on last week',
} as const;

/** 10. Review — the week, the counts, the minutes, the open session.
 *
 *  The unattended row's line is NOT here. 001 wrote one per area — Morning
 *  pages reads `No sessions this week. The pages are where you left them.`
 *  — which is prose about that area and cannot be derived from state. It is
 *  raised at the Phase 3 checkpoint rather than invented here (FR-027). */
export const review002 = {
  eyebrow: (date: string) => `Week of ${date}`,
  heading: (count: string) => `${count} session${s(count)}`,
  headingNone: 'No sessions',
  noteNone: 'Nothing was attended this week.',

  sessionsLabel: (count: string) => `${count} session${s(count)}`,
  /** When the label carries the minutes, as the single-session row does. */
  sessionsLabelWithMinutes: (count: string, minutes: string) =>
    `${count} session${s(count)}, ${minutes} minutes`,

  rowLine: (minutes: string, note: string) => `${minutes} minutes. Last note: ${note}`,
  rowLineNoNote: (minutes: string) => `${minutes} minutes. No note this time.`,
  /** FR-008a. Minutes report the closed sessions; the open one is named so
   *  a short figure is explained rather than merely short. */
  rowLineOpenWithNote: (minutes: string, note: string) =>
    `${minutes} minutes. One still open. Last note: ${note}`,
  rowLineOpenNoNote: (minutes: string) =>
    `${minutes} minutes. One still open. No note this time.`,
  /** No figure at all: a zero would be a number where there is no
   *  measurement yet. */
  rowLineOnlyOpen: 'One still open. Minutes are recorded when it closes.',

  /** Shown in place of the empty Unattended section, and the closing note
   *  is then not shown at all: there is nothing to explain. */
  everyAreaAttended: 'Every area was attended this week.',
} as const;
