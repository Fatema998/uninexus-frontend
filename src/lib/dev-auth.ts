import type { Role } from './auth'

/**
 * Dev-only sign-in, so the UI is runnable before the Django backend exists.
 *
 * Active ONLY when both hold:
 *   - `import.meta.env.DEV`      (Vite strips this branch from prod builds)
 *   - `VITE_API_URL` is unset    (any configured API wins immediately)
 *
 * Mints an unsigned JWT with the claims the app expects. No server would ever
 * accept it — it exists purely to let the shells and screens render.
 * Sign in with username `student`, `faculty`, or `admin` (any password).
 */
export const devAuthEnabled = () => import.meta.env.DEV && !import.meta.env.VITE_API_URL

const PROFILES: Record<Role, { name: string; department: string }> = {
  student: { name: 'Alex Rivera', department: 'Computer Science' },
  faculty: { name: 'Dr. Hasan Mahmud', department: 'Dept. of Computer Science' },
  admin: { name: 'System Admin', department: 'Institutional Admin' },
}

const b64url = (obj: unknown) =>
  btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

export function mintDevToken(username: string): { access: string; refresh: string } | null {
  const role = username.trim().toLowerCase() as Role
  const profile = PROFILES[role]
  if (!profile) return null

  const access = [
    b64url({ alg: 'none', typ: 'JWT' }),
    b64url({
      user_id: `dev-${role}`,
      role,
      full_name: profile.name,
      email: `${role}@unigpt.dev`,
      department: profile.department,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12,
    }),
    '',
  ].join('.')

  return { access, refresh: access }
}

/** Usernames the dev login accepts — surfaced as a hint on the login page. */
export const DEV_USERS = Object.keys(PROFILES) as Role[]
