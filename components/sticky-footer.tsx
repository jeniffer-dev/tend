import { cn } from '@/lib/utils';

/**
 * Design system §4's sticky footer, verbatim, in one place.
 *
 * Primary actions sit within thumb reach at the bottom of the viewport
 * (Article IV). The gradient fade is what keeps content legible as it
 * scrolls under the bar.
 *
 * `mt-auto` is what anchors it. `sticky bottom-0` alone only pins the bar
 * once the content is tall enough to scroll; on a short screen — Capture is
 * the clearest — the bar sat directly under the last paragraph with half a
 * phone of empty space below it. The auto margin eats that space, so the
 * action is at the bottom edge on every screen, which is where the artboard
 * draws it and where a thumb is.
 *
 * It only works under two conditions, and both are load-bearing:
 *
 * - The content beside it grows: that wrapper carries `flex-1`.
 * - The footer is NOT a direct sibling under the page container's
 *   `space-y-4`. Tailwind's space utility sets `margin-top` *and*
 *   `margin-bottom` on every later sibling, so as a direct child the footer
 *   silently lost both `mt-auto` and `-mb-8` and sat 32px short of the
 *   bottom. A screen with a footer wraps its content and its footer in one
 *   flex column, which is then the container's only child.
 *
 * `-mb-8` cancels the page container's own `pb-8`, which would otherwise
 * leave 32px of background below the bar and stop it reaching the bottom
 * edge. The container string is design system §4's, copied verbatim and not
 * to be edited; the footer is the one element that needs to sit outside its
 * bottom padding, so it reaches past it rather than the string changing.
 * What remains below the action is the footer's own `pb-6` — 24px, which is
 * the bottom padding the artboard draws.
 *
 * It exists as a component rather than a copied class string because seven
 * screens use it, and a value with seven homes is the drift the design
 * system's §9 documents: one copy goes stale and the stale one gets built.
 */
export function StickyFooter({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
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
