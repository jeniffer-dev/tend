import { AreaDot } from '@/components/area-dot';
import { Card } from '@/components/ui/card';
import type { ReviewRow } from '@/lib/derive/screens';

/**
 * One labelled section of the Review — `Attended` or `Unattended`.
 *
 * Every string arrives derived (`lib/derive/screens.ts`): the sessions
 * label, the minutes inside the line, the note, and whether a row is the
 * one-line single-session form. Nothing here counts, sums or compares.
 *
 * Minutes live inside the row strings and appear nowhere else in the
 * product but the session clock and Home's attended line (SC-006). They are
 * a plain figure about what happened, not a score.
 *
 * An unattended row is the area's name and nothing else (FR-008b), faded to
 * `opacity-55`, the whole treatment for a thing that is not live (design
 * system §6). It is not red, it is not marked, and it carries no icon:
 * absence is a fact about the week, and the closing note beneath the
 * section is what says so.
 */
export function ReviewSection({
  label,
  rows,
  faded = false,
}: {
  label: string;
  rows: ReviewRow[];
  faded?: boolean;
}) {
  return (
    <section data-testid="review-section" data-label={label} className="flex flex-col gap-3">
      <p className="text-xs uppercase tracking-widest text-muted-foreground/45">{label}</p>

      {rows.map((row) => {
        const name = (
          <span className="flex items-center gap-2">
            <AreaDot color={row.color} />
            <span className="text-base font-semibold tracking-tight">{row.name}</span>
          </span>
        );

        /* A label and no line — `One session, 15 minutes` — sits on one
           line, as drawn. So does an unattended row, which has neither. */
        if (!row.line) {
          return (
            <Card
              key={row.areaId}
              data-testid="review-row"
              data-area={row.areaId}
              className={`flex flex-wrap items-center justify-between gap-3 p-5${faded ? ' opacity-55' : ''}`}
            >
              {name}
              {row.sessionsLabel && (
                <span className="text-sm text-muted-foreground">{row.sessionsLabel}</span>
              )}
            </Card>
          );
        }

        return (
          <Card
            key={row.areaId}
            data-testid="review-row"
            data-area={row.areaId}
            className={`flex flex-col gap-1.5 p-5${faded ? ' opacity-55' : ''}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              {name}
              {row.sessionsLabel && (
                <span className="text-sm text-muted-foreground">{row.sessionsLabel}</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground text-pretty">{row.line}</p>
          </Card>
        );
      })}
    </section>
  );
}
