import { lazy, Suspense, type ComponentType } from 'react'
import { createBrowserRouter, Navigate, RouterProvider, type RouteObject } from 'react-router'
import { AppShell } from '@/layouts/app-shell'
import { LoadingState } from '@/components/states'
import { LoginPage } from '@/features/auth/login-page'
import { Placeholder } from './placeholder'
import { SCREENS } from './routes'
import type { Role } from '@/lib/auth'

/**
 * Built screens, keyed by the path in routes.ts. Everything not listed here
 * falls back to <Placeholder>, which names the Figma node to build from.
 * Phases 4–6 grow this map one entry at a time.
 */
const SCREEN_COMPONENTS: Record<string, ComponentType> = {
  '/student': lazy(() =>
    import('@/features/dashboard/student-dashboard').then((m) => ({ default: m.StudentDashboard })),
  ),
  '/faculty': lazy(() =>
    import('@/features/dashboard/faculty-dashboard').then((m) => ({ default: m.FacultyDashboard })),
  ),
  '/admin': lazy(() =>
    import('@/features/dashboard/admin-dashboard').then((m) => ({ default: m.AdminDashboard })),
  ),
}

/** Screens listed in nav-config as `undesigned` have no inventory entry. */
const UNDESIGNED: { path: string; title: string }[] = [
  { path: '/student/profile', title: 'My Profile' },
  { path: '/student/library', title: 'Library' },
  { path: '/student/services', title: 'Student Services' },
  { path: '/student/clubs', title: 'Clubs' },
  { path: '/student/transport', title: 'Transport' },
  { path: '/student/hostel', title: 'Hostel' },
  { path: '/student/digital-id', title: 'Digital ID' },
  { path: '/student/career', title: 'Career' },
  { path: '/student/communication', title: 'Communication' },
  { path: '/student/settings', title: 'Settings' },
  { path: '/faculty/settings', title: 'Settings' },
  { path: '/faculty/support', title: 'Support' },
  { path: '/admin/health', title: 'System Health' },
  { path: '/admin/settings', title: 'Settings' },
  { path: '/admin/support', title: 'Support' },
]

function routesFor(role: Role): RouteObject[] {
  const base = `/${role}`

  const screens = SCREENS.filter((s) => s.path === base || s.path.startsWith(`${base}/`)).map(
    (s): RouteObject => {
      const Component = SCREEN_COMPONENTS[s.path]
      return {
        // '' is the index route; otherwise strip the shell's base prefix.
        path: s.path === base ? undefined : s.path.slice(base.length + 1),
        index: s.path === base ? true : undefined,
        element: Component ? <Component /> : <Placeholder title={s.title} node={s.node} path={s.path} />,
      }
    },
  )

  const undesigned = UNDESIGNED.filter((u) => u.path.startsWith(`${base}/`)).map(
    (u): RouteObject => ({
      path: u.path.slice(base.length + 1),
      element: <Placeholder title={u.title} path={u.path} />,
    }),
  )

  return [...screens, ...undesigned]
}

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/', element: <Navigate to="/login" replace /> },
  ...(['student', 'faculty', 'admin'] as const).map((role) => ({
    path: `/${role}`,
    element: <AppShell role={role} />,
    children: routesFor(role),
  })),
  { path: '*', element: <Placeholder title="Page not found" /> },
])

export function AppRouter() {
  return (
    <Suspense fallback={<LoadingState className="min-h-screen" />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}
