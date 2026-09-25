'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { StickyFooter } from '@/components/sticky-footer';
import { Button } from '@/components/ui/button';
import { AreaCard } from '@/features/home/area-card';
import { ReviewEntry } from '@/features/home/review-entry';
import { home as copy } from '@/lib/copy';
import { unarchivedAreas } from '@/lib/derive/counting';
import { homeView } from '@/lib/derive/screens';
import { useToday } from '@/lib/state/clock';
import { useAppState } from '@/lib/state/provider';

/**
 * Home — what am I tending right now?
 *
 * The day's areas and nothing else. No inbox list, no week list, no
 * history: those live in the bottom navigation, which carries exactly
 * `Capture · Inbox · Week` and no Areas entry. Areas is reached from Week
 * and from Review, where changing a rhythm is the thing you are already
 * doing.
 *
 * Home is the root. It shows no back control.
 *
 * **Every value on this screen is one call away.** `homeView` returns the
 * heading, the cards with their treatments and lines, the absence note, the
 * review entry and the empty note — finished, in one call, so this
 * component cannot combine them wrongly (contracts/derivations.md).
 *
 * It reads `useToday`, not the ticking clock. Nothing here can change more
 * than once a day, so nothing here re-renders once a second while a session
 * runs (plan.md §"Performance Goals").
 */
export default function HomePage() {
  const state = useAppState();
  const now = useToday();
  const router = useRouter();
  const empty = unarchivedAreas(state).length === 0;

  /*
   * FR-025, FR-025a — the route to First run lives on `/` alone. No other
   * screen redirects, which is what keeps `None right now` on Areas
   * reachable: that is the screen you are standing on when you remove the
   * last area.
   *
   * It has to happen after mount, not during render. `/` is prerendered,
   * and at prerender there is no `?seed=001` and therefore no area — so a
   * redirect during render is baked into the static response and every
   * seeded visit is sent to First run before the client ever reads the
   * query. That is one bug with two faces: the seeded path is unreachable,
   * and the empty path appears to work.
   */
  useEffect(() => {
    if (empty) router.replace('/first-run');
  }, [empty, router]);

  if (empty) return null;

  const view = homeView(state, now);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-5 pb-[var(--footer-h,15rem)]">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/45">
            {copy.eyebrow}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{view.heading}</h1>
          {view.reviewEntry ? <ReviewEntry line={view.reviewEntry} /> : null}
        </div>

        {/* Single column, always. A second column is more content, not more
            breathing room (design system §4). */}
        <div className="grid grid-cols-1 gap-3">
          {view.cards.map((card) => (
            <AreaCard key={card.areaId} card={card} />
          ))}
        </div>

        {view.emptyNote ? (
          <p data-testid="home-empty-note" className="text-sm text-muted-foreground text-pretty">
            {view.emptyNote}
          </p>
        ) : null}

        {/* One sentence naming the absent areas, never a line each. With
            none absent there is no sentence at all (FR-022, FR-022b). */}
        {view.absenceNote ? (
          <p data-testid="absence-note" className="text-xs text-muted-foreground/50 text-pretty">
            {view.absenceNote}
          </p>
        ) : null}
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
    </div>
  );
}
