/**
 * The fixture set for feature 001 — the visual shell.
 *
 * THE RULE THAT GOVERNS EVERY SHAPE HERE (data-model.md):
 *
 *   Fixtures store the string that is displayed, never the inputs a
 *   component would have to reduce.
 *
 * FR-002 forbids computing anything at render time and Article VI makes a
 * duration or percentage computed inside a component a defect. If this file
 * stored `sessionsCommitted: 3` and `sessionsAttended: 2`, then Week's row
 * copy — `Three tasks on the list. Two sessions attended.` — could only be
 * produced by a component turning numbers into words. So it stores the
 * sentence.
 *
 * It looks redundant. It is deliberate: it makes the "no logic in
 * components" gate impossible to fail by accident, and it makes feature
 * 002's job visible — that feature replaces these literal strings with
 * functions in lib/, and the components do not change.
 *
 * Nothing here is persisted and nothing is validated. `areaId` is a string
 * that happens to match an `Area.id`; there is no foreign key.
 */

/* ---------------------------------------------------------------- types */

/** The design system's brand tokens (§2). Colour encodes the area, never a
 *  status — there is no red here and none is reachable. */
export type AreaColor = 'soft' | 'recovery' | 'primary' | 'load' | 'peak';

/** The brand hex for each token, so no component ever writes a colour
 *  literal. Dots and bars use the brand hex; buttons and rings use the
 *  semantic token in globals.css. Same green, two vocabularies (§2 rule 4). */
export const areaColorHex: Record<AreaColor, string> = {
  soft: '#ADEEE3',
  recovery: '#86DEB7',
  primary: '#64B493',
  load: '#F5A65B',
  peak: '#FCD581',
};

export type Rhythm = 1 | 2 | 3 | 4 | 5;

export type Area = {
  id: string;
  name: string;
  color: AreaColor;
  /** The whole displayed line, e.g. `Three sessions a week · in Home daily`.
   *  Never assembled from `rhythm` and `isDaily` at render time. */
  rhythmLabel: string;
  /** For the Area edit control's selected state only. */
  rhythm: Rhythm;
  /** For the Area edit control's selected state only. */
  isDaily: boolean;
  sortOrder: number;
  /** What the removal confirmation says about this area, whole. It names
   *  what happens to the tasks *and* to the past sessions, which is what
   *  FR-011 requires before anything destructive is offered.
   *
   *  Money's is the approved string, verbatim. The other four are fixture
   *  data written on its construction, the same class of thing as the
   *  fixture task titles: the design draws this state only for Money, and
   *  giving the fixture the sentence was preferred to giving the component
   *  two counts to assemble one from. */
  removalExplanation: string;
};

/** FR-014's three treatments, one-to-one. */
export type HomeTreatment = 'to-tend' | 'past-rhythm' | 'attended';

export type HomeCard = {
  areaId: string;
  /** The fixture's own field. Nothing compares a count against a rhythm to
   *  decide that Money is past its rhythm — the fixture says so. */
  treatment: HomeTreatment;
  line: string;
};

export type Task = {
  id: string;
  title: string;
  /** null = it sits in the inbox. */
  areaId: string | null;
  onWeekList: boolean;
  /** `Not attended yet.` when there is none — never an empty string, so the
   *  Picker shows a last-session row rather than a gap (spec.md, edge cases). */
  lastSessionNote: string;
};

export type InboxItem = {
  id: string;
  title: string;
  /** A string, not a date. A date would invite formatting logic in a
   *  component, and Article II forbids the framing a date usually attracts. */
  capturedLabel: string;
};

export type SessionState = 'running' | 'zero' | 'past';

export type SessionFixture = {
  state: SessionState;
  /** A string. There is no timer in this feature (FR-004) and no arithmetic
   *  that could turn seconds into `+17:04`. */
  clock: string;
  clockNote: string;
  /** '' when running. */
  noteValue: string;
};

export type WeekRow = {
  areaId: string;
  sessionsLabel: string;
  line: string;
};

export type ReviewRow = {
  areaId: string;
  attended: boolean;
  /** Absent on the unattended row: the design gives that row an area name
   *  and a line, and no sessions label. Inventing one would be a new
   *  approved string, and the spec has exactly one of those already. */
  sessionsLabel?: string;
  line?: string;
};

/* -------------------------------------------------------------- the set */

/** Five areas, in the order the Areas screen draws them and Home renders
 *  them. One of them — People — is not a daily area.
 *
 *  The colour assignment is this plan's, recorded in data-model.md so
 *  implementation and review agree: the artboards draw a colour per area
 *  but do not label which token is which. */
