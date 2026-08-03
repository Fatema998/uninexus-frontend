/**
 * `import type { StudentDashboardResponse } from '@/types'`
 *
 * admin.ts lands here when that persona gets its contract.
 *
 * Student and faculty both export a `GradebookResponse`, so faculty's is
 * namespaced rather than shadowing. Import it as
 * `import type { faculty } from '@/types'` → `faculty.GradebookResponse`,
 * or straight from `@/types/faculty`.
 */
export type * from './common'
export type * from './student'
export type * as faculty from './faculty'
