import { NavLink } from 'react-router'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { Role } from '@/lib/auth'
import type { NavEntry } from './nav-config'

/**
 * NavItem — design.md §3 + the persona table in §1.1.
 * All three active treatments are genuinely different; that table is the spec.
 * Hover and focus are house rules (Figma specifies neither).
 */
const item = cva(
  'flex items-center rounded-control px-4 py-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1',
  {
    variants: {
      role: {
        student: 'gap-4 text-fg-body hover:bg-nav-active-student/40',
        faculty: 'gap-3 rounded-nav text-fg-body hover:bg-surface-subtle',
        admin: 'gap-4 text-fg-on-dark hover:bg-white/5 focus-visible:ring-offset-sidebar-dark',
      },
      active: { true: '', false: '' },
    },
    compoundVariants: [
      {
        role: 'student',
        active: true,
        class: 'bg-nav-active-student text-brand-700 drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)] hover:bg-nav-active-student',
      },
      {
        role: 'faculty',
        active: true,
        class: 'bg-brand-gradient text-brand-fg drop-shadow-[0_4px_6px_rgba(37,99,235,0.25)]',
      },
      {
        role: 'admin',
        active: true,
        class: 'bg-accent-500 text-fg-on-dark-strong hover:bg-accent-500',
      },
    ],
    defaultVariants: { active: false },
  },
)

export function NavItem({ entry, role }: { entry: Extract<NavEntry, { kind: 'link' }>; role: Role }) {
  const { label, to, icon: Icon, end, emphasis, undesigned } = entry

  return (
    <NavLink
      to={to}
      end={end}
      title={undesigned ? `${label} — no design yet` : undefined}
      className={({ isActive }) =>
        cn(
          item({ role, active: isActive }),
          // The AI Assistant item carries its own tint (design.md §1.1 student nav).
          emphasis && !isActive && 'bg-accent-600/5 font-semibold text-fg-heading',
        )
      }
    >
      <Icon className="size-[18px] shrink-0" aria-hidden />
      <span className="truncate">{label}</span>
      {undesigned && <span className="ml-auto size-1.5 rounded-full bg-fg-muted/40" aria-hidden />}
    </NavLink>
  )
}
