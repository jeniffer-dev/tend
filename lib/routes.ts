/**
 * The navigation topology: the route table, and the back rule from FR-028
 * through FR-033.
 *
 * The back rule has a branch in it — Area edit always returns to Areas, but
 * Areas returns to whichever screen opened it, and returns nowhere at all
 * when that screen was First run. A rule with a branch expressed inline in a
 * component is exactly what Article VI exists to prevent, and it would be
 * duplicated across every screen that draws a back control.
 *
 * Browser history was rejected for this: router.back() gives the wrong
 * destination when a screen is deep-linked or reloaded, and FR-031 requires
 * Areas to render *no* back control in one specific case, which history
 * cannot express (research.md §5).
 */

import { back as backCopy } from './copy';

/** Who opened Areas. Carried as `?from=` because Areas is the one screen
 *  whose back control depends on where it was reached from (FR-030). */
export type Opener = 'week' | 'review' | 'first-run';

export type BackTarget = { href: string; label: string };

export type ScreenRoute = {
  /** The path as Next.js resolves it. */
  path: string;
  /** A concrete path to visit — the same as `path` unless it is dynamic. */
  href: string;
  screen: string;
  /** The screen's one question (contracts/screens.md). */
  question: string;
};

/** Every screen, with a visitable href. The tests walk this rather than
 *  hardcoding a list that would drift (FR-001). */
export const routes: ScreenRoute[] = [
  { path: '/first-run', href: '/first-run', screen: 'First run', question: 'Where do I start?' },
  { path: '/', href: '/', screen: 'Home', question: 'What am I tending right now?' },
  { path: '/areas', href: '/areas', screen: 'Areas', question: 'What am I paying attention to?' },
  {
    path: '/areas/[areaId]',
    href: '/areas/health',
    screen: 'Area edit',
    question: 'What is this area, and how often?',
  },
  {
    path: '/areas/new',
    href: '/areas/new',
    screen: 'Area edit (creating)',
    question: 'What is this area, and how often?',
  },
  {
    path: '/tend/[areaId]',
    href: '/tend/health',
    screen: 'Picker',
    question: 'What do I focus on for fifteen minutes?',
  },
  {
    path: '/session/[taskId]',
    href: '/session/book-the-blood-test',
    screen: 'Session',
    question: 'What am I doing for these fifteen minutes?',
  },
  { path: '/capture', href: '/capture', screen: 'Capture', question: 'What did I just remember?' },
  { path: '/inbox', href: '/inbox', screen: 'Inbox', question: 'What have I not sorted yet?' },
  { path: '/week', href: '/week', screen: 'Week', question: 'What am I committing to?' },
  {
    path: '/review',
    href: '/review',
    screen: 'Review',
    question: 'What did I attend, and what went unattended?',
  },
];

/** Where each opener sends Areas back to. First run is absent on purpose:
 *  it describes a state that no longer exists once an area has been named,
 *  so there is nowhere behind Areas to go (FR-031). */
const areasBackByOpener: Record<Opener, BackTarget | null> = {
  week: { href: '/week', label: backCopy.week },
  review: { href: '/review', label: backCopy.review },
  'first-run': null,
};

export function isOpener(value: string | null | undefined): value is Opener {
  return value === 'week' || value === 'review' || value === 'first-run';
}

/** The back control for Areas, given who opened it. Returns null when Areas
 *  is a root — reached from First run, or reached directly. */
export function backForAreas(from: string | null | undefined): BackTarget | null {
  return isOpener(from) ? areasBackByOpener[from] : null;
}

/** Areas' own link out to Area edit, carrying the opener forward so that
 *  leaving Area edit lands on an Areas that still knows where it came from. */
export function areasHref(from?: Opener | null): string {
  return from ? `/areas?from=${from}` : '/areas';
}

/**
 * The back control for every screen but Areas, which has its own function
 * because its answer is conditional.
 *
 * Home and First run are roots and return null (FR-028). Session returns
 * null too: its switch action and both closing actions already lead to the
 * Picker, and a fourth control going to the same place would fail Article
 * III's addition test.
 */
export function backForScreen(path: string): BackTarget | null {
  switch (path) {
    case '/':
    case '/first-run':
    case '/session/[taskId]':
      return null;
    case '/areas/[areaId]':
    case '/areas/new':
      return { href: '/areas', label: backCopy.areas };
    case '/tend/[areaId]':
    case '/capture':
    case '/inbox':
    case '/week':
    case '/review':
      return { href: '/', label: backCopy.home };
    default:
      return null;
  }
}

/** Where the Session's switch action and both closing actions go: back to
 *  the Picker for the same area (contracts/screens.md). */
export function pickerHref(areaId: string): string {
  return `/tend/${areaId}`;
}

/**
 * The empty Area edit. Both First run's `Name your first area` (FR-032) and
 * Areas' `New area` (FR-033) open it — the same screen, by requirement.
 *
 * It carries no `?from=`, so leaving it lands on an Areas with no opener,
 * which renders as a root with no back control. That is exactly what FR-031
 * asks for when First run opened it: First run describes a state that no
 * longer exists once an area has been named, so there is nowhere behind
 * Areas to go.
 */
export const newAreaHref = '/areas/new';

/** Where a Picker's primary action goes. */
export function sessionHref(taskId: string): string {
  return `/session/${taskId}`;
}

/** Review with no parameter: the week closing on Sunday, and the week that
 *  last closed on any other day (FR-019d). Home's Review entry opens it. */
export const reviewHref = '/review';

/**
 * Week's `Look back on last week` (FR-019b): the week before the current
 * one, on every day. On Monday to Saturday that is the same week plain
 * `/review` shows, so returning from Areas lands where Review was; only on
 * Sunday do the two differ, and there the parameter is what says so.
 */
export const lastWeekReviewHref = '/review?week=last';
