'use client';

import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { areaEdit as copy } from '@/lib/copy';
import { areaColorHex, type AreaColor, type Rhythm } from '@/lib/fixtures';
import { cn } from '@/lib/utils';

const COLOR_ORDER: AreaColor[] = ['soft', 'recovery', 'primary', 'load', 'peak'];
const RHYTHMS: Rhythm[] = [1, 2, 3, 4, 5];

/**
 * The area's name, colour, rhythm and whether it waits on Home (FR-012).
 *
 * Every control shows which option is selected, and shows it the way design
 * system §6 specifies for a chip — `border-foreground bg-foreground
 * text-background`, high contrast and no colour. The colour swatches are the
 * exception by necessity: a swatch *is* its colour, so selection there is
 * the ring around it, `border-foreground` at the same 2px the unselected
 * ones carry.
 *
 * Nothing is saved. The controls move because a control that cannot be
 * operated cannot be reviewed, and the footer note says plainly that changes
 * apply as you make them — which in this feature means they apply to the
 * screen and to nothing else (FR-003).
 *
 * There is no delete action here. Removal lives on Areas, where the
 * consequences are explained (contracts/screens.md).
 */
export function AreaForm({
  defaultName,
  defaultColor,
  defaultRhythm,
  defaultIsDaily,
}: {
  defaultName: string;
  defaultColor: AreaColor;
  defaultRhythm: Rhythm;
  defaultIsDaily: boolean;
}) {
  const [color, setColor] = useState<AreaColor>(defaultColor);
  const [rhythm, setRhythm] = useState<Rhythm>(defaultRhythm);
  const [isDaily, setIsDaily] = useState(defaultIsDaily);

  /* design system §6's selected chip, in one place so the three controls
     cannot drift apart. */
  const chip = (selected: boolean) =>
    cn(
      'flex h-11 flex-1 items-center justify-center rounded-md border text-sm font-medium transition-colors',
      selected
        ? 'border-foreground bg-foreground text-background'
        : 'border-border bg-card hover:bg-muted'
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="area-name"
          className="text-xs uppercase tracking-widest text-muted-foreground/45"
        >
          {copy.nameLabel}
        </label>
        <Input
          id="area-name"
          type="text"
          defaultValue={defaultName}
          placeholder={copy.namePlaceholder}
          className="h-12 bg-card px-3.5 text-lg tracking-[-0.01em]"
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground/45">
          {copy.colorLabel}
        </p>
        <div className="flex gap-2.5">
          {COLOR_ORDER.map((option) => (
            <button
              key={option}
              type="button"
              aria-label={copy.colorOptionLabels[option]}
              aria-pressed={color === option}
              onClick={() => setColor(option)}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-full border-2 bg-card transition-colors',
                color === option ? 'border-foreground' : 'border-border'
              )}
            >
              <span
                aria-hidden
                className="h-6 w-6 rounded-full"
                style={{ background: areaColorHex[option] }}
              />
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground/50 text-pretty">{copy.colorNote}</p>
      </div>

      <div className="flex flex-col gap-2.5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground/45">
          {copy.rhythmLabel}
        </p>
        {/* Five 44px controls plus four gaps plus the page gutter is the
            tightest row in the product, and it is the first thing to break
            at 320px. gap-2 keeps it on one row there. */}
        <div className="flex gap-2">
          {RHYTHMS.map((n, i) => (
            <button
              key={n}
              type="button"
              aria-pressed={rhythm === n}
              onClick={() => setRhythm(n)}
              className={cn(chip(rhythm === n), 'text-base')}
            >
              {copy.rhythmOptions[i]}
            </button>
          ))}
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
          {copy.rhythmNote}
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground/45">
          {copy.onHomeLabel}
        </p>
        <div className="flex gap-2">
          <button type="button" aria-pressed={isDaily} onClick={() => setIsDaily(true)} className={chip(isDaily)}>
            {copy.onHomeOptions[0]}
          </button>
          <button
            type="button"
            aria-pressed={!isDaily}
            onClick={() => setIsDaily(false)}
            className={chip(!isDaily)}
          >
            {copy.onHomeOptions[1]}
          </button>
        </div>
        <p className="text-xs text-muted-foreground/50 text-pretty">{copy.onHomeNote}</p>
      </div>
    </div>
  );
}