export const areas: Area[] = [
  {
    id: 'morning-pages',
    name: 'Morning pages',
    color: 'peak',
    rhythmLabel: 'Three sessions a week · in Home daily',
    rhythm: 3,
    isDaily: true,
    sortOrder: 1,
    removalExplanation:
      'Removing Morning pages keeps its four tasks. They move to the inbox carrying the name, and its nine past sessions stay in Review.',
  },
  {
    id: 'health',
    name: 'Health',
    color: 'primary',
    rhythmLabel: 'Three sessions a week · in Home daily',
    rhythm: 3,
    isDaily: true,
    sortOrder: 2,
    removalExplanation:
      'Removing Health keeps its six tasks. They move to the inbox carrying the name, and its fourteen past sessions stay in Review.',
  },
  {
    id: 'home',
    name: 'Home',
    color: 'soft',
    rhythmLabel: 'Two sessions a week · in Home daily',
    rhythm: 2,
    isDaily: true,
    sortOrder: 3,
    removalExplanation:
      'Removing Home keeps its three tasks. They move to the inbox carrying the name, and its seven past sessions stay in Review.',
  },
  {
    id: 'people',
    name: 'People',
    color: 'recovery',
    rhythmLabel: 'One session a week · not in Home daily',
    rhythm: 1,
    isDaily: false,
    sortOrder: 4,
    removalExplanation:
      'Removing People keeps its two tasks. They move to the inbox carrying the name, and its four past sessions stay in Review.',
  },
  {
    id: 'money',
    name: 'Money',
    color: 'load',
    rhythmLabel: 'Two sessions a week · in Home daily',
    rhythm: 2,
    isDaily: true,
    sortOrder: 5,
    removalExplanation:
      'Removing Money keeps its five tasks. They move to the inbox carrying the name, and its eleven past sessions stay in Review.',
  },
];

/** Home's cards, in `sortOrder` (FR-013). People is absent because it is
 *  not a daily area; Home explains the absence rather than hiding it. */
export const homeCards: HomeCard[] = [
  {
    areaId: 'morning-pages',
    treatment: 'to-tend',
    line: 'Last attended Thursday.',
  },
  {
    areaId: 'health',
    treatment: 'to-tend',
    line: 'Two sessions this week. Last attended Monday.',
  },
  {
    areaId: 'home',
    treatment: 'attended',
    line: 'Attended today, 15 minutes',
  },
  {
    areaId: 'money',
    treatment: 'past-rhythm',
    line: 'Past the two sessions you set for this week. Tend it anyway if it is what you want.',
  },
];

/** Health's three week-list tasks are the ones the Picker is drawn for.
 *  Morning pages and Money each carry one so that tapping their Tend button
 *  does not reach an empty Picker — the alternative was inventing copy for
 *  an empty state (data-model.md). These two titles are fixture data, one
 *  person's example, not user-facing product strings.
 *
 *  The three with no area are the inbox's; they carry a capturedLabel
 *  instead of a last-session note. */
export const tasks: Task[] = [
  {
    id: 'book-the-blood-test',
    title: 'Book the blood test',
    areaId: 'health',
    onWeekList: true,
    lastSessionNote: 'Found the lab. Need the referral number from the clinic.',
  },
  {
    id: 'refill-the-prescription',
    title: 'Refill the prescription',
    areaId: 'health',
    onWeekList: true,
    lastSessionNote: 'Not attended yet.',
  },
  {
    id: 'walk-three-mornings',
    title: 'Walk three mornings',
    areaId: 'health',
    onWeekList: true,
    lastSessionNote: 'Two mornings so far. Thursday is open.',
  },
  {
    id: 'three-pages-longhand',
    title: 'Three pages, longhand',
    areaId: 'morning-pages',
    onWeekList: true,
    lastSessionNote: 'Not attended yet.',
  },
  {
    id: 'reconcile-september',
    title: 'Reconcile September',
    areaId: 'money',
    onWeekList: true,
    lastSessionNote: 'Not attended yet.',
  },
];

export const inboxItems: InboxItem[] = [
  {
    id: 'ask-the-dentist',
    title: 'Ask the dentist about the night guard',
    capturedLabel: 'Captured Monday',
  },
  {
    id: 'look-up-the-bike-shop',
    title: 'Look up the bike shop that does tune-ups',
    capturedLabel: 'Captured Monday',
  },
  {
    id: 'read-back-the-notes',
    title: 'Read back the notes from the workshop',
    capturedLabel: 'Captured last Thursday',
  },
];

/** The three states of one session against one task. They differ in the
 *  clock string, the clock note and the note content — and in nothing else
 *  (FR-019, SC-007). The past state counts upward with a `+`; it is styled
 *  exactly as the running state, with no red and no pulsing (FR-006). */
