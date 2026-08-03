import {
  Award,
  Banknote,
  BookOpen,
  Building2,
  CalendarCheck,
  ClipboardList,
  Clock,
  FlaskConical,
  GraduationCap,
  TriangleAlert,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

/**
 * Metric icons arrive from the API as strings, so the data layer stays
 * serialisable. Anything unknown falls back rather than crashing a dashboard.
 */
const ICONS: Record<string, LucideIcon> = {
  Award,
  Banknote,
  BookOpen,
  Building2,
  CalendarCheck,
  ClipboardList,
  Clock,
  FlaskConical,
  GraduationCap,
  TriangleAlert,
  Users,
  Wallet,
}

export const iconFor = (name: string): LucideIcon => ICONS[name] ?? ClipboardList
