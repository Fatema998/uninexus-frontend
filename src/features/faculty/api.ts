import { useGetData, useOptimistic, usePatchData, usePostData, usePutData } from '@/hooks/use-api'
import type { Attachment, Paginated } from '@/types'
import type {
  AssignedSectionsResponse,
  AttendanceSheetResponse,
  CreateAssignmentRequest,
  FacultyAcademicResponse,
  FacultyAssignment,
  FacultyAssignmentsResponse,
  FacultyExamsResponse,
  FacultyFinanceResponse,
  FacultyProfileResponse,
  GradeSubmissionRequest,
  GradeSubmissionResult,
  GradebookResponse,
  GrantsResponse,
  LibraryItem,
  ReserveItemResult,
  ResearchPortfolioResponse,
  SaveGradesRequest,
  SaveGradesResult,
  SectionDetailResponse,
  SubmissionDetailResponse,
  SubmissionsResponse,
  SubmitAttendanceRequest,
  SubmitAttendanceResult,
  UpdateProfileRequest,
} from '@/types/faculty'

/**
 * Faculty module data (14 screens). Contract: docs/api/faculty.md.
 *
 * Everything is section-scoped — `CourseRef` cannot address a roster, a
 * gradebook or an attendance sheet, because one course runs several sections.
 *
 * Almost nothing here is optimistic. Every write lands on a student's
 * transcript, and a number that appears then changes is worse than one that
 * takes 300ms. See docs/api/faculty.md §5.
 */

export const useFacultyAcademic = () =>
  useGetData<FacultyAcademicResponse>('/api/faculty/academic/', ['faculty', 'academic'])

// ---------------------------------------------------------------- sections

export const useAssignedSections = () =>
  useGetData<AssignedSectionsResponse>('/api/faculty/sections/', ['faculty', 'sections'])

export const useSectionDetail = (sectionId: string) =>
  useGetData<SectionDetailResponse>(`/api/faculty/sections/${sectionId}/`, [
    'faculty',
    'sections',
    sectionId,
  ])

/** Multipart — the browser owns the boundary, so never set Content-Type. */
export const useUploadMaterials = (sectionId: string) =>
  usePostData<Attachment[], FormData>(`/api/faculty/sections/${sectionId}/materials/`, [
    'faculty',
    'sections',
    sectionId,
  ])

// ------------------------------------------------------------- assignments

export const useFacultyAssignments = () =>
  useGetData<FacultyAssignmentsResponse>('/api/faculty/assignments/', ['faculty', 'assignments'])

export const useCreateAssignment = () =>
  usePostData<FacultyAssignment, CreateAssignmentRequest>('/api/faculty/assignments/', [
    'faculty',
    'assignments',
  ])

export const useSubmissions = (assignmentId: string) =>
  useGetData<SubmissionsResponse>(`/api/faculty/assignments/${assignmentId}/submissions/`, [
    'faculty',
    'assignments',
    assignmentId,
    'submissions',
  ])

export const useSubmissionDetail = (submissionId: string) =>
  useGetData<SubmissionDetailResponse>(`/api/faculty/submissions/${submissionId}/`, [
    'faculty',
    'submissions',
    submissionId,
  ])

/**
 * PUT, not PATCH: a grade is replaced wholesale. A partial rubric would keep
 * marks from an earlier pass without anyone noticing.
 *
 * Never optimistic — this is a transcript entry.
 */
export const useGradeSubmission = (submissionId: string) =>
  usePutData<GradeSubmissionResult, GradeSubmissionRequest>(
    `/api/faculty/submissions/${submissionId}/grade/`,
    ['faculty', 'submissions', submissionId],
  )

// ---------------------------------------------------------------- gradebook

export const useGradebook = (sectionId: string) =>
  useGetData<GradebookResponse>(`/api/faculty/gradebook/?sectionId=${sectionId}`, [
    'faculty',
    'gradebook',
    sectionId,
  ])

/**
 * Batched save. Not optimistic on purpose: the server may keep 28 of 30
 * cells, so patching all 30 would show them land and then quietly revert two
 * after the teacher has moved on. Wait for `rejected` and mark those cells.
 */
export const useSaveGrades = (sectionId: string) =>
  usePatchData<SaveGradesResult, SaveGradesRequest>(
    `/api/faculty/gradebook/?sectionId=${sectionId}`,
    ['faculty', 'gradebook', sectionId],
  )

// --------------------------------------------------------------- attendance

export const useAttendanceSheet = (sectionId: string, date: string) =>
  useGetData<AttendanceSheetResponse>(
    `/api/faculty/attendance/?sectionId=${sectionId}&date=${date}`,
    ['faculty', 'attendance', sectionId, date],
  )

/**
 * The whole roster, every time. A partial submit cannot distinguish
 * "unmarked" from "absent", and that difference is a student's exam
 * eligibility.
 */
export const useSubmitAttendance = (sessionId: string, key: unknown[]) =>
  usePutData<SubmitAttendanceResult, SubmitAttendanceRequest>(
    `/api/faculty/attendance/${sessionId}/`,
    key,
  )

// ------------------------------------------------- exams · profile · rest

export const useFacultyExams = () =>
  useGetData<FacultyExamsResponse>('/api/faculty/exams/', ['faculty', 'exams'])

const PROFILE_KEY = ['faculty', 'profile']

export const useFacultyProfile = () =>
  useGetData<FacultyProfileResponse>('/api/faculty/profile/', PROFILE_KEY)

/**
 * Optimistic — three text fields, instantly reversible. The server still
 * decides: anything outside phone / officeRoom / specializations comes back
 * 403 rather than being silently dropped.
 */
export const useUpdateProfile = () => {
  const patch = useOptimistic<FacultyProfileResponse, UpdateProfileRequest>(
    PROFILE_KEY,
    (prev, vars) => ({ ...prev, ...vars }),
  )
  return usePatchData<FacultyProfileResponse, UpdateProfileRequest>(
    '/api/faculty/profile/',
    PROFILE_KEY,
    patch,
  )
}

export const useResearchPortfolio = () =>
  useGetData<ResearchPortfolioResponse>('/api/faculty/research/', ['faculty', 'research'])

export const useGrants = () =>
  useGetData<GrantsResponse>('/api/faculty/research/grants/', ['faculty', 'research', 'grants'])

export const useFacultyLibrary = (q: string, kind: string) => {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (kind && kind !== 'ALL') params.set('kind', kind)
  const qs = params.toString()

  return useGetData<Paginated<LibraryItem>>(
    `/api/faculty/library/${qs ? `?${qs}` : ''}`,
    ['faculty', 'library', q, kind],
  )
}

export const useReserveItem = (key: unknown[]) =>
  usePostData<ReserveItemResult, string>((id) => `/api/faculty/library/${id}/reserve/`, key)

export const useFacultyFinance = () =>
  useGetData<FacultyFinanceResponse>('/api/faculty/finance/', ['faculty', 'finance'])