export const sessionStates: Record<SessionState, SessionFixture> = {
  running: {
    state: 'running',
    clock: '14:16',
    clockNote: 'Fifteen minutes on Health.',
    noteValue: '',
  },
  zero: {
    state: 'zero',
    clock: '0:00',
    clockNote: 'Fifteen minutes. The session keeps recording from here.',
    noteValue: 'Called the lab. They need the referral number before they will book.',
  },
  past: {
    state: 'past',
    clock: '+17:04',
    clockNote: 'Thirty-two minutes on Health. Close it when you are ready.',
    noteValue: 'Referral number found in the old email. Booked for the 22nd, 8:40.',
  },
};

/** Four areas, ten sessions. People is absent, per clarification Q3 — the
 *  Week screen stays exactly as drawn. No minutes here (FR-022). */
export const weekRows: WeekRow[] = [
  {
    areaId: 'health',
    sessionsLabel: 'Three sessions',
    line: 'Three tasks on the list. Two sessions attended.',
  },
  {
    areaId: 'morning-pages',
    sessionsLabel: 'Three sessions',
    line: 'One session attended. Wednesday and Friday are open.',
  },
  {
    areaId: 'money',
    sessionsLabel: 'Two sessions',
    line: 'Both sessions attended. Anything further is extra.',
  },
  {
    areaId: 'home',
    sessionsLabel: 'Two sessions',
    line: 'Two tasks on the list. One session attended.',
  },
];

/** Attended first, then unattended (FR-023). Minutes appear inside these
 *  strings and on no other screen but the session clock and Home's
 *  attended line (SC-006). */
export const reviewRows: ReviewRow[] = [
  {
    areaId: 'health',
    attended: true,
    sessionsLabel: 'Three sessions',
    line: '52 minutes. Last note: found the lab, need the referral number.',
  },
  {
    areaId: 'money',
    attended: true,
    sessionsLabel: 'Two sessions',
    line: '31 minutes. Last note: statements sorted through August.',
  },
  {
    areaId: 'home',
    attended: true,
    sessionsLabel: 'One session, 15 minutes',
  },
  {
    areaId: 'morning-pages',
    attended: false,
    line: 'No sessions this week. The pages are where you left them.',
  },
];

/** What is still to be tended sorts above what was attended today.
 *  `to-tend` and `past-rhythm` rank together: both are still open, and a
 *  past-rhythm area is no less tendable than any other (Article I — a
 *  budget warns, it never blocks). */
const homeGroupRank = (card: HomeCard): number => (card.treatment === 'attended' ? 1 : 0);

const sortOrderOf = (areaId: string): number =>
  areas.find((area) => area.id === areaId)?.sortOrder ?? 0;

/**
 * Home's display order (FR-013, FR-013a — contracts/screens.md §`/`).
 *
 * Two keys: the attended areas sink below the ones still open, and
 * `sortOrder` governs within each group. The order a person set on the
 * Areas screen is therefore never rearranged — the attended cards move as
 * a block and nothing else changes place.
 *
 * The rule lives here rather than in the component. Ordering by a stored
 * field is not a calculation, but it is still a rule, and Article VI keeps
 * rules out of components. It also makes the requirement structural: Home
 * cannot drift out of this order without this file changing.
 *
 * Why attended sinks: what has been attended today is no longer an answer
 * to *what am I tending right now?*. It stays on screen so the day reads as
 * complete, but an attended row sitting between two Tend buttons pushes
 * live work below the fold, and Home has to be actionable in one tap from
 * cold start (Article III).
 */
export const homeCardsInDisplayOrder: HomeCard[] = [...homeCards].sort(
  (a, b) => homeGroupRank(a) - homeGroupRank(b) || sortOrderOf(a.areaId) - sortOrderOf(b.areaId)
);

/** What Area edit starts from when creating rather than editing.
 *
 *  Taken from the prototype script embedded in the approved design file —
 *  the designer's own values — rather than invented: rhythm 3, On Home
 *  `Every day`, and the fifth palette colour (spec.md §"Editing vs.
 *  creating"). */
export const CREATING_DEFAULTS = {
  color: 'peak' as AreaColor,
  rhythm: 3 as Rhythm,
  isDaily: true,
} as const;

/** The areas Capture offers as chips, in the order the artboard draws them
 *  — which is not `sortOrder`. Held as ids so no component has to turn a
 *  chip's label back into an area to find its colour. */
export const captureChipAreaIds = ['health', 'morning-pages', 'money', 'home'] as const;

/* --------------------------------------------------------------- access */
/* Plain lookups over arrays. Not a query layer, and nothing here derives a
   displayed value — each returns fixture rows as they are stored. */

export function areaById(id: string): Area | undefined {
  return areas.find((area) => area.id === id);
}

export function weekListTasksForArea(areaId: string): Task[] {
  return tasks.filter((task) => task.areaId === areaId && task.onWeekList);
}

export function taskById(id: string): Task | undefined {
  return tasks.find((task) => task.id === id);
}
