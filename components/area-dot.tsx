import { areaColorHex, type AreaColor } from '@/lib/fixtures';

/**
 * The 8px dot that marks an area on Home, Areas, Week and Review.
 *
 * Per Article IV the colour encodes the area and never a status, so this
 * component takes an area's own colour token and has no variant for
 * anything else — there is no way to ask it for a warning colour because
 * there is no such thing here.
 *
 * `aria-hidden` because the area's name is always beside it: the dot is a
 * second encoding of something already written, not information of its own.
 */
export function AreaDot({ color }: { color: AreaColor }) {
  return (
    <span
      aria-hidden
      className="h-2 w-2 shrink-0 rounded-full"
      style={{ background: areaColorHex[color] }}
    />
  );
}
