import Link from 'next/link';

import { BackLink } from '@/components/back-link';
import { StickyFooter } from '@/components/sticky-footer';
import { Button } from '@/components/ui/button';
import { AreaList } from '@/features/areas/area-list';
import { areas as copy } from '@/lib/copy';
import { areas as fixtureAreas } from '@/lib/fixtures';
import { backForAreas } from '@/lib/routes';

/**
 * Areas — what am I paying attention to?
 *
 * The five areas in `sortOrder`, each with its colour, name and rhythm line.
 * No Tend button: this is where you decide what exists, not where you act on
 * it (contracts/screens.md).
 *
 * `?confirm=<areaId>` opens that row in the removal confirmation. Area edit
 * sends the person here to decide: it may start a removal and may never
 * execute one, because the screen that explains the consequences is the
 * screen that decides (FR-011, contracts/screens.md).
 *
 * Areas is the one screen whose back control is conditional. It returns to
 * whichever screen opened it — Week or Review — and renders no control at
 * all when First run opened it, because First run describes a state that no
 * longer exists once an area has been named (FR-030, FR-031). The branch is
 * in lib/routes.ts; this page only asks it.
 */
export default async function AreasPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; confirm?: string }>;
}) {
  const { from, confirm } = await searchParams;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-5">
        <BackLink target={backForAreas(from)} />

        <div className="flex flex-col gap-1.5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/45">
            {copy.eyebrow}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{copy.heading}</h1>
        </div>

        <AreaList
          areas={[...fixtureAreas].sort((a, b) => a.sortOrder - b.sortOrder)}
          confirmingAreaId={confirm}
        />

        <p className="text-xs text-muted-foreground/50 text-pretty">{copy.footerNote}</p>
      </div>

      <StickyFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href="/areas/new">{copy.secondaryAction}</Link>
        </Button>
      </StickyFooter>
    </div>
  );
}
