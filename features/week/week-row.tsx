'use client';

import { AreaDot } from '@/components/area-dot';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { WeekRow as WeekRowView } from '@/lib/derive/screens';
import { useNowGetter } from '@/lib/state/clock';
import { useDispatch } from '@/lib/state/provider';

/**
 * One area's row on the Week screen: its name, the sessions committed, and
 * the line about what is on the list and what has been attended.
 *
 * Every string arrives derived. Nothing here turns a pair of counts into
 * `Two sessions attended.`, and nothing here compares one count to another
 * (Article VI).
 *
 * **No minutes (FR-007).** Week counts in sessions; minutes are a fact
 * about what happened and they belong on Review. The derivation that would
 * produce a minute total is not offered to this screen at all, which is a
 * stronger guarantee than remembering not to render one.
 *
 * **A non-daily row carries its way to Home** (FR-022c, User Story 6). The
 * row is handed `Add it to Home today` or `On Home today.` or neither, and
 * renders whichever it was handed: it never sees `isDaily` or the day the
 * area was added. The action is the Button primitive's `ghost` variant at
 * `size="touch"` — 44px, no new value — and it is a button rather than a
 * link because it changes state and leaves the person here. The moment it
 * records comes from `useNowGetter()`, as every transition's does, never
 * from the day clock, which is frozen at the start of the day. The note
 * that replaces it is plain text in the same place.
 *
 * It is the only reason this component is a client one: it dispatches.
 *
 * FLAGGED — no progress bar. The WEEK artboard draws a 2px bar per row,
 * filled to 66% / 33% / 100% / 50%. contracts/screens.md §`/week` says this
 * screen must not have "a percentage, a progress bar framed as a target",
 * and a bar filled to the fraction of a rhythm is exactly that. It is left
 * out rather than argued away; putting it in is a contract amendment, not
 * an implementation detail.
 */
export function WeekRow({ row }: { row: WeekRowView }) {
  const dispatch = useDispatch();
  const getNow = useNowGetter();

  return (
    <Card data-testid="week-row" data-area={row.areaId} className="flex flex-col gap-3.5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <AreaDot color={row.color} />
          <span className="text-base font-semibold tracking-tight">{row.name}</span>
        </span>
        <span className="text-sm text-muted-foreground">{row.sessionsLabel}</span>
      </div>
      <p className="text-sm text-muted-foreground text-pretty">{row.line}</p>

      {row.homeAction && (
        <Button
          type="button"
          variant="ghost"
          size="touch"
          className="-mx-4 self-start"
          onClick={() => dispatch({ type: 'addToHomeToday', now: getNow(), areaId: row.areaId })}
        >
          {row.homeAction}
        </Button>
      )}
      {row.onHomeNote && (
        <p data-testid="week-row-on-home" className="flex min-h-11 items-center text-sm text-muted-foreground">
          {row.onHomeNote}
        </p>
      )}
    </Card>
  );
}
