import Link from 'next/link';

import { BackLink } from '@/components/back-link';
import { StickyFooter } from '@/components/sticky-footer';
import { Button } from '@/components/ui/button';
import { WeekRow } from '@/features/week/week-row';
import { week as copy } from '@/lib/copy';
import { areaById, weekRows } from '@/lib/fixtures';
import { areasHref, backForScreen } from '@/lib/routes';

/**
 * Week — what am I committing to?
 *
 * Four areas, ten sessions. People is absent, as the artboard draws it and
 * as clarification Q3 settled: the Week screen stays exactly as approved,
 * and it was Home's absence note that was rewritten instead.
 *
 * `Change the rhythm` is one of the two ways into Areas (FR-029), and it
 * carries `?from=week` so leaving Areas comes back here.
 */
export default function WeekPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-5 pb-[var(--footer-h,9rem)]">
        <BackLink target={backForScreen('/week')} />

        <div className="flex flex-col gap-1.5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/45">
            {copy.eyebrow}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{copy.heading}</h1>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {weekRows.map((row) => {
            const area = areaById(row.areaId);
            if (!area) return null;
            return <WeekRow key={row.areaId} area={area} row={row} />;
          })}
        </div>
      </div>

      <StickyFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={areasHref('week')}>{copy.action}</Link>
        </Button>
      </StickyFooter>
    </div>
  );
}
