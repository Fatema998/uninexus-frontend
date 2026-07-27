import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query'

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

/** Thin fetch wrapper: JSON in, JSON out, throws ApiError on non-2xx. */
export async function apiFetch<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  })

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
