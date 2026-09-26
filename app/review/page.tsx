import { ReviewScreen } from '@/features/review/review-screen';

/**
 * Review. The route reads which week it was asked for and nothing else;
 * the screen, and the state it reads, are client-side (research.md §1).
 *
 * `?week=last` is Week's `Look back on last week` (FR-019b). Anything else,
 * including no parameter at all, is the default week — the one closing on
 * Sunday, the one that last closed on any other day (FR-019d). Reading the
 * parameter here rather than with `useSearchParams` keeps the client
 * component free of a Suspense boundary it would otherwise need.
 */
export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  return <ReviewScreen which={week === 'last' ? 'last' : 'default'} />;
}
