import { useGetData } from '@/hooks/use-api'
import type { StudentDashboardResponse } from '@/types'
import type { FacultyDashboardResponse } from '@/types/faculty'
import type { AdminDashboardResponse } from '@/types/admin'

/**
 * The three dashboards. Every one goes through the real fetch path; the
 * payload shapes are in src/types/{student,faculty,admin}. Query keys follow
 * the [module, resource] convention from docs/architecture.md §5.
 */

export const useStudentDashboard = () =>
  useGetData<StudentDashboardResponse>('/api/student/dashboard/', ['student', 'dashboard'])

// ---------------------------------------------------------------- faculty

export const useFacultyDashboard = () =>
  useGetData<FacultyDashboardResponse>('/api/faculty/dashboard/', ['faculty', 'dashboard'])

// ------------------------------------------------------------------ admin

export const useAdminDashboard = () =>
  useGetData<AdminDashboardResponse>('/api/admin/dashboard/', ['admin', 'dashboard'])
