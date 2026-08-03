import { useDelete, useGetData, useOptimistic, usePostData } from '@/hooks/use-api'
import type {
  AnnouncementsResponse,
  AssignmentDetailResponse,
  AssignmentsResponse,
  CreateNoteRequest,
  CreateReplyRequest,
  Cursored,
  DownloadsResponse,
  ForumThread,
  ForumThreadDetailResponse,
  GradebookResponse,
  LearningAnalyticsResponse,
  LearningProgressResponse,
  LecturesResponse,
  LiveClassesResponse,
  LmsCoursesResponse,
  LmsOverviewResponse,
  MaterialsResponse,
  Note,
  Paginated,
  PracticeQuizResponse,
  QuizAttemptRequest,
  QuizAttemptResult,
  QuizzesResponse,
  RecordingsResponse,
  Submission,
} from '@/types'

/** LMS module data (17 screens). Contract: docs/api/student.md §3.3. */

export const useLmsOverview = () =>
  useGetData<LmsOverviewResponse>('/api/student/lms/overview/', ['lms', 'overview'])

export const useLmsCourses = () =>
  useGetData<LmsCoursesResponse>('/api/student/lms/courses/', ['lms', 'courses'])

export const useLectures = (courseId: string) =>
  useGetData<LecturesResponse>(`/api/student/lms/courses/${courseId}/lectures/`, [
    'lms',
    'lectures',
    courseId,
  ])

export const useMaterials = (courseId: string) =>
  useGetData<MaterialsResponse>(`/api/student/lms/courses/${courseId}/materials/`, [
    'lms',
    'materials',
    courseId,
  ])

// -------------------------------------------------------------- assignments

export const useAssignments = () =>
  useGetData<AssignmentsResponse>('/api/student/lms/assignments/', ['lms', 'assignments'])

export const useAssignmentDetail = (id: string) =>
  useGetData<AssignmentDetailResponse>(`/api/student/lms/assignments/${id}/`, [
    'lms',
    'assignments',
    id,
  ])

/**
 * Multipart, not JSON — files do not base64 into a body without a 33% size
 * penalty and a lost progress bar. See docs/api/student.md §6.2.
 *
 * Deliberately not optimistic: the upload has real duration, so a spinner is
 * honest and a fake "Submitted" is not.
 */
export const useSubmitAssignment = (id: string) =>
  usePostData<Submission, FormData>(`/api/student/lms/assignments/${id}/submissions/`, [
    'lms',
    'assignments',
  ])

// ------------------------------------------------------------------ quizzes

export const useQuizzes = () =>
  useGetData<QuizzesResponse>('/api/student/lms/quizzes/', ['lms', 'quizzes'])

export const usePracticeQuiz = (id: string) =>
  useGetData<PracticeQuizResponse>(`/api/student/lms/quizzes/${id}/practice/`, [
    'lms',
    'practice',
    id,
  ])

/** Never optimistic — the score *is* the answer; guessing it is nonsense. */
export const useSubmitQuizAttempt = (id: string) =>
  usePostData<QuizAttemptResult, QuizAttemptRequest>(`/api/student/lms/quizzes/${id}/attempts/`, [
    'lms',
    'quizzes',
  ])

// ------------------------------------------------------- video · downloads

export const useLiveClasses = () =>
  useGetData<LiveClassesResponse>('/api/student/lms/live/', ['lms', 'live'])

export const useRecordings = () =>
  useGetData<RecordingsResponse>('/api/student/lms/recordings/', ['lms', 'recordings'])

export const useDownloads = () =>
  useGetData<DownloadsResponse>('/api/student/lms/downloads/', ['lms', 'downloads'])

// -------------------------------------------------------------------- forum

export const useForumThreads = (courseId?: string) =>
  useGetData<Cursored<ForumThread>>(
    `/api/student/lms/forum/threads/${courseId ? `?courseId=${courseId}` : ''}`,
    ['lms', 'forum', courseId ?? 'all'],
  )

