import { useDelete, useGetData, usePatchData, usePostData } from '@/hooks/use-api'
import type { Cursored } from '@/types'
import type {
  AcademicManagementResponse,
  AdminFinanceResponse,
  AdmissionsResponse,
  ApplicationDetailResponse,
  AssignSlotRequest,
  AuditEntry,
  ChangeUserStatusRequest,
  ChangeUserStatusResult,
  CreateUserRequest,
  DecideApplicationRequest,
  DecideApplicationResult,
  ExamHubResponse,
  ExamScheduleResponse,
  LedgerEntry,
  MarksEntryResponse,
  PublishMarksRequest,
  PublishMarksResult,
  SaveMarksRequest,
  SaveMarksResult,
  UserManagementResponse,
  UserRow,
  UserSecurityProfileResponse,
} from '@/types/admin'

/**
 * Admin/ERP module data (13 screens). Contract: docs/api/admin.md.
 *
 * Two things run through everything here:
 *
 * - **Lists paginate and search server-side.** The directory is 12,000 rows;
 *   there is no fetch-it-all-and-filter option, and the metrics describe the
 *   whole collection rather than the current page.
 * - **Almost nothing is optimistic.** These writes are institutional facts —
 *   a locked-out account, a sent offer letter, a published result. Showing
 *   one before it is true is a correctness bug. See docs/api/admin.md §6.
 */

export const useAdminAcademic = () =>
  useGetData<AcademicManagementResponse>('/api/admin/academic/', ['admin', 'academic'])

// ---------------------------------------------------------------- users

export type UserFilters = { q: string; role: string; status: string; page: number }

const usersKey = (f: UserFilters) => ['admin', 'users', f.q, f.role, f.status, f.page]

export const useUserManagement = (f: UserFilters) => {
  const params = new URLSearchParams({ page: String(f.page), page_size: '20' })
  if (f.q) params.set('q', f.q)
  if (f.role !== 'ALL') params.set('role', f.role)
  if (f.status !== 'ALL') params.set('status', f.status)

  return useGetData<UserManagementResponse>(`/api/admin/users/?${params}`, usersKey(f))
}

export const useCreateUser = (f: UserFilters) =>
  usePostData<UserRow, CreateUserRequest>('/api/admin/users/', usersKey(f))

export const useSecurityProfile = (userId: string) =>
  useGetData<UserSecurityProfileResponse>(`/api/admin/users/${userId}/security/`, [
    'admin',
    'users',
    userId,
    'security',
  ])

/**
 * Never optimistic: this locks a real person out of the portal. It must be
 * recorded server-side before the UI claims it happened, and the response
 * carries the audit entry so the confirmation can say what was written.
 */
export const useChangeUserStatus = (userId: string) =>
  usePatchData<ChangeUserStatusResult, ChangeUserStatusRequest>(
    `/api/admin/users/${userId}/status/`,
    ['admin', 'users'],
  )

export const useRevokeSession = (userId: string) =>
  useDelete<AuditEntry, string>(
    (sessionId) => `/api/admin/users/${userId}/sessions/${sessionId}/`,
    ['admin', 'users', userId, 'security'],
  )

export const useSendPasswordReset = (userId: string) =>
  usePostData<AuditEntry, void>(`/api/admin/users/${userId}/password-reset/`, [
    'admin',
    'users',
    userId,
    'security',
  ])

// ----------------------------------------------------------- admissions

export type AdmissionFilters = { q: string; status: string; page: number }

export const useAdmissions = (f: AdmissionFilters) => {
  const params = new URLSearchParams({ page: String(f.page), page_size: '20' })
  if (f.q) params.set('q', f.q)
  if (f.status !== 'ALL') params.set('status', f.status)

  return useGetData<AdmissionsResponse>(`/api/admin/admissions/?${params}`, [
    'admin',
    'admissions',
    f.q,
    f.status,
    f.page,
  ])
}

export const useApplicationDetail = (id: string) =>
  useGetData<ApplicationDetailResponse>(`/api/admin/admissions/${id}/`, [
    'admin',
    'admissions',
    id,
  ])

/**
 * Never optimistic and never repeatable: this sends an offer or rejection
 * letter. A second attempt on a decided application returns 409.
 */
export const useDecideApplication = (id: string) =>
  usePostData<DecideApplicationResult, DecideApplicationRequest>(
    `/api/admin/admissions/${id}/decision/`,
    ['admin', 'admissions'],
  )

// ------------------------------------------------------------------ exams

export const useExamHub = () => useGetData<ExamHubResponse>('/api/admin/exams/', ['admin', 'exams'])

const SCHEDULE_KEY = ['admin', 'exams', 'schedule']

export const useExamSchedule = () =>
  useGetData<ExamScheduleResponse>('/api/admin/exams/schedule/', SCHEDULE_KEY)

/**
 * Returns the whole schedule, not the one slot: assigning a hall can resolve
 * or create a conflict in a different row, and patching one row would leave
 * the rest of the grid lying about its own state.
 */
export const useAssignSlot = (slotId: string) =>
  usePatchData<ExamScheduleResponse, AssignSlotRequest>(
    `/api/admin/exams/schedule/${slotId}/`,
    SCHEDULE_KEY,
  )

const MARKS_KEY = ['admin', 'exams', 'marks']

export const useMarksEntry = () => useGetData<MarksEntryResponse>('/api/admin/exams/marks/', MARKS_KEY)

/** Batched, partial-success. Same contract as the faculty gradebook. */
export const useSaveMarks = () =>
  usePatchData<SaveMarksResult, SaveMarksRequest>('/api/admin/exams/marks/', MARKS_KEY)

/**
 * The most irreversible action in the product — every student in the section
 * sees their result at once. Guarded by a typed confirmation server-side.
 */
export const usePublishMarks = () =>
  usePostData<PublishMarksResult, PublishMarksRequest>('/api/admin/exams/marks/publish/', MARKS_KEY)

// ---------------------------------------------------------------- finance

export const useAdminFinance = () =>
  useGetData<AdminFinanceResponse>('/api/admin/finance/', ['admin', 'finance'])

export const useLedger = (direction: string) =>
  useGetData<Cursored<LedgerEntry>>(
    `/api/admin/finance/ledger/${direction !== 'ALL' ? `?direction=${direction}` : ''}`,
    ['admin', 'finance', 'ledger', direction],
  )

// Re-exported so the ops screens can keep their own file.
export { useAdminSettings, useSaveSettings, useSupport, useSystemHealth, useUpdateTicket } from './api-ops'

export type { UserRow }
