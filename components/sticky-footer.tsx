'use client';

import { useLayoutEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

/**
 * Design system §4's sticky footer, in one place.
 *
 * Primary actions sit within thumb reach at the bottom of the viewport
 * (Article IV). The gradient fade is what keeps content legible as it
 * scrolls under the bar.
 *
 * `mt-auto` is what anchors it. `sticky bottom-0` alone only pins the bar
 * once the content is tall enough to scroll; on a short screen the bar sat
 * directly under the last paragraph with half a phone of empty space below
 * it. The auto margin eats that space.
 *
 * `-mb-8` cancels the page container's own `pb-8`, which would otherwise
 * leave 32px of background below the bar. What remains under the action is
 * the footer's own `pb-6` — 24px, the artboard's bottom padding.
 *
 * It only works under two conditions, and both are load-bearing:
 *
 * - The content beside it grows: that wrapper carries `flex-1`.
 * - The footer is NOT a direct sibling under the page container's
 *   `space-y-4`. Tailwind's space utility sets `margin-top` *and*
 *   `margin-bottom` on every later sibling, so as a direct child the footer
 *   silently lost both `mt-auto` and `-mb-8`. A screen with a footer wraps
 *   its content and its footer in one flex column.
 *
 * ## Why it publishes its height
 *
 * A bar pinned with `sticky bottom-0` covers whatever content is under it
 * for the whole of the scroll, and only uncovers it at the very last pixel
 * — where the last line then sits flush against the bar with no gap at all.
 * On Review that put the closing note behind `Set this week's rhythm`.
 *
 * So the bar measures itself and publishes `--footer-h` on its parent, and
 * every content wrapper reserves that much room beneath itself. The wrapper
 * is `flex-1`, so the reservation is absorbed by the free space on a screen
 * that already fits and only adds scroll where it is actually needed — a
 * fixed padding would have made short screens scroll for nothing.
 *
 * It is measured rather than hardcoded because the three footer shapes
 * differ — one action, one action and a note, two actions — and the note
 * wraps to a second line at 320px.
 *
 * **The `9rem` fallback in `pb-[var(--footer-h,9rem)]` is not decoration.**
 * This effect runs at hydration, and until it does the variable is unset.
 * Without a fallback the first paint reserves nothing, which is the bug
 * again — briefly on a fast machine, and not briefly on a slow phone. 9rem
 * is the tallest footer, so the pre-hydration reservation is never short;
 * the observer only ever refines it downwards.
 */
export function StickyFooter({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const bar = ref.current;
    const parent = bar?.parentElement;
    if (!bar || !parent) return;

    const publish = () => parent.style.setProperty('--footer-h', `${bar.offsetHeight}px`);
    publish();

    const observer = new ResizeObserver(publish);
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        'sticky bottom-0 -mb-8 mt-auto bg-gradient-to-t from-background from-60% to-transparent pb-6 pt-7',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
