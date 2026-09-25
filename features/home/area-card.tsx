'use client';

import Link from 'next/link';

import { AreaDot } from '@/components/area-dot';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { home as copy } from '@/lib/copy';
import type { HomeCard } from '@/lib/derive/screens';
import { pickerHref } from '@/lib/routes';

/**
 * An area on Home, in one of four treatments.
 *
 * **The treatment and the line both arrive derived.** Nothing here compares
 * a count against a rhythm to decide that Money is past its, and nothing
 * here turns minutes into a sentence — `lib/derive/screens.ts` did both,
 * and handing this component two numbers is how it would eventually be
 * asked to divide them (Article VI, plan.md §"The second gate").
 *
 * `tending-now` is 002's fourth treatment and a treatment in its own right,
 * not a variant of `attended`: the card must not be able to render a figure
 * that does not exist yet (FR-015a). Its line is whichever of the two
 * sentences applies, and the card is handed the finished one.
 *
 * `past-rhythm` differs from `to-tend` by the button's variant and by the
 * line above it, and by nothing else. There is no red, no warning icon and
 * no disabled state: a budget warns and keeps recording, it never blocks
 * (Article I).
 */
export function AreaCard({ card }: { card: HomeCard }) {
  if (card.treatment === 'attended') {
    /* Collapsed to one line, and it loses its Tend button — there is
       nothing left to do here today. `opacity-55` is the entire treatment
       for a finished thing (design system §6): no strikethrough, no grey
       palette swap. It wraps rather than truncating at 320px. */
    return (
      <Card
        data-testid="area-card"
        data-treatment={card.treatment}
        className="flex min-h-11 flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2 opacity-55"
      >
        <AreaDot color={card.color} />
        <span className="text-base font-semibold tracking-tight">{card.name}</span>
        <span className="text-sm text-muted-foreground">{card.line}</span>
      </Card>
    );
  }

  return (
    <Card
      data-testid="area-card"
      data-treatment={card.treatment}
      className="flex flex-col gap-3.5 p-5"
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <AreaDot color={card.color} />
          <span className="text-base font-semibold tracking-tight">{card.name}</span>
        </div>
        <p className="text-sm text-muted-foreground text-pretty">{card.line}</p>
      </div>
      <Button
        asChild
        variant={card.treatment === 'past-rhythm' ? 'outline' : 'default'}
        className="w-full"
      >
        <Link href={pickerHref(card.areaId)}>{copy.tendAction}</Link>
      </Button>
    </Card>
  );
}
