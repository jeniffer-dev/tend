'use client';

import Link from 'next/link';

import { BackLink } from '@/components/back-link';
import { StickyFooter } from '@/components/sticky-footer';
import { Button } from '@/components/ui/button';
import { ReviewSection } from '@/features/review/review-section';
import { review as copy } from '@/lib/copy';
import { reviewView } from '@/lib/derive/screens';
import { areasHref, backForScreen } from '@/lib/routes';
import { useToday } from '@/lib/state/clock';
import { useAppState } from '@/lib/state/provider';

/**
 * Review — what did I attend, and what went unattended?
 *
 * Attended first, then Unattended (FR-008). The order is the argument: the
 * week is read as what happened, and only then as what did not.
 *
 * Which week, and everything said about it, comes from `reviewView`; this
 * component places it. The eyebrow names the week (FR-019c), so a person
 * who arrived from Week's link on a Sunday can see it is not this one.
 *
 * The closing note says unattended is a fact about the week and not about
 * the person. It is the last thing on the screen on purpose, and it is
 * absent when every area was attended, because there is nothing to explain.
 *
 * No chart, no trend, no comparison with last week, no total framed as a
 * score. Article III's v1 exclusions and contracts/screens.md both rule
 * them out, and a review that scores you is not a review.
 */
export function ReviewScreen({ which }: { which: 'default' | 'last' }) {
  const state = useAppState();
  const now = useToday();
  const view = reviewView(state, now, which);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 pb-[var(--footer-h,15rem)]">
        <BackLink target={backForScreen('/review')} />

        <div className="flex flex-col gap-1.5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/45">
            {view.eyebrow}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{view.heading}</h1>
          {view.headingNote && (
            <p className="text-sm text-muted-foreground text-pretty">{view.headingNote}</p>
          )}
        </div>

        {view.attended.length > 0 && (
          <ReviewSection label={copy.attendedLabel} rows={view.attended} />
        )}

        {view.everyAreaAttended ? (
          <p data-testid="review-every-area" className="text-sm text-muted-foreground text-pretty">
            {view.everyAreaAttended}
          </p>
        ) : (
          view.unattended.length > 0 && (
            <div className="flex flex-col gap-3">
              <ReviewSection label={copy.unattendedLabel} rows={view.unattended} faded />
              {view.closingNote && (
                <p className="text-xs text-muted-foreground/50 text-pretty">{view.closingNote}</p>
              )}
            </div>
          )
        )}
      </div>

      <StickyFooter>
        <Button asChild className="w-full">
          <Link href={areasHref('review')}>{copy.action}</Link>
        </Button>
      </StickyFooter>
    </div>
  );
}
