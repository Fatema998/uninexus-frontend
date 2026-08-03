import { useGetData } from '@/hooks/use-api'
import type {
  AttendanceAnalyticsResponse,
  AttendanceHistoryResponse,
  AttendanceOverviewResponse,
  CourseAttendanceResponse,
  DailyAttendanceResponse,
} from '@/types'

/**
 * Attendance module data (5 screens). Contract: docs/api/student.md §3.4.
 *
 * Read-only by design — marks are set by faculty. There is no student write
 * endpoint here and there must not be one.
 */

export const useAttendanceOverview = () =>
  useGetData<AttendanceOverviewResponse>('/api/student/attendance/overview/', [
    'attendance',
    'overview',
  ])

/** `date` omitted means today, resolved server-side. */
export const useDailyAttendance = (date?: string) =>
  useGetData<DailyAttendanceResponse>(
    `/api/student/attendance/daily/${date ? `?date=${date}` : ''}`,
    ['attendance', 'daily', date ?? 'today'],
  )

/**
 * `courseId` omitted means "the course the student is most at risk in" —
 * the screen has no picker in the design, so the server chooses the default.
 */
export const useCourseAttendance = (courseId?: string) =>
  useGetData<CourseAttendanceResponse>(
    `/api/student/attendance/by-course/${courseId ? `?courseId=${courseId}` : ''}`,
    ['attendance', 'by-course', courseId ?? 'default'],
  )

export const useAttendanceHistory = () =>
  useGetData<AttendanceHistoryResponse>('/api/student/attendance/history/', [
    'attendance',
    'history',
  ])

export const useAttendanceAnalytics = () =>
  useGetData<AttendanceAnalyticsResponse>('/api/student/attendance/analytics/', [
    'attendance',
    'analytics',
  ])