export const useForumThread = (id: string) =>
  useGetData<ForumThreadDetailResponse>(`/api/student/lms/forum/threads/${id}/`, [
    'lms',
    'forum',
    'thread',
    id,
  ])

/** Optimistic: the reply appears at once, and a failure keeps the draft text. */
export const useReplyToThread = (threadId: string) => {
  const key = ['lms', 'forum', 'thread', threadId]
  const patch = useOptimistic<ForumThreadDetailResponse, CreateReplyRequest>(key, (prev, vars) => ({
    ...prev,
    replies: [
      ...prev.replies,
      {
        id: `tmp-${crypto.randomUUID()}`,
        body: vars.body,
        authorName: 'You',
        authorAvatarUrl: null,
        isMine: true,
        createdAt: new Date().toISOString(),
      },
    ],
  }))

  return usePostData<unknown, CreateReplyRequest>(
    `/api/student/lms/forum/threads/${threadId}/replies/`,
    key,
    patch,
  )
}

// -------------------------------------------------------------------- notes

const NOTES_KEY = ['lms', 'notes']

export const useNotes = (q: string) =>
  useGetData<Paginated<Note>>(
    `/api/student/lms/notes/${q ? `?q=${encodeURIComponent(q)}` : ''}`,
    [...NOTES_KEY, q],
  )

/**
 * Optimistic. The `tmp-` id is deliberately visible in the data so the row's
 * own actions can be disabled until the server assigns a real one — a DELETE
 * against a `tmp-` id 404s, and the rollback then removes the wrong row.
 */
export const useCreateNote = (q: string) => {
  const key = [...NOTES_KEY, q]
  const patch = useOptimistic<Paginated<Note>, CreateNoteRequest>(key, (page, vars) => ({
    ...page,
    count: page.count + 1,
    results: [
      {
        id: `tmp-${crypto.randomUUID()}`,
        title: vars.title,
        body: vars.body,
        tag: vars.tag ?? null,
        courseId: vars.courseId ?? null,
        updatedAt: new Date().toISOString(),
      },
      ...page.results,
    ],
  }))

  return usePostData<Note, CreateNoteRequest>('/api/student/lms/notes/', key, patch)
}

export const useDeleteNote = (q: string) => {
  const key = [...NOTES_KEY, q]
  const patch = useOptimistic<Paginated<Note>, string>(key, (page, id) => ({
    ...page,
    count: page.count - 1,
    results: page.results.filter((n) => n.id !== id),
  }))

  return useDelete<void, string>((id) => `/api/student/lms/notes/${id}/`, key, patch)
}

// --------------------------------------------------- progress · analytics

export const useLearningProgress = () =>
  useGetData<LearningProgressResponse>('/api/student/lms/progress/', ['lms', 'progress'])

export const useLearningAnalytics = () =>
  useGetData<LearningAnalyticsResponse>('/api/student/lms/analytics/', ['lms', 'analytics'])

// ------------------------------------------------ announcements · gradebook

const ANNOUNCEMENTS_KEY = ['lms', 'announcements']

export const useAnnouncements = () =>
  useGetData<AnnouncementsResponse>('/api/student/lms/announcements/', ANNOUNCEMENTS_KEY)

/** Optimistic and silent on failure — a missed read-receipt is invisible. */
export const useMarkAnnouncementRead = () => {
  const patch = useOptimistic<AnnouncementsResponse, string>(ANNOUNCEMENTS_KEY, (prev, id) => ({
    unreadCount: Math.max(0, prev.unreadCount - 1),
    announcements: prev.announcements.map((a) => (a.id === id ? { ...a, read: true } : a)),
  }))

  return usePostData<void, string>(
    (id) => `/api/student/lms/announcements/${id}/read/`,
    ANNOUNCEMENTS_KEY,
    patch,
  )
}

export const useGradebook = () =>
  useGetData<GradebookResponse>('/api/student/lms/gradebook/', ['lms', 'gradebook'])
