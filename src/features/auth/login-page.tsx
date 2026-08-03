import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { GraduationCap, Loader2, ShieldCheck, UserRound } from 'lucide-react'
import type { Role } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/hooks/use-api'
import { homeFor } from '@/lib/auth'
import { DEV_USERS, devAuthEnabled } from '@/lib/dev-auth'
import { useAuth } from './auth-context'
import { Input } from '@/components/ui/input'

/**
 * Deliberately plain — no Figma frame exists for auth yet. Uses only tokens
 * from docs/design.md so it will not look foreign, but invents no new visual
 * language. Replace wholesale when the login/signup designs arrive.
 */
const DEV_ROLE_ICON: Record<Role, typeof UserRound> = {
  student: UserRound,
  faculty: GraduationCap,
  admin: ShieldCheck,
}

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (user) return <Navigate to={homeFor(user.role)} replace />

  async function signIn(username: string, password: string) {
    setError(null)
    setPending(true)
    try {
      const next = await login(username, password)
      const from = (location.state as { from?: string } | null)?.from
      void navigate(from ?? homeFor(next.role), { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 401
            ? 'Incorrect username or password.'
            : `Sign in failed (${err.status}). Please try again.`,
        )
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      }
    } finally {
      setPending(false)
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    void signIn(String(form.get('username') ?? ''), String(form.get('password') ?? ''))
  }

  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-6">
      <div className="w-full max-w-100">
        <div className="mb-8 flex flex-col items-center gap-3">
          <span className="grid size-12 place-items-center rounded-control bg-brand-gradient">
            <GraduationCap className="size-6 text-brand-fg" aria-hidden />
          </span>
          <div className="text-center">
            <h1 className="text-card-title">UniGPT</h1>
            <p className="text-fg-muted">Sign in to continue</p>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-card border border-border-strong bg-white p-6 shadow-card"
        >
          <label className="mb-1.5 block text-link text-fg-heading" htmlFor="username">
            Username
          </label>
          <Input
            id="username"
            name="username"
            autoComplete="username"
            required
            autoFocus
            className="mb-4 h-11 w-full rounded-control border border-border-strong bg-canvas px-3 outline-none focus-visible:border-brand-600 focus-visible:ring-2 focus-visible:ring-brand-600/30"
          />

          <label className="mb-1.5 block text-link text-fg-heading" htmlFor="password">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mb-5 h-11 w-full rounded-control border border-border-strong bg-canvas px-3 outline-none focus-visible:border-brand-600 focus-visible:ring-2 focus-visible:ring-brand-600/30"
          />

          {error && (
            <p role="alert" className="mb-4 text-link font-normal text-danger">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" disabled={pending} className="h-11 w-full text-body">
            {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {pending ? 'Signing in…' : 'Sign in'}
          </Button>

          {devAuthEnabled() && (
            <div className="mt-5 border-t border-border pt-5">
              <p className="mb-3 text-center text-eyebrow uppercase text-fg-muted">
                Dev sign-in — pick a role
              </p>
              <div className="grid grid-cols-3 gap-2">
                {DEV_USERS.map((role) => {
                  const Icon = DEV_ROLE_ICON[role]
                  return (
                    <button
                      key={role}
                      type="button"
                      disabled={pending}
                      onClick={() => void signIn(role, 'dev')}
                      className="flex flex-col items-center gap-1.5 rounded-control border border-border-strong bg-canvas p-3 text-link capitalize text-fg-heading transition-colors hover:border-brand-600 hover:bg-surface-subtle disabled:opacity-50"
                    >
                      <Icon className="size-4.5 text-fg-muted" aria-hidden />
                      {role}
                    </button>
                  )
                })}
              </div>
              <p className="mt-3 text-center text-fg-muted">
                No API configured. Signs in locally without the Django backend.
              </p>
            </div>
          )}
        </form>
      </div>
    </main>
  )
}
