import Link from 'next/link';

import { BackLink } from '@/components/back-link';
import { StickyFooter } from '@/components/sticky-footer';
import { Button } from '@/components/ui/button';
import { ReviewSection } from '@/features/review/review-section';
import { review as copy } from '@/lib/copy';
import { reviewRows } from '@/lib/fixtures';
import { areasHref, backForScreen } from '@/lib/routes';

/**
 * Review — what did I attend, and what went unattended?
 *
 * Attended first, then Unattended (FR-023). The order is the argument: the
 * week is read as what happened, and only then as what did not.
 *
 * The closing note says unattended is a fact about the week and not about
 * the person (FR-024). It is the last thing on the screen on purpose.
 *
 * No chart, no trend, no comparison with last week, no total framed as a
 * score. Article III's v1 exclusions and contracts/screens.md both rule
 * them out, and a review that scores you is not a review.
 */
export default function ReviewPage() {
  const attended = reviewRows.filter((row) => row.attended);
  const unattended = reviewRows.filter((row) => !row.attended);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 pb-[var(--footer-h,9rem)]">
        <BackLink target={backForScreen('/review')} />

        <div className="flex flex-col gap-1.5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/45">
            {copy.eyebrow}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{copy.heading}</h1>
        </div>

        <ReviewSection label={copy.attendedLabel} rows={attended} />

        <div className="flex flex-col gap-3">
          <ReviewSection label={copy.unattendedLabel} rows={unattended} />
          <p className="text-xs text-muted-foreground/50 text-pretty">{copy.closingNote}</p>
        </div>
      </div>

      <StickyFooter>
        <Button asChild className="w-full">
          <Link href={areasHref('review')}>{copy.action}</Link>
        </Button>
      </StickyFooter>
    </div>
  );
}
