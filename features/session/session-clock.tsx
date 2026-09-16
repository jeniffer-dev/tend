import { Card } from '@/components/ui/card';
import type { SessionFixture } from '@/lib/fixtures';

/**
 * The session clock.
 *
 * It does not tick (FR-004). It renders the fixture's string — `14:16`,
 * `0:00`, `+17:04` — and there is no arithmetic here that could turn
 * seconds into any of them.
 *
 * It has exactly one treatment in every state. Past zero the count carries
 * a `+` and keeps going, and the styling does not change by so much as a
 * shade: no red, no pulse, no countdown framing, nothing taken away
 * (FR-006, Article V). The clock states the fact quietly and the session
 * keeps recording.
 *
 * Type comes from design system §3's session clock row, added in 1.2.0 —
 * `tabular-nums` so the digits do not jitter, and a clamp so a
 * six-character clock does not clip at 320px.
 */
export function SessionClock({ session }: { session: SessionFixture }) {
  return (
    <Card className="flex flex-col items-center gap-2.5 px-5 py-8">
      <span className="text-[clamp(3.25rem,19.5vw,4.75rem)] font-medium leading-none tracking-[-0.03em] tabular-nums">
        {session.clock}
      </span>
      <span className="text-center text-sm text-muted-foreground text-pretty">
        {session.clockNote}
      </span>
    </Card>
  );
}
