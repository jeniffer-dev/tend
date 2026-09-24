'use client';

/**
 * Time, and who is allowed to ask. T008.
 *
 * **Two granularities, and the split is the whole point.** A day name, a
 * captured label, a week boundary and a rhythm comparison cannot change
 * more than once a day. The session clock changes every second. Putting
 * both on one context would re-render every subscribed screen every second
 * while a session runs, which is the only performance constraint this
 * feature has, spent on nothing (plan.md §"Performance Goals").
 *
 * So the ticking value never enters a context at all. `useToday` subscribes
 * to something that changes at local midnight; `useTickingNow` owns a local
 * interval and re-renders exactly the component that called it. A screen
 * cannot accidentally subscribe to the tick, because there is nothing to
 * subscribe to.
 *
 * Both are the same argument to the same pure functions. No derivation can
 * tell which it was given, and none reads the clock itself (research.md §2).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { startOfDay } from '@/lib/derive/format';

type Frame = {
  /** The seeded moment, or null in the ordinary app. */
  origin: Date | null;
  /** `Date.now()` when the frame was fixed, so a seeded clock advances. */
  mountedAt: number;
};

type ClockValue = { frame: Frame; today: Date };

const ClockContext = createContext<ClockValue | null>(null);

/** The current moment in whichever frame we are standing in. A seeded tab
 *  reads `origin + real elapsed time`, so the clock runs rather than
 *  freezing (research.md §5). */
export function momentIn(frame: Frame): Date {
  if (!frame.origin) return new Date();
  return new Date(frame.origin.getTime() + (Date.now() - frame.mountedAt));
}

export function ClockProvider({ origin, children }: { origin: Date | null; children: ReactNode }) {
  /* Fixed once. A changing frame would restart the seeded clock on every
     render, which is the frozen clock wearing a different hat. */
  const frameRef = useRef<Frame | null>(null);
  if (frameRef.current === null) frameRef.current = { origin, mountedAt: Date.now() };
  const frame = frameRef.current;

  const [today, setToday] = useState(() => startOfDay(momentIn(frame)));

  useEffect(() => {
    /* Wake at the next local midnight, in this frame, and not before. No
       polling: a day boundary is one event, not sixty per minute. */
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const now = momentIn(frame);
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      timer = setTimeout(() => {
        setToday(startOfDay(momentIn(frame)));
        schedule();
      }, Math.max(1000, next.getTime() - now.getTime()));
    };
    schedule();
    return () => clearTimeout(timer);
  }, [frame]);

  const value = useMemo<ClockValue>(() => ({ frame, today }), [frame, today]);
  return <ClockContext.Provider value={value}>{children}</ClockContext.Provider>;
}

function useClock(): ClockValue {
  const value = useContext(ClockContext);
  if (!value) throw new Error('useClock outside ClockProvider');
  return value;
}

/**
 * The day-granularity moment every screen but the session clock reads.
 *
 * It is a real moment, not a date, because the derivations take `now` and
 * some of them ask the time of day. It simply stops changing between
 * midnights, which is as often as anything reading it can change.
 */
export function useToday(): Date {
  const { frame, today } = useClock();
  /* `today` is the dependency: the value is recomputed when the date turns
     over, and is stable within a day. */
  return useMemo(() => momentIn(frame), [frame, today]);
}

/** A moment on demand, for the transitions that need one. Not reactive:
 *  asking what time it is must not subscribe you to the answer changing. */
export function useNowGetter(): () => Date {
  const { frame } = useClock();
  return useCallback(() => momentIn(frame), [frame]);
}

/**
 * The ticking clock. One second, and **only the session clock calls it.**
 *
 * `active` is what stops a tick running on a screen with no session on it.
 * The interval lives in the calling component, so the re-render it causes
 * reaches that component and nothing above it.
 */
export function useTickingNow(active: boolean): Date {
  const { frame } = useClock();
  const [now, setNow] = useState(() => momentIn(frame));

  useEffect(() => {
    if (!active) return;
    setNow(momentIn(frame));
    const id = setInterval(() => setNow(momentIn(frame)), 1000);
    return () => clearInterval(id);
  }, [active, frame]);

  return now;
}
