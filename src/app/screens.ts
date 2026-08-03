import { lazy, type ComponentType } from 'react'

/**
 * Built screens, keyed by the path in routes.ts. Anything not listed here
 * falls back to <Placeholder>, which names the Figma node to build from.
 *
 * Each entry must keep its `import()` literal inline — that is what lets the
 * bundler split every screen into its own chunk.
 */
const page = (loader: () => Promise<Record<string, unknown>>, name: string) =>
  lazy(async () => ({ default: (await loader())[name] as ComponentType }))

export const SCREEN_COMPONENTS: Record<string, ComponentType> = {
  // ---------------------------------------------- Phase 3 — dashboards
  '/student': page(() => import('@/features/dashboard/student-dashboard'), 'StudentDashboard'),
  '/faculty': page(() => import('@/features/dashboard/faculty-dashboard'), 'FacultyDashboard'),
  '/admin': page(() => import('@/features/dashboard/admin-dashboard'), 'AdminDashboard'),

  // ------------------------------------------------ Phase 4.1 — academic
  '/student/academic/courses': page(() => import('@/features/academic/pages/my-courses'), 'MyCourses'),
  '/student/academic/curriculum': page(() => import('@/features/academic/pages/curriculum'), 'Curriculum'),
  '/student/academic/degree-progress': page(() => import('@/features/academic/pages/degree-progress'), 'DegreeProgress'),
  '/student/academic/credits': page(() => import('@/features/academic/pages/credit-progress'), 'CreditProgress'),
  '/student/academic/routine': page(() => import('@/features/academic/pages/class-routine'), 'ClassRoutine'),
  '/student/academic/calendar': page(() => import('@/features/academic/pages/academic-calendar'), 'AcademicCalendar'),
  '/student/academic/faculty': page(() => import('@/features/academic/pages/faculty-directory'), 'FacultyDirectory'),
  '/student/academic/classrooms': page(() => import('@/features/academic/pages/classrooms'), 'Classrooms'),
  '/student/academic/registration/courses': page(() => import('@/features/academic/pages/course-registration'), 'CourseRegistration'),
  '/student/academic/registration/semester': page(() => import('@/features/academic/pages/semester-registration'), 'SemesterRegistration'),
  '/student/academic/registration/drop-add': page(() => import('@/features/academic/pages/drop-add'), 'DropAdd'),

  // ----------------------------------------------------- Phase 4.2 — LMS
  '/student/lms': page(() => import('@/features/lms/pages/lms-overview'), 'LmsOverview'),
  '/student/lms/courses': page(() => import('@/features/lms/pages/my-courses'), 'LmsMyCourses'),
  '/student/lms/courses/:id/lectures': page(() => import('@/features/lms/pages/lectures'), 'Lectures'),
  '/student/lms/courses/:id/materials': page(() => import('@/features/lms/pages/materials'), 'Materials'),
  '/student/lms/assignments': page(() => import('@/features/lms/pages/assignments'), 'Assignments'),
  '/student/lms/assignments/:id/submit': page(() => import('@/features/lms/pages/assignment-submission'), 'AssignmentSubmission'),
  '/student/lms/quizzes': page(() => import('@/features/lms/pages/quizzes'), 'Quizzes'),
  '/student/lms/quizzes/:id/practice': page(() => import('@/features/lms/pages/practice-quiz'), 'PracticeQuiz'),
  '/student/lms/live': page(() => import('@/features/lms/pages/live-classes'), 'LiveClasses'),
  '/student/lms/recordings': page(() => import('@/features/lms/pages/recordings'), 'Recordings'),
  '/student/lms/forum': page(() => import('@/features/lms/pages/forum'), 'Forum'),
  '/student/lms/notes': page(() => import('@/features/lms/pages/notes'), 'Notes'),
  '/student/lms/progress': page(() => import('@/features/lms/pages/learning-progress'), 'LearningProgress'),
  '/student/lms/analytics': page(() => import('@/features/lms/pages/learning-analytics'), 'LearningAnalytics'),
  '/student/lms/announcements': page(() => import('@/features/lms/pages/announcements'), 'Announcements'),
  '/student/lms/gradebook': page(() => import('@/features/lms/pages/gradebook'), 'Gradebook'),
  '/student/lms/downloads': page(() => import('@/features/lms/pages/downloads'), 'Downloads'),
}
