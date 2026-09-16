import Link from 'next/link';

import { AreaDot } from '@/components/area-dot';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { home as copy } from '@/lib/copy';
import { pickerHref } from '@/lib/routes';
import type { Area, HomeCard } from '@/lib/fixtures';

/**
 * An area on Home, in one of FR-014's three treatments.
 *
 * The treatment arrives on the fixture. Nothing here compares a count
 * against a rhythm to decide that Money is past its — the fixture says so,
 * and that is what keeps this component free of the judgement feature 002
 * will make in lib/ (data-model.md).
 *
 * `past-rhythm` differs from `to-tend` by the button's variant and by the
 * line above it, and by nothing else. There is no red, no warning icon and
 * no disabled state: a budget warns and keeps recording, it never blocks
 * (Article I).
 */
export function AreaCard({ area, card }: { area: Area; card: HomeCard }) {
  if (card.treatment === 'attended') {
    /* Collapsed to one line, and it loses its Tend button — there is
       nothing left to do here today. `opacity-55` is the entire treatment
       for a finished thing (design system §6): no strikethrough, no grey
       palette swap. It wraps rather than truncating at 320px. */
    return (
      <Card
        data-testid="area-card"
        className="flex min-h-11 flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2 opacity-55"
      >
        <AreaDot color={area.color} />
        <span className="text-base font-semibold tracking-tight">{area.name}</span>
        <span className="text-sm text-muted-foreground">{card.line}</span>
      </Card>
    );
  }

  return (
    <Card data-testid="area-card" className="flex flex-col gap-3.5 p-5">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <AreaDot color={area.color} />
          <span className="text-base font-semibold tracking-tight">{area.name}</span>
        </div>
        <p className="text-sm text-muted-foreground text-pretty">{card.line}</p>
      </div>
      <Button
        asChild
        variant={card.treatment === 'past-rhythm' ? 'outline' : 'default'}
        className="w-full"
      >
        <Link href={pickerHref(area.id)}>{copy.tendAction}</Link>
      </Button>
    </Card>
  );
}
