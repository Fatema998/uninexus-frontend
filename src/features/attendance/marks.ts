import type { BadgeTone } from '@/components/patterns/badge'
import type { AttendanceMark } from '@/types'

/** Attendance mark → badge tone. Shared by the daily and per-course screens. */
export const MARK_TONE: Record<AttendanceMark, BadgeTone> = {
  PRESENT: 'success',
  ABSENT: 'danger',
  LATE: 'warning',
  EXCUSED: 'info',
  PENDING: 'neutral',
}
