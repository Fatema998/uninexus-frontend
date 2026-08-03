/**
 * `import type { StudentDashboardResponse } from '@/types'`
 *
 * Student is flattened because it is the largest surface and was here first.
 * Faculty and admin are namespaced: all three export a `GradebookResponse` /
 * `ExamScheduleResponse` / `ServiceState`, and flattening them would make
 * which one you got depend on export order.
 *
 *   import type { faculty } from '@/types'   →  faculty.GradebookResponse
 *   import type { admin } from '@/types'     →  admin.ExamScheduleResponse
 *
 * Or import straight from `@/types/faculty` and `@/types/admin`, which is
 * what the feature modules do.
 */
export type * from './common'
export type * from './student'
export type * as faculty from './faculty'
export type * as admin from './admin'
