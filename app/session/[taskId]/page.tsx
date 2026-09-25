'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { StickyFooter } from '@/components/sticky-footer';
import { Button } from '@/components/ui/button';
import { SessionClock } from '@/features/session/session-clock';
import { SessionNote } from '@/features/session/session-note';
import { session as copy } from '@/lib/copy';
import { activeSession } from '@/lib/derive/counting';
import { sessionView } from '@/lib/derive/screens';
import { useNowGetter, useTickingNow } from '@/lib/state/clock';
import { useAppState, useDispatch } from '@/lib/state/provider';
import { pickerHref } from '@/lib/routes';

/**
 * Session — what am I doing for these fifteen minutes?
 *
 * One layout, and the three moments of a session flow through it. They
 * differ in the clock string and the line beneath it, and in nothing else
 * (SC-003) — guaranteed by construction rather than by discipline, because
 * there is only one layout and only two strings change.
 *
 * `?state=` is gone. It was an inspection affordance for three static
 * fixtures and there is now one real clock; the requirement it served did
 * not retire with it, and tests/e2e/session-states.spec.ts moves `now`
 * instead.
 *
 * **The screen shows the running session's task, not the route's.** The
 * route names the task the session started on, and switching inside the
 * session changes one and not the other.
 *
 * It must not be reachable without a running session, and must not end one
 * by being navigated away from: the session ends when a closing action ends
 * it, and at no other moment (FR-012, FR-024).
 *
 * This is the one screen that subscribes to the ticking clock. Every other
 * screen reads the day-granularity moment, so a session running here
 * re-renders this component and nothing else (plan.md §"Performance
 * Goals").
 */
export default function SessionPage() {
  const state = useAppState();
  const dispatch = useDispatch();
  const getNow = useNowGetter();
  const router = useRouter();
  const running = activeSession(state);
  const isRunning = running !== null && running.endedAt === null;

  const now = useTickingNow(isRunning);
  const [note, setNote] = useState('');

  /*
   * Closing is a navigation this screen makes for itself, so it has to say
   * so. Without the flag, closing ends the session, the screen sees no
   * running session, and a redirect to Home races the push to the Picker —
   * which the closing action is supposed to land on.
   *
   * The redirect is also an effect rather than a render-time call, for the
   * same reason Home's is: a render-time redirect on a prerendered route is
   * baked into the static response, before the client has read `?seed=001`.
   */
  const leaving = useRef(false);

  useEffect(() => {
    if (!isRunning && !leaving.current) router.replace('/');
  }, [isRunning, router]);

  const view = isRunning ? sessionView(state, now) : null;

  /* Both closing actions record the same four things and differ in the
     outcome alone (FR-010, FR-013). `actualMinutes` is written here, once,
     and nothing recomputes it afterwards. */
  function close(outcome: 'completed' | 'progressed') {
    if (!running) return;
    leaving.current = true;
    const areaId = running.areaId;
    dispatch({ type: 'closeSession', now: getNow(), outcome, note });
    router.push(pickerHref(areaId));
  }

  if (!running || !view) return null;
  const areaId = running.areaId;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-7 pb-[var(--footer-h,15rem)]">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/45">
            {copy.eyebrow(view.areaName)}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-pretty">{view.taskTitle}</h1>
          {/* Switching goes through the Picker, which changes the task
              inside this session rather than starting another one: one
              session, `startedAt` untouched (FR-015). */}
          <Link
            href={pickerHref(areaId)}
            className="-ml-2.5 inline-flex min-h-11 items-center self-start rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {copy.switchAction(view.areaName)}
          </Link>
        </div>

        <SessionClock clock={view.clock} note={view.clockNote} />

        <SessionNote value={note} onChange={setNote} />
      </div>

      <StickyFooter className="flex flex-col gap-1">
        <Button className="w-full" onClick={() => close('progressed')}>
          {copy.doneForNow}
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => close('completed')}>
          {copy.markItDone}
        </Button>
      </StickyFooter>
    </div>
  );
}
