import { useFixture } from '@/lib/fixtures'
import { useGetData } from '@/hooks/use-api'
import type { MetricTone } from '@/components/patterns/metric-card'
import type { StudentDashboardResponse } from '@/types'
import type { FacultyDashboardResponse } from '@/types/faculty'

/**
 * Dashboard data. Values are transcribed from the Figma frames
 * (student 9:6820 · faculty 1:2 · admin 7:15548) so the screens match the
 * design at a glance — replace `useFixture` with `useGetData` once the Django
 * endpoints exist. Query keys already follow the [module, resource] convention.
 *
 * Student and faculty talk to the real fetch path against `bun run mock`.
 * Admin is still on fixtures until its contract lands.
 */

export type Metric = {
  label: string
  value: string
  tone: MetricTone
  icon: string
  unit?: string
  badge?: { label: string; tone: 'success' | 'info' | 'warning' | 'brand' | 'neutral' }
  progress?: number
}

// ---------------------------------------------------------------- student

export const useStudentDashboard = () =>
  useGetData<StudentDashboardResponse>('/api/student/dashboard/', ['student', 'dashboard'])

// ---------------------------------------------------------------- faculty

export const useFacultyDashboard = () =>
  useGetData<FacultyDashboardResponse>('/api/faculty/dashboard/', ['faculty', 'dashboard'])

// ------------------------------------------------------------------ admin

export type AdminDashboard = {
  metrics: Metric[]
  enrollment: { month: string; students: number }[]
  distribution: { label: string; value: number; tone: MetricTone }[]
  totalStudents: string
  announcements: { title: string; meta: string }[]
  systems: { label: string; healthy: boolean }[]
  financial: { collected: string; target: string; percent: number }
  departments: { name: string; students: string; percent: number; tone: MetricTone }[]
  events: { day: string; month: string; title: string; meta: string }[]
}

export const useAdminDashboard = () =>
  useFixture<AdminDashboard>(['admin', 'dashboard'], {
    metrics: [
      { label: 'Total Students', value: '12,485', tone: 'brand', icon: 'Users', badge: { label: '+4.2%', tone: 'success' } },
      { label: 'Total Faculty', value: '1,248', tone: 'accent', icon: 'GraduationCap', badge: { label: 'Stable', tone: 'neutral' } },
      { label: 'Total Courses', value: '642', tone: 'info', icon: 'BookOpen', badge: { label: '+12 New', tone: 'brand' } },
      { label: 'Total Departments', value: '24', tone: 'brand', icon: 'Building2' },
      { label: 'Pending Admissions', value: '312', tone: 'danger', icon: 'ClipboardList', badge: { label: 'Action', tone: 'warning' } },
      { label: 'Total Revenue', value: '৳128.75M', tone: 'success', icon: 'Banknote', badge: { label: '+8.6%', tone: 'success' } },
    ],
    enrollment: [
      { month: 'JAN', students: 8200 }, { month: 'FEB', students: 8300 },
      { month: 'MAR', students: 8900 }, { month: 'APR', students: 10100 },
      { month: 'MAY', students: 10600 }, { month: 'JUN', students: 10700 },
      { month: 'JUL', students: 10800 }, { month: 'AUG', students: 11200 },
      { month: 'SEP', students: 11600 }, { month: 'OCT', students: 12000 },
      { month: 'NOV', students: 12485 },
    ],
    distribution: [
      { label: 'Undergrad', value: 60, tone: 'brand' },
      { label: 'Graduate', value: 25, tone: 'accent' },
      { label: 'Postgrad', value: 15, tone: 'info' },
    ],
    totalStudents: '12.4k',
    announcements: [
      { title: 'Annual University Gala', meta: 'Registration starts from next Monday' },
      { title: 'Mid-Term Exam Schedule', meta: 'Published for all departments' },
    ],
    systems: [
      { label: 'LMS', healthy: true },
      { label: 'DB', healthy: true },
      { label: 'API', healthy: true },
    ],
    financial: { collected: '৳128.75M', target: '৳165M', percent: 78 },
    departments: [
      { name: 'Computer Science', students: '2,450 Std.', percent: 100, tone: 'brand' },
      { name: 'Business Admin', students: '1,820 Std.', percent: 74, tone: 'accent' },
      { name: 'Engineering', students: '1,440 Std.', percent: 59, tone: 'info' },
    ],
    events: [
      { day: '24', month: 'MAY', title: 'Annual Board Meeting', meta: 'Conference Room A • 10:00 AM' },
      { day: '27', month: 'MAY', title: '15th Convocation Ceremony', meta: 'University Grand Hall • 02:00 PM' },
    ],
  })
