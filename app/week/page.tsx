'use client';

import Link from 'next/link';

import { BackLink } from '@/components/back-link';
import { StickyFooter } from '@/components/sticky-footer';
import { Button } from '@/components/ui/button';
import { WeekRow } from '@/features/week/week-row';
import { week as copy, week002 } from '@/lib/copy';
import { weekView } from '@/lib/derive/screens';
import { useToday } from '@/lib/state/clock';
import { useAppState } from '@/lib/state/provider';
import { areasHref, backForScreen, lastWeekReviewHref } from '@/lib/routes';

/**
 * Week — what am I committing to?
 *
 * The heading and every row are derived from the rhythms and the sessions
 * that exist. An open session is already counted here (FR-006a) and Week
 * says nothing about it being open, because Week has no minutes for the
 * omission to explain: the count is simply correct.
 *
 * `Change the rhythm` is one of the two ways into Areas, and it carries
 * `?from=week` so leaving Areas comes back here.
 *
 * `Look back on last week` is a tertiary text link beneath it, never a
 * button, and present on every day (FR-019b). It passes Article III's
 * addition test on its merits: setting this week's rhythm without being
 * able to see the last one is deciding blind.
 */
export default function WeekPage() {
  const state = useAppState();
  const now = useToday();
  const view = weekView(state, now);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-5 pb-[var(--footer-h,15rem)]">
        <BackLink target={backForScreen('/week')} />

        <div className="flex flex-col gap-1.5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/45">
            {copy.eyebrow}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{view.heading}</h1>
        </div>

        {view.emptyNote ? (
          <p data-testid="week-empty-note" className="text-sm text-muted-foreground text-pretty">
            {view.emptyNote}
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-3">
          {view.rows.map((row) => (
            <WeekRow key={row.areaId} row={row} />
          ))}
        </div>
      </div>

      <StickyFooter className="flex flex-col gap-2">
        <Button asChild variant="outline" className="w-full">
          <Link href={areasHref('week')}>{copy.action}</Link>
        </Button>
        <Link
          href={lastWeekReviewHref}
          className="inline-flex min-h-11 items-center justify-center self-center rounded-md px-2.5 text-center text-xs text-muted-foreground/50 transition-colors hover:text-foreground"
        >
          {week002.lastWeekLink}
        </Link>
      </StickyFooter>
    </div>
  );
}
