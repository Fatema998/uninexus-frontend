import { useDelete, useGetData, usePostData } from '@/hooks/use-api'
import type {
  AcademicCalendarResponse,
  AddCourseRequest,
  ClassRoutineResponse,
  ClassroomsResponse,
  CourseOffering,
  CreditProgressResponse,
  CurriculumResponse,
  DegreeProgressResponse,
  DropAddRequest,
  DropAddResponse,
  DropAddResult,
  FacultyDirectoryEntry,
  MyCoursesResponse,
  Paginated,
  SemesterRegistrationRequest,
  SemesterRegistrationResponse,
} from '@/types'

/** Academic module data (11 screens). Contract: docs/api/student.md §3.2. */

export const useMyCourses = () =>
  useGetData<MyCoursesResponse>('/api/student/academic/courses/', ['academic', 'courses'])

export const useCurriculum = () =>
  useGetData<CurriculumResponse>('/api/student/academic/curriculum/', ['academic', 'curriculum'])

export const useDegreeProgress = () =>
  useGetData<DegreeProgressResponse>('/api/student/academic/degree-progress/', [
    'academic',
    'degree-progress',
  ])

export const useCreditProgress = () =>
  useGetData<CreditProgressResponse>('/api/student/academic/credits/', ['academic', 'credits'])

export const useClassRoutine = () =>
  useGetData<ClassRoutineResponse>('/api/student/academic/routine/', ['academic', 'routine'])

/** `month` is `YYYY-MM`; the response echoes it so a stale reply is discardable. */
export const useAcademicCalendar = (month: string) =>
  useGetData<AcademicCalendarResponse>(`/api/student/academic/calendar/?month=${month}`, [
    'academic',
    'calendar',
    month,
  ])

export const useFacultyDirectory = (q: string) =>
  useGetData<Paginated<FacultyDirectoryEntry>>(
    `/api/student/academic/faculty/${q ? `?q=${encodeURIComponent(q)}` : ''}`,
    ['academic', 'faculty', q],
  )

export const useClassrooms = () =>
  useGetData<ClassroomsResponse>('/api/student/academic/classrooms/', ['academic', 'classrooms'])

// ------------------------------------------------------------ registration

export const useSemesterRegistration = () =>
  useGetData<SemesterRegistrationResponse>('/api/student/academic/registration/semester/', [
    'academic',
    'registration',
    'semester',
  ])

export const useSubmitSemesterRegistration = () =>
  usePostData<SemesterRegistrationResponse, SemesterRegistrationRequest>(
    '/api/student/academic/registration/semester/',
    ['academic', 'registration', 'semester'],
  )

const OFFERINGS_KEY = ['academic', 'registration', 'courses']

export const useCourseOfferings = (q: string, department: string) => {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (department && department !== 'All Departments') params.set('department', department)
  const qs = params.toString()

  return useGetData<Paginated<CourseOffering>>(
    `/api/student/academic/registration/courses/${qs ? `?${qs}` : ''}`,
    [...OFFERINGS_KEY, q, department],
  )
}

/**
 * Not optimistic. Seats are contended, so a 409 is a normal outcome, not an
 * exception — showing the course as added and then yanking it back is worse
 * than a 250ms spinner. See docs/api/student.md §5.2.
 */
export const useAddCourse = () =>
  usePostData<CourseOffering, AddCourseRequest>(
    '/api/student/academic/registration/courses/',
    OFFERINGS_KEY,
  )

export const useRemoveCourse = () =>
  useDelete<void, string>(
    (offeringId) => `/api/student/academic/registration/courses/${offeringId}/`,
    OFFERINGS_KEY,
  )

export const useDropAdd = () =>
  useGetData<DropAddResponse>('/api/student/academic/registration/drop-add/', [
    'academic',
    'registration',
    'drop-add',
  ])

export const useSubmitDropAdd = () =>
  usePostData<DropAddResult, DropAddRequest>('/api/student/academic/registration/drop-add/', [
    'academic',
    'registration',
    'drop-add',
  ])
