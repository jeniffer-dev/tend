'use client';

import { useCallback, useRef, useState } from 'react';

import { AreaRow } from '@/features/areas/area-row';
import { RemoveConfirmation } from '@/features/areas/remove-confirmation';
import type { Area } from '@/lib/fixtures';

type Band = { top: number; bottom: number; height: number };

/**
 * The reorderable list of areas.
 *
 * Dragging is hand-rolled on pointer events rather than HTML5 drag-and-drop,
 * which does not fire on touch at all — and this is a mobile-web app, so a
 * reorder that only works with a mouse is not a reorder. Article VI presumes
 * a drag-and-drop dependency rejected, and none is needed.
 *
 * THE ROW IS NOT REORDERED UNTIL IT IS RELEASED. An earlier build reordered
 * the list live *and* translated the dragged row by the finger's full
 * travel, which double-counted: once the row had moved into its new slot,
 * the transform carried it the same distance again and it ran away at twice
 * the speed of the finger. Now the order is committed once, on release, so
 * the row lands exactly where it is let go. What moves during the drag is
 * the dragged row, under the finger, and the rows it displaces, which slide
 * by its height to open the gap.
 *
 * The bands are the rows as laid out when the drag began — not a single row
 * height, because the rows are not all the same height: a longer rhythm line
 * wraps at 320px, and a uniform step lands the drop a row short there.
 *
 * The order is not saved. A reload returns the fixture order (FR-003), and
 * the screen never claims otherwise.
 */
export function AreaList({
  areas,
  confirmingAreaId,
}: {
  areas: Area[];
  /** Set when Area edit sent the person here to decide (FR-011). */
  confirmingAreaId?: string | null;
}) {
  const [order, setOrder] = useState(() => areas.map((a) => a.id));
  const [confirmingId, setConfirmingId] = useState<string | null>(confirmingAreaId ?? null);
  const [drag, setDrag] = useState<{
    id: string;
    dy: number;
    startY: number;
    from: number;
    to: number;
  } | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const bands = useRef<Band[]>([]);
  /* The live drag, mirrored outside React state. `commit` reads it here
     rather than from inside a setDrag updater: a state updater must be
     pure, and React re-invokes it under StrictMode — which applied the
     move twice, the second time to the already-moved array, so the row
     came straight back and the drag looked like it had done nothing. */
  const dragRef = useRef<typeof drag>(null);

  const byId = useCallback((id: string) => areas.find((a) => a.id === id)!, [areas]);

  const onReorderPointerDown = useCallback(
    (id: string) => (event: React.PointerEvent<HTMLButtonElement>) => {
      const rows = [...(listRef.current?.querySelectorAll('[data-testid="area-row"]') ?? [])];
      bands.current = rows.map((row) => {
        const r = row.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, height: r.height };
      });

      // Captured on the handle, so every later move and the release land
      // here even when the finger travels well outside the 44px control.
      event.currentTarget.setPointerCapture(event.pointerId);
      setConfirmingId(null);

      const from = order.indexOf(id);
      const next = { id, dy: 0, startY: event.clientY, from, to: from };
      dragRef.current = next;
      setDrag(next);
    },
    [order]
  );

  const onReorderPointerMove = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    const current = dragRef.current;
    if (!current) return;

    const dy = event.clientY - current.startY;
    const start = bands.current[current.from];
    let to = current.to;

    if (start) {
      // Where the dragged row's middle now sits, in the layout the drag
      // started from. The band it lands in is the target index.
      const centre = (start.top + start.bottom) / 2 + dy;
      const found = bands.current.findIndex((b) => centre >= b.top && centre <= b.bottom);
      to = found === -1 ? (centre < bands.current[0].top ? 0 : bands.current.length - 1) : found;
    }

    const next = { ...current, dy, to };
    dragRef.current = next;
    setDrag(next);
  }, []);

  const commit = useCallback(() => {
    const current = dragRef.current;
    dragRef.current = null;
    setDrag(null);
    if (!current || current.to === current.from) return;

    setOrder((o) => {
      const next = [...o];
      next.splice(current.to, 0, ...next.splice(current.from, 1));
      return next;
    });
  }, []);

  const onReorderKeyDown = useCallback(
    (id: string) => (event: React.KeyboardEvent<HTMLButtonElement>) => {
      const delta = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0;
      if (delta === 0) return;
      event.preventDefault();
      setOrder((o) => {
        const from = o.indexOf(id);
        const to = Math.max(0, Math.min(o.length - 1, from + delta));
        if (from === to) return o;
        const next = [...o];
        next.splice(to, 0, ...next.splice(from, 1));
        return next;
      });
    },
    []
  );

  /** How far a row that is not the dragged one should slide to open the gap.
   *  Only the rows between where the drag started and where it is now move,
   *  and they move by the dragged row's height. */
  const displacement = (index: number): number => {
    if (!drag || index === drag.from) return 0;
    const height = bands.current[drag.from]?.height ?? 0;
    const gap = 10; // gap-2.5, the list's own spacing
    if (drag.to > drag.from && index > drag.from && index <= drag.to) return -(height + gap);
    if (drag.to < drag.from && index < drag.from && index >= drag.to) return height + gap;
    return 0;
  };

  return (
    <div ref={listRef} className="grid grid-cols-1 gap-2.5">
      {order.map((id, index) => {
        const area = byId(id);
        const isDragging = drag?.id === id;
        const shift = isDragging ? drag.dy : displacement(index);

        if (confirmingId === id) {
          return <RemoveConfirmation key={id} area={area} onKeep={() => setConfirmingId(null)} />;
        }

        return (
          <div
            key={id}
            style={shift ? { transform: `translateY(${shift}px)` } : undefined}
            /* No transition on the transform. Article V permits
               transition-colors and nothing else, so a displaced row moves
               at once rather than sliding. */
            className={isDragging ? 'relative z-10 touch-none select-none' : undefined}
          >
            <AreaRow
              area={area}
              isDragging={isDragging}
              onReorderPointerDown={onReorderPointerDown(id)}
              onReorderPointerMove={onReorderPointerMove}
              onReorderPointerUp={commit}
              onReorderKeyDown={onReorderKeyDown(id)}
            />
          </div>
        );
      })}
    </div>
  );
}
