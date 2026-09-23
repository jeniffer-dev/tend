import { AreaEditScreen } from '@/features/areas/area-edit-screen';
import { CREATING_DEFAULTS } from '@/lib/fixtures';

/**
 * Area edit, creating. The same screen, with the name field empty so its
 * placeholder shows.
 *
 * `/areas/new` is a static segment, so Next.js resolves it ahead of
 * `/areas/[areaId]` and this route is never shadowed by an area called
 * "new".
 *
 * The defaults are the design's own prototype values, not a fresh
 * judgement call (spec.md §"Editing vs. creating").
 */
export default function NewAreaPage() {
  return (
    <AreaEditScreen
      name=""
      color={CREATING_DEFAULTS.color}
      rhythm={CREATING_DEFAULTS.rhythm}
      isDaily={CREATING_DEFAULTS.isDaily}
    />
  );
}
