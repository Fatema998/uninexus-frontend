/**
 * JWT token store + claims decoding.
 *
 * Targets Django REST Framework SimpleJWT conventions:
 *   POST /api/token/         {username, password} -> {access, refresh}
 *   POST /api/token/refresh/ {refresh}            -> {access}
 *
 * ponytail: tokens live in localStorage, which is readable by any XSS on the
 * page. httpOnly refresh cookies are the stronger option but require the
 * Django side to set them — revisit with the backend dev before launch.
 */

const ACCESS_KEY = 'unigpt.access'
const REFRESH_KEY = 'unigpt.refresh'

export type Role = 'student' | 'faculty' | 'admin'

export type AuthUser = {
  id: string
  name: string
  role: Role
  email?: string
  avatar?: string
  subtitle?: string
}

/** Claims we expect on the access token. `role` must be a custom claim added
 *  by the Django serializer — SimpleJWT does not emit it by default. */
type JwtClaims = {
  user_id?: string | number
  sub?: string | number
  role?: string
  name?: string
  full_name?: string
  email?: string
  avatar?: string
  department?: string
  exp?: number
}

export const getAccessToken = () => localStorage.getItem(ACCESS_KEY)
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY)

export function setTokens(access: string, refresh?: string) {
  localStorage.setItem(ACCESS_KEY, access)
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

/** Decode a JWT payload. Returns null on anything malformed — never throws,
 *  because a corrupt token must log the user out, not crash the app. */
export function decodeJwt(token: string): JwtClaims | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as JwtClaims
  } catch {
    return null
  }
}

const ROLES: Role[] = ['student', 'faculty', 'admin']
const isRole = (v: unknown): v is Role => ROLES.includes(v as Role)

/** True when the token is absent, unreadable, or past its `exp`. */
export function isExpired(token: string | null): boolean {
  if (!token) return true
  const claims = decodeJwt(token)
  if (!claims?.exp) return true
  return claims.exp * 1000 <= Date.now()
}

/** Build the app's user object from an access token. */
export function userFromToken(token: string | null): AuthUser | null {
  if (!token) return null
  const c = decodeJwt(token)
  if (!c) return null

  const role = isRole(c.role) ? c.role : null
  if (!role) return null // no role claim -> we cannot pick a shell; treat as unauthenticated

  return {
    id: String(c.user_id ?? c.sub ?? ''),
    name: c.full_name ?? c.name ?? c.email ?? 'User',
    role,
    email: c.email,
    avatar: c.avatar,
    subtitle: c.department,
  }
}

/** Landing route for a role — used after login and by the role guard. */
export const homeFor = (role: Role) => `/${role}`
