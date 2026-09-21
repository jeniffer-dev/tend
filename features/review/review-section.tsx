import { AreaDot } from '@/components/area-dot';
import { Card } from '@/components/ui/card';
import { areaById, type ReviewRow } from '@/lib/fixtures';

/**
 * One labelled section of the Review — `Attended` or `Unattended`.
 *
 * Minutes live inside the row strings and appear nowhere else in the
 * product but the session clock and Home's attended line (SC-006). They are
 * a plain figure about what happened, not a score.
 *
 * An unattended area is faded to `opacity-55`, the whole treatment for a
 * thing that is not live (design system §6). It is not red, it is not
 * marked, and it carries no icon: absence is a fact about the week, and
 * Article I forbids the screen making it a fact about the person.
 */
export function ReviewSection({ label, rows }: { label: string; rows: ReviewRow[] }) {
  return (
    <section data-testid="review-section" data-label={label} className="flex flex-col gap-3">
      <p className="text-xs uppercase tracking-widest text-muted-foreground/45">{label}</p>

      {rows.map((row) => {
        const area = areaById(row.areaId);
        if (!area) return null;

        const name = (
          <span className="flex items-center gap-2">
            <AreaDot color={area.color} />
            <span className="text-base font-semibold tracking-tight">{area.name}</span>
          </span>
        );

        /* The row with a sessions label and no line — Home's `One session,
           15 minutes` — sits on one line, as drawn. */
        if (row.sessionsLabel && !row.line) {
          return (
            <Card
              key={row.areaId}
              data-testid="review-row"
              data-area={area.id}
              className="flex flex-wrap items-center justify-between gap-3 p-5"
            >
              {name}
              <span className="text-sm text-muted-foreground">{row.sessionsLabel}</span>
            </Card>
          );
        }

        return (
          <Card
            key={row.areaId}
            data-testid="review-row"
            data-area={area.id}
            className={`flex flex-col gap-1.5 p-5${row.attended ? '' : ' opacity-55'}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              {name}
              {row.sessionsLabel && (
                <span className="text-sm text-muted-foreground">{row.sessionsLabel}</span>
              )}
            </div>
            {row.line && <p className="text-sm text-muted-foreground text-pretty">{row.line}</p>}
          </Card>
        );
      })}
    </section>
  );
}
