import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { apiFetch, AUTH_EXPIRED_EVENT } from '@/hooks/use-api'
import { clearTokens, getAccessToken, setTokens, userFromToken, type AuthUser } from '@/lib/auth'
import { DEV_USERS, devAuthEnabled, mintDevToken } from '@/lib/dev-auth'
import { AuthContext } from './auth-context'

/** Read the current session straight off the stored token. */
function readSession(): AuthUser | null {
  const token = getAccessToken()
  // An expired access token is still a usable identity hint — apiFetch will
  // refresh it on the first 401. Only a missing/undecodable one is fatal.
  return token ? userFromToken(token) : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readSession)
  const queryClient = useQueryClient()

  const logout = useCallback(() => {
    clearTokens()
    setUser(null)
    queryClient.clear()
  }, [queryClient])

  // apiFetch fires this when a token refresh fails — the session is gone.
  useEffect(() => {
    const onExpired = () => logout()
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired)
  }, [logout])

  const login = useCallback(async (username: string, password: string) => {
    // Dev seam: no backend configured yet (see lib/dev-auth.ts).
    const dev = devAuthEnabled() ? mintDevToken(username) : null
    if (devAuthEnabled() && !dev) {
      throw new Error(`Dev sign-in: use one of ${DEV_USERS.join(', ')} as the username.`)
    }

    const { access, refresh } =
      dev ??
      (await apiFetch<{ access: string; refresh: string }>('/api/token/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }))
    setTokens(access, refresh)

    const next = userFromToken(access)
    if (!next) {
      clearTokens()
      throw new Error(
        'Signed in, but the token carries no usable "role" claim. The Django token serializer must include role, name, and email.',
      )
    }
    setUser(next)
    return next
  }, [])

  return <AuthContext value={{ user, login, logout }}>{children}</AuthContext>
}
