import { useQuery } from '@tanstack/react-query'

/**
 * Fixture-backed query with the same shape as `useGetData`.
 *
 * There is no Django backend wired up yet (docs/prd.md §6.1). Screens call
 * typed hooks in `features/<module>/api.ts`; those hooks call this. Swapping a
 * module to the real API means changing `useFixture(...)` to `useGetData(...)`
 * in one file — components never change.
 *
 * ponytail: a resolved promise, not MSW. Add MSW when we need to exercise
 * error paths or request assertions in tests.
 */
export function useFixture<T>(key: unknown[], data: T, delayMs = 300) {
  return useQuery<T>({
    queryKey: ['fixture', ...key],
    queryFn: () => new Promise<T>((resolve) => setTimeout(() => resolve(data), delayMs)),
    staleTime: Infinity,
  })
}
