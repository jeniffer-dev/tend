import Link from 'next/link';
import { notFound } from 'next/navigation';

import { StickyFooter } from '@/components/sticky-footer';
import { Button } from '@/components/ui/button';
import { SessionClock } from '@/features/session/session-clock';
import { SessionNote } from '@/features/session/session-note';
import { session as copy } from '@/lib/copy';
import { areaById, sessionStates, taskById, type SessionState } from '@/lib/fixtures';
import { pickerHref } from '@/lib/routes';

/**
 * Session — what am I doing for these fifteen minutes?
 *
 * One component renders all three states (FR-019). They differ in the clock
 * string, the clock note and the note content, and in nothing else — which
 * is guaranteed here by construction rather than by discipline, because
 * there is only one layout and the three fixtures flow through it.
 *
 * `?state=` selects the fixture and defaults to running. It is an
 * inspection affordance for review and for Playwright, never a control: a
 * visible state switcher would fail Article III's addition test on a screen
 * whose one question is what you are doing right now. There is no pause and
 * no stop either — the two closing actions are the whole of it.
 *
 * No back control. The switch action and both closing actions already lead
 * to the Picker, and a fourth control going the same place is an addition
 * that removing would not break.
 */
function isSessionState(value: string | undefined): value is SessionState {
  return value === 'running' || value === 'zero' || value === 'past';
}

export default async function SessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ taskId: string }>;
  searchParams: Promise<{ state?: string }>;
}) {
  const { taskId } = await params;
  const { state } = await searchParams;

  const task = taskById(taskId);
  if (!task || !task.areaId) notFound();

  const area = areaById(task.areaId);
  if (!area) notFound();

  const fixture = sessionStates[isSessionState(state) ? state : 'running'];

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-7">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/45">
            {copy.eyebrow(area.name)}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-pretty">{task.title}</h1>
          <Link
            href={pickerHref(area.id)}
            className="-ml-2.5 inline-flex min-h-11 items-center self-start rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {copy.switchAction(area.name)}
          </Link>
        </div>

        <SessionClock session={fixture} />

        <SessionNote value={fixture.noteValue} />
      </div>

      <StickyFooter className="flex flex-col gap-1">
        <Button asChild className="w-full">
          <Link href={pickerHref(area.id)}>{copy.doneForNow}</Link>
        </Button>
        <Button asChild variant="ghost" className="w-full">
          <Link href={pickerHref(area.id)}>{copy.markItDone}</Link>
        </Button>
      </StickyFooter>
    </div>
  );
}
