'use client';

import Link from 'next/link';

import { AreaDot } from '@/components/area-dot';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { home as copy } from '@/lib/copy';
import type { HomeCard, HomeTreatment } from '@/lib/derive/screens';
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
 * **Every treatment carries a Tend** (FR-015e). The four share one shape —
 * the line, then the button — and differ by the line and by the button's
 * variant alone: solid for an area still open (`to-tend`, `tending-now`),
 * outline for one past its rhythm or already attended today. There is no
 * red, no warning icon, no disabled state and no fade. A budget warns and
 * keeps recording, it never blocks (Article I), and an area attended this
 * morning can be tended again tonight — which is the only way Home reaches
 * `Attended today, {n} minutes · tending now` by tapping.
 *
 * The attended card used to collapse to one line at `opacity-55`, with no
 * button (001's FR-014). The fade is the design system's treatment for a
 * finished, inactive thing (§6), and an area that can be tended again is
 * neither; a faded button reads as disabled. Its line and its place below
 * the open cards (001's FR-013a) are what say it was attended.
 *
 * `tending-now` is 002's fourth treatment and a treatment in its own right,
 * not a variant of `attended`: the card must not be able to render a figure
 * that does not exist yet (FR-015a). Its line is whichever of the two
 * sentences applies, and the card is handed the finished one.
 */

/** Which treatments are quieter. A lookup, not a comparison: the card
 *  reads the treatment it was handed and decides nothing about the area. */
const outline: Record<HomeTreatment, boolean> = {
  'to-tend': false,
  'tending-now': false,
  'past-rhythm': true,
  attended: true,
};

export function AreaCard({ card }: { card: HomeCard }) {
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
        variant={outline[card.treatment] ? 'outline' : 'default'}
        className="w-full"
      >
        <Link href={pickerHref(card.areaId)}>{copy.tendAction}</Link>
      </Button>
    </Card>
  );
}
