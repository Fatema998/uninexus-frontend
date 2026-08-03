import type { BadgeTone } from '@/components/patterns/badge'
import type { DayMark } from './api'

/** Attendance mark → badge tone. Shared by the daily and per-course screens. */
export const MARK_TONE: Record<DayMark, BadgeTone> = {
  PRESENT: 'success',
  ABSENT: 'danger',
  LATE: 'warning',
  PENDING: 'neutral',
}
