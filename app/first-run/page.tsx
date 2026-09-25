import Link from 'next/link';

import { StickyFooter } from '@/components/sticky-footer';
import { Button } from '@/components/ui/button';
import { firstRun as copy } from '@/lib/copy';
import { areaColorHex } from '@/lib/fixtures';
import { newAreaHref } from '@/lib/routes';

/**
 * First run — where do I start?
 *
 * Seen once per person and never again. It is the only screen that sets the
 * expectation Tend brings no opinions of its own, which is why the closing
 * line is the one about nothing being set up in advance.
 *
 * It lists no area and suggests none (FR-009). The fixture names are one
 * person's example and must never become suggestions offered to someone new
 * (spec.md §Assumptions).
 *
 * There is no navigation to Home either: a person with no areas has no Home
 * to see. It is a root and shows no back control (FR-028).
 *
 * The heading uses the empty-screen title role (design system §3, added in
 * 1.8.0) — 30px, as the artboard draws it. This screen is the only place
 * that role is admitted: it carries nothing but an invitation, so there is
 * no content for the heading to compete with, and a page title set against
 * that much space reads as small rather than as calm.
 *
 * The dots are palette samples, not areas — there are no areas yet. Four of
 * the five, as drawn, and the contract asks for four.
 */
const SAMPLE_COLORS = ['soft', 'primary', 'peak', 'load'] as const;

export default function FirstRunPage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Centred, as drawn: the screen has little on it and the invitation
          sits in the middle rather than pinned under the status bar. */}
      <div className="flex flex-1 flex-col justify-center gap-6 pb-[var(--footer-h,15rem)]">
        <div className="flex flex-col gap-2.5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/45">
            {copy.eyebrow}
          </p>
          <h1 className="text-[30px] font-semibold leading-[1.15] tracking-[-0.025em] text-pretty">
            {copy.heading}
          </h1>
        </div>

        <div className="flex flex-col gap-3.5">
          {copy.body.map((paragraph) => (
            <p key={paragraph} className="text-base leading-relaxed text-muted-foreground text-pretty">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {SAMPLE_COLORS.map((color) => (
            <span
              key={color}
              aria-hidden
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: areaColorHex[color] }}
            />
          ))}
          <span className="text-xs text-muted-foreground/50">{copy.caption}</span>
        </div>
      </div>

      <StickyFooter className="flex flex-col gap-2">
        <Button asChild className="w-full">
          <Link href={newAreaHref}>{copy.primaryAction}</Link>
        </Button>
        <p className="text-center text-xs text-muted-foreground/50 text-pretty">
          {copy.footerNote}
        </p>
      </StickyFooter>
    </div>
  );
}
