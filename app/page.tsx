import Link from 'next/link';

import { StickyFooter } from '@/components/sticky-footer';
import { Button } from '@/components/ui/button';
import { AreaCard } from '@/features/home/area-card';
import { ReviewEntry } from '@/features/home/review-entry';
import { home as copy } from '@/lib/copy';
import { areaById, homeCardsInSortOrder } from '@/lib/fixtures';

/**
 * Home — what am I tending right now?
 *
 * The day's areas and nothing else. No inbox list, no week list, no
 * history: those live in the bottom navigation, which carries exactly
 * `Capture · Inbox · Week` and no Areas entry (FR-013, FR-029). Areas is
 * reached from Week and from Review, where changing a rhythm is the thing
 * you are already doing.
 *
 * Home is the root. It shows no back control (FR-028).
 *
 * People is missing from the list because it is not a daily area, and the
 * absence note says so rather than letting it vanish silently (FR-015).
 * Article IV's copy voice: explain the absence.
 */
export default function HomePage() {
  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/45">
            {copy.eyebrow}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{copy.heading}</h1>
          <ReviewEntry />
        </div>

        {/* Single column, always. A second column is more content, not more
            breathing room (design system §4). */}
        <div className="grid grid-cols-1 gap-3">
          {homeCardsInSortOrder.map((card) => {
            const area = areaById(card.areaId);
            if (!area) return null;
            return <AreaCard key={card.areaId} area={area} card={card} />;
          })}
        </div>

        <p className="text-xs text-muted-foreground/50 text-pretty">{copy.absenceNote}</p>
      </div>

      <StickyFooter data-testid="bottom-nav" className="flex gap-1">
        <Button asChild variant="ghost" className="flex-1">
          <Link href="/capture">{copy.nav.capture}</Link>
        </Button>
        <Button asChild variant="ghost" className="flex-1">
          <Link href="/inbox">{copy.nav.inbox}</Link>
        </Button>
        <Button asChild variant="ghost" className="flex-1">
          <Link href="/week">{copy.nav.week}</Link>
        </Button>
      </StickyFooter>
    </>
  );
}
