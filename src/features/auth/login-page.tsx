import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { GraduationCap, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/hooks/use-api'
import { homeFor } from '@/lib/auth'
import { DEV_USERS, devAuthEnabled } from '@/lib/dev-auth'
import { useAuth } from './auth-context'

/**
 * Deliberately plain — no Figma frame exists for auth yet. Uses only tokens
 * from docs/design.md so it will not look foreign, but invents no new visual
 * language. Replace wholesale when the login/signup designs arrive.
 */
export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (user) return <Navigate to={homeFor(user.role)} replace />

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const form = new FormData(e.currentTarget)
    try {
      const next = await login(
        String(form.get('username') ?? ''),
        String(form.get('password') ?? ''),
      )
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
          <input
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
          <input
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
            <p className="mt-4 border-t border-border pt-4 text-center text-fg-muted">
              No API configured — dev sign-in is active. Use{' '}
              <span className="text-fg-heading">{DEV_USERS.join(' / ')}</span> with any password.
            </p>
          )}
        </form>
      </div>
    </main>
  )
}
