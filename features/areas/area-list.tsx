'use client';

import { useCallback, useRef, useState } from 'react';

import { AreaRow } from '@/features/areas/area-row';
import { RemoveConfirmation } from '@/features/areas/remove-confirmation';
import type { Area } from '@/lib/fixtures';

/**
 * The reorderable list of areas.
 *
 * Dragging is hand-rolled on pointer events rather than HTML5 drag-and-drop,
 * which does not fire on touch at all — and this is a mobile-web app, so a
 * reorder that only works with a mouse is not a reorder. Article VI presumes
 * a drag-and-drop dependency rejected, and none is needed: the whole
 * interaction is a pointer capture, a translation, and an index swap.
 *
 * The same handle also takes ArrowUp and ArrowDown, so the list is operable
 * without a pointer. That adds no element to the screen, so it has nothing
 * to answer to Article III's addition test.
 *
 * The order is not saved. A reload returns the fixture order (FR-003), and
 * the screen never claims otherwise.
 */
export function AreaList({ areas }: { areas: Area[] }) {
  const [order, setOrder] = useState(() => areas.map((a) => a.id));
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; dy: number; offset: number } | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  /* The rows as they were laid out when the drag began. Bands, not a single
     row height: the rows are not all the same height — a longer rhythm line
     wraps at 320px — so a uniform step would land the drop one row short. */
  const metrics = useRef<{ bands: Array<{ top: number; bottom: number }>; startIndex: number }>({
    bands: [],
    startIndex: 0,
  });

  const byId = useCallback((id: string) => areas.find((a) => a.id === id)!, [areas]);

  const move = useCallback((id: string, to: number) => {
    setOrder((current) => {
      const from = current.indexOf(id);
      const target = Math.max(0, Math.min(current.length - 1, to));
      if (from === target) return current;
      const next = [...current];
      next.splice(target, 0, ...next.splice(from, 1));
      return next;
    });
  }, []);

  const onReorderPointerDown = useCallback(
    (id: string) => (event: React.PointerEvent<HTMLButtonElement>) => {
      const rows = [...(listRef.current?.querySelectorAll('[data-testid="area-row"]') ?? [])];
      metrics.current = {
        bands: rows.map((row) => {
          const r = row.getBoundingClientRect();
          return { top: r.top, bottom: r.bottom };
        }),
        startIndex: order.indexOf(id),
      };

      // Captured on the handle, so every later move and the release land
      // here even when the finger travels well outside the 44px control.
      event.currentTarget.setPointerCapture(event.pointerId);
      setConfirmingId(null);
      setDrag({ id, dy: 0, offset: event.clientY });
    },
    [order]
  );

  const onReorderPointerMove = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      setDrag((current) => {
        if (!current) return current;
        const dy = event.clientY - current.offset;
        const { bands, startIndex } = metrics.current;
        const start = bands[startIndex];

        if (start) {
          // Where the dragged row's middle now sits, in the layout the drag
          // started from. The band it lands in is the target index.
          const centre = (start.top + start.bottom) / 2 + dy;
          let target = bands.findIndex((b) => centre >= b.top && centre <= b.bottom);
          if (target === -1) target = centre < bands[0].top ? 0 : bands.length - 1;
          move(current.id, target);
        }
        return { ...current, dy };
      });
    },
    [move]
  );

  const onReorderPointerUp = useCallback(() => setDrag(null), []);

  const onReorderKeyDown = useCallback(
    (id: string) => (event: React.KeyboardEvent<HTMLButtonElement>) => {
      const delta = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0;
      if (delta === 0) return;
      event.preventDefault();
      move(id, order.indexOf(id) + delta);
    },
    [move, order]
  );

  return (
    <div ref={listRef} className="grid grid-cols-1 gap-2.5">
      {order.map((id) => {
        const area = byId(id);
        const isDragging = drag?.id === id;

        if (confirmingId === id) {
          return (
            <RemoveConfirmation key={id} area={area} onKeep={() => setConfirmingId(null)} />
          );
        }

        return (
          <div
            key={id}
            style={isDragging ? { transform: `translateY(${drag.dy}px)`, zIndex: 10 } : undefined}
            className={isDragging ? 'relative' : undefined}
          >
            <AreaRow
              area={area}
              isDragging={isDragging}
              onReorderPointerDown={onReorderPointerDown(id)}
              onReorderPointerMove={onReorderPointerMove}
              onReorderPointerUp={onReorderPointerUp}
              onReorderKeyDown={onReorderKeyDown(id)}
              onRemove={() => setConfirmingId(id)}
            />
          </div>
        );
      })}
    </div>
  );
}
