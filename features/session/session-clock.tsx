import { Card } from '@/components/ui/card';

/**
 * The session clock.
 *
 * It renders two strings and computes neither. `clockString` derives them
 * from `startedAt` and `now` in lib/, which is what makes the count
 * correct after a throttled tab rather than however far a counter got
 * (research.md §4).
 *
 * It has exactly one treatment in every state. Past zero the count carries
 * a `+` and keeps going, and the styling does not change by so much as a
 * shade: no red, no pulse, no countdown framing, nothing taken away
 * (FR-011, FR-012, Article V). The clock states the fact quietly and the
 * session keeps recording.
 *
 * Type comes from design system §3's session clock row — `tabular-nums` so
 * the digits do not jitter, and a clamp so a six-character clock does not
 * clip at 320px.
 */
export function SessionClock({ clock, note }: { clock: string; note: string }) {
  return (
    <Card className="flex flex-col items-center gap-2.5 px-5 py-8">
      <span
        data-testid="session-clock"
        className="text-[clamp(3.25rem,19.5vw,4.75rem)] font-medium leading-none tracking-[-0.03em] tabular-nums"
      >
        {clock}
      </span>
      {/* Two lines are reserved whether or not this state needs them. The
          clock note is one of the two things SC-003 permits to differ
          between the moments, and the running note is one line where the
          other two are two — without the reservation the note field below
          moves 20px down as the session passes zero, which is precisely the
          shift SC-003 forbids and the quickstart warns to look for. Two
          lines is the measured maximum at 320px, 390px and 720px. */}
      <span
        data-testid="session-clock-note"
        className="min-h-10 text-center text-sm text-muted-foreground text-pretty"
      >
        {note}
      </span>
    </Card>
  );
}
