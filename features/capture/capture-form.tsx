'use client';

import { useState } from 'react';

import { AreaDot } from '@/components/area-dot';
import { Textarea } from '@/components/ui/textarea';
import { capture as copy } from '@/lib/copy';
import { areaById, captureChipAreaIds } from '@/lib/fixtures';
import { cn } from '@/lib/utils';

/**
 * Capture — what did I just remember?
 *
 * Exactly one text field, and the area is optional with nothing preselected
 * (FR-020). No date field, no priority control, no second field: capture
 * protects the session from becoming a sorting exercise, and every control
 * added here is one more decision between remembering a thing and being rid
 * of it.
 *
 * The field is a four-row Textarea, as the artboard draws it. Constitution
 * Article VI admits it here as its third case (amended 1.2.0): something
 * the person has just remembered and needs room to put down, even though
 * they will not re-read it. The size of a field is not only about how the
 * text is read later — it is about what it invites while it is written, and
 * a one-line box makes a person edit the thought down before it is out.
 *
 * A chip toggles off as readily as on. Nothing is stored (FR-003).
 */
export function CaptureForm() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <Textarea
        aria-label={copy.eyebrow}
        rows={4}
        placeholder={copy.fieldPlaceholder}
        className="min-h-[104px] rounded-xl bg-card p-4 text-lg leading-snug tracking-[-0.01em] shadow-sm"
      />

      <div className="flex flex-col gap-2.5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground/45">
          {copy.areaLabel}
        </p>
        <div className="flex flex-wrap gap-2">
          {captureChipAreaIds.map((areaId) => {
            const area = areaById(areaId)!;
            const isSelected = selected === areaId;
            return (
              <button
                key={areaId}
                type="button"
                aria-pressed={isSelected}
                // Tapping the selected chip clears it: the area is optional,
                // so there has to be a way back to none.
                onClick={() => setSelected(isSelected ? null : areaId)}
                className={cn(
                  'flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors',
                  isSelected
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-card hover:bg-muted'
                )}
              >
                <AreaDot color={area.color} />
                {area.name}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground/50 text-pretty">{copy.footerNote}</p>
      </div>
    </div>
  );
}
