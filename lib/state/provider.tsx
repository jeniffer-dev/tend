'use client';

/**
 * The store, above the router. T007, T019.
 *
 * It holds state in memory and writes to **no storage API** — no
 * localStorage, no sessionStorage, no IndexedDB, no cookies (FR-023). A
 * reload is the reset, and 001's persistence.spec.ts carries forward
 * unchanged as the proof. Persistence is feature 003.
 *
 * Being mounted above the route in app/layout.tsx is what lets a running
 * session survive navigation (FR-024): the store is not inside the screen
 * you walked away from.
 *
 * **It does not publish the clock.** Time is lib/state/clock.tsx, and
 * keeping them apart is what stops a one-second tick re-rendering every
 * screen that reads state.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { ClockProvider } from '@/lib/state/clock';
import { reduce, type Action } from '@/lib/state/store';
import { EMPTY_STATE, type State } from '@/lib/state/types';
import { SEED_001, SEED_001_ORIGIN } from '@/lib/seed/fixture-001';

type StoreValue = { state: State; dispatch: (action: Action) => void };

const StoreContext = createContext<StoreValue | null>(null);

/** Read once, on the client, from the URL. A query parameter is the only
 *  mechanism that satisfies both FR-025 and FR-026 without storing
 *  anything: explicit, per-tab, gone on navigation, and impossible to leak
 *  into an ordinary session (research.md §5). */
function seedRequested(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('seed') === '001';
}

export function StoreProvider({ children }: { children: ReactNode }) {
  /*
   * Seeding happens at boot, not through the reducer. It is not a
   * transition — there are eleven of those and this is none of them — so it
   * replaces state rather than reducing into it.
   *
   * The lazy initialiser runs once per client mount. The server renders the
   * empty app; `suppressHydrationWarning` on the layout's body is not
   * needed because the provider renders the same tree either way, and the
   * seeded values reach it on the first client render.
   */
  const seeded = seedRequested();
  const [state, setState] = useState<State>(() => (seeded ? SEED_001 : EMPTY_STATE));

  const dispatch = useCallback((action: Action) => {
    setState((current) => reduce(current, action));
  }, []);

  const value = useMemo<StoreValue>(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <ClockProvider origin={seeded ? SEED_001_ORIGIN : null}>
      <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
    </ClockProvider>
  );
}

export function useStore(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useStore outside StoreProvider');
  return value;
}

export const useAppState = (): State => useStore().state;
export const useDispatch = (): ((action: Action) => void) => useStore().dispatch;
