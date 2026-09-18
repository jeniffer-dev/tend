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
  lastSessionLabel: 'Last session',
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
