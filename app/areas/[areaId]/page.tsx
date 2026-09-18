import { notFound } from 'next/navigation';

import { AreaEditScreen } from '@/features/areas/area-edit-screen';
import { areaById } from '@/lib/fixtures';

/** Area edit, editing an area that exists. The name field carries the
 *  area's value; every control shows that area's current option. */
export default async function AreaEditPage({ params }: { params: Promise<{ areaId: string }> }) {
  const { areaId } = await params;
  const area = areaById(areaId);
  if (!area) notFound();

  return (
    <AreaEditScreen
      areaId={area.id}
      name={area.name}
      color={area.color}
      rhythm={area.rhythm}
      isDaily={area.isDaily}
    />
  );
}
