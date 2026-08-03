import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query'

import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '@/lib/auth'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, body: unknown) {
    super(`Request failed with ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

/** Broadcast when the session is unrecoverable, so AuthProvider can drop the user. */
export const AUTH_EXPIRED_EVENT = 'unigpt:auth-expired'

/**
 * Exchange the refresh token for a new access token.
 * Deduped: concurrent 401s share one in-flight refresh rather than racing.
 */
let refreshInFlight: Promise<string | null> | null = null

function refreshAccessToken(): Promise<string | null> {
  refreshInFlight ??= (async () => {
    const refresh = getRefreshToken()
    if (!refresh) return null
    try {
      const res = await fetch(`${BASE_URL}/api/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      })
      if (!res.ok) return null
      const { access } = (await res.json()) as { access?: string }
      if (!access) return null
      setTokens(access)
      return access
    } catch {
      return null
    } finally {
      // Cleared on the next tick so callers awaiting this promise still share it.
      queueMicrotask(() => {
        refreshInFlight = null
      })
    }
  })()
  return refreshInFlight
}

function buildInit(init: RequestInit | undefined, token: string | null): RequestInit {
  return {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  }
}

/**
 * Thin fetch wrapper: JSON in, JSON out, throws ApiError on non-2xx.
 * Attaches the JWT and retries once through a token refresh on 401.
 */
export async function apiFetch<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`
  let res = await fetch(url, buildInit(init, getAccessToken()))

  if (res.status === 401 && getRefreshToken()) {
    const access = await refreshAccessToken()
    if (access) {
      res = await fetch(url, buildInit(init, access))
    } else {
      clearTokens()
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
    }
  }

  // 204 and friends have no body to parse.
  const body = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(res.status, body)
  return body as T
}

type QueryOpts<T> = Omit<UseQueryOptions<T, ApiError>, 'queryKey' | 'queryFn'>
type MutationOpts<TData, TVars> = Omit<
  UseMutationOptions<TData, ApiError, TVars>,
  'mutationFn'
>

/** GET. `useGetData<User[]>('/users', ['users'])` */
export function useGetData<T>(endpoint: string, key: unknown[], options?: QueryOpts<T>) {
  return useQuery<T, ApiError>({
    queryKey: key,
    queryFn: () => apiFetch<T>(endpoint),
    ...options,
  })
}

/**
 * Shared mutation body. Invalidates `key` on success so lists refetch,
 * unless the caller supplies its own onSuccess.
 */
function useApiMutation<TData, TVars>(
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  endpoint: string | ((vars: TVars) => string),
  key: unknown[],
  options?: MutationOpts<TData, TVars>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}

  return useMutation<TData, ApiError, TVars>({
    mutationFn: (vars: TVars) =>
      apiFetch<TData>(typeof endpoint === 'function' ? endpoint(vars) : endpoint, {
        method,
        body: method === 'DELETE' ? undefined : JSON.stringify(vars),
      }),
    // ponytail: spread args so this survives react-query changing the onSuccess arity
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: key })
      onSuccess?.(...args)
    },
    ...rest,
  })
}

/** POST. `usePostData<User, NewUser>('/users', ['users'])` */
export function usePostData<TData = unknown, TVars = unknown>(
  endpoint: string,
  key: unknown[],
  options?: MutationOpts<TData, TVars>,
) {
  return useApiMutation<TData, TVars>('POST', endpoint, key, options)
}

/** PUT — full replace. */
export function usePutData<TData = unknown, TVars = unknown>(
  endpoint: string | ((vars: TVars) => string),
  key: unknown[],
  options?: MutationOpts<TData, TVars>,
) {
  return useApiMutation<TData, TVars>('PUT', endpoint, key, options)
}

/** PATCH — partial update. */
export function usePatchData<TData = unknown, TVars = unknown>(
  endpoint: string | ((vars: TVars) => string),
  key: unknown[],
  options?: MutationOpts<TData, TVars>,
) {
  return useApiMutation<TData, TVars>('PATCH', endpoint, key, options)
}

/**
 * Options that make a mutation optimistic: patch the cache now, roll back if
 * the server disagrees, refetch either way. Spread into any mutation hook.
 *
 *   const patch = useOptimistic<Note[], CreateNoteRequest>(
 *     ['lms', 'notes'],
 *     (notes, vars) => [{ ...vars, id: `tmp-${crypto.randomUUID()}` }, ...notes],
 *   )
 *   usePostData<Note, CreateNoteRequest>('/api/student/lms/notes/', ['lms','notes'], patch)
 *
 * `cancelQueries` first is not optional: an in-flight GET that resolves after
 * the patch would overwrite it with pre-mutation data.
 *
 * Do NOT use this on anything that moves money — see docs/api/student.md §5.3.
 */
export function useOptimistic<TCached, TVars>(
  key: unknown[],
  patch: (previous: TCached, vars: TVars) => TCached,
) {
  const queryClient = useQueryClient()

  return {
    onMutate: async (vars: TVars) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<TCached>(key)
      if (previous !== undefined) {
        queryClient.setQueryData<TCached>(key, patch(previous, vars))
      }
      return { previous }
    },
    onError: (_err: ApiError, _vars: TVars, context?: { previous?: TCached }) => {
      if (context?.previous !== undefined) queryClient.setQueryData(key, context.previous)
    },
    // Always refetch: the server owns derived fields (counts, totals, states)
    // that the patch above only guessed at.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: key })
    },
  }
}

/**
 * DELETE. Pass a function when the id is in the path:
 * `useDelete<void, string>((id) => `/users/${id}`, ['users'])`
 */
export function useDelete<TData = unknown, TVars = unknown>(
  endpoint: string | ((vars: TVars) => string),
  key: unknown[],
  options?: MutationOpts<TData, TVars>,
) {
  return useApiMutation<TData, TVars>('DELETE', endpoint, key, options)
}
