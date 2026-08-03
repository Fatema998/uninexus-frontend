/**
 * Faculty persona wire types — one entry per endpoint in docs/api/faculty.md.
 *
 * Same conventions as the student contract (src/types/common.ts §scalars):
 * ISO instants, decimal-string money, SCREAMING_SNAKE enums, nulls not
 * sentinels, server-owned totals.
 *
 * The shape difference that matters: a student reads their own record, a
 * faculty member *writes* other people's. Every write here lands on a
 * student's transcript, so the mutation set is bigger, the validation is
 * stricter, and almost none of it is optimistic — see docs/api/faculty.md §5.
 */

import type {
  Attachment,
  AttendanceMark,
  CourseRef,
  Id,
  ISODate,
  ISODateTime,
  Metric,
  Money,
  TimeOfDay,
  Tone,
} from './common'

// ===========================================================================
// Shared entities
// ===========================================================================

/**
 * A specific class a faculty member teaches: one course, one section, one
 * term. `CourseRef` alone is not enough — the same course runs three sections
 * with different rosters, and every faculty write is section-scoped.
 */
export type Section = {
  id: Id
  course: CourseRef
  /** `A`, `B`, `C` — the registrar's label. */
  name: string
  termId: Id
  enrolledCount: number
  room: string | null
}

/** A student as their teacher sees them. Never carries fee or contact data. */
export type StudentRef = {
  id: Id
  /** `21-45092-2` — the registrar's number, printed on everything. */
  registrationNo: string
  fullName: string
  avatarUrl: string | null
}

// ===========================================================================
// Dashboard  ·  GET /api/faculty/dashboard/
// ===========================================================================

export type TeachingSlot = {
  id: Id
  section: Section
  startsAt: ISODateTime
  endsAt: ISODateTime
  room: string
  /** Server-computed against the clock, so the badge cannot drift. */
  state: 'CURRENT' | 'UPCOMING' | 'DONE'
}

export type FacultyDashboardResponse = {
  metrics: Metric[]
  todaySchedule: TeachingSlot[]
  sections: Section[]
  /** Oldest-first: the queue a teacher should work through. */
  pendingReviews: {
    id: Id
    assignmentTitle: string
    student: StudentRef
    submittedAt: ISODateTime
  }[]
  teachingLoad: { completedHours: number; remainingHours: number }
  activity: { id: Id; title: string; at: ISODateTime; tone: Tone }[]
  insight: string | null
}

// ===========================================================================
// Academic  ·  GET /api/faculty/academic/
// ===========================================================================

export type FacultyAcademicResponse = {
  metrics: Metric[]
  term: { id: Id; name: string; weekNumber: number; totalWeeks: number }
  weeklySchedule: {
    id: Id
    label: string
    room: string
    day: string
    startsAt: TimeOfDay
    endsAt: TimeOfDay
  }[]
  milestones: { id: Id; title: string; note: string; dueAt: ISODateTime }[]
}

// ===========================================================================
// Courses
// ===========================================================================

/** GET /api/faculty/sections/ — every section this member teaches. */
export type AssignedSection = Section & {
  /** 0–100, syllabus delivered. */
  syllabusProgress: number
  chaptersDone: number
  chaptersTotal: number
}

export type AssignedSectionsResponse = { sections: AssignedSection[] }

/** GET /api/faculty/sections/{id}/ */
export type SectionDetailResponse = {
  section: AssignedSection
  materials: Attachment[]
  recentActivity: { id: Id; title: string; at: ISODateTime }[]
}

/**
 * POST /api/faculty/sections/{id}/materials/ — `multipart/form-data`.
 * Typed for the form model, not for `JSON.stringify`.
 */
export type UploadMaterialRequest = {
  files: File[]
  /** Shown to students under the file name. */
  note: string
}

/** DELETE /api/faculty/sections/{id}/materials/{materialId}/ → 204 */

// ===========================================================================
// Assignments
// ===========================================================================

/** GET /api/faculty/assignments/ */
export type FacultyAssignment = {
  id: Id
  title: string
  section: Section
  dueAt: ISODateTime
  totalPoints: number
  submittedCount: number
  gradedCount: number
  /** Roster size at time of computation — the denominator for both counts. */
  enrolledCount: number
  published: boolean
}

export type FacultyAssignmentsResponse = {
  metrics: Metric[]
  assignments: FacultyAssignment[]
  /** Score bands across all graded work. Server-computed. */
  scoreDistribution: { band: string; count: number }[]
  insight: string | null
}

/** POST /api/faculty/assignments/ */
export type CreateAssignmentRequest = {
  sectionId: Id
  title: string
  brief: string
  requirements: string[]
  dueAt: ISODateTime
  totalPoints: number
  /** False saves a draft students cannot see. */
  publish: boolean
}

// --------------------------------------------------------------- grading

export type RubricCriterion = {
  id: Id
  label: string
  maxPoints: number
}

/** GET /api/faculty/assignments/{id}/submissions/ */
export type SubmissionSummary = {
  id: Id
  student: StudentRef
  submittedAt: ISODateTime | null
  /** True when `submittedAt` is past the assignment's `dueAt`. */
  late: boolean
  /** Null until graded. */
  score: number | null
  graded: boolean
}

export type SubmissionsResponse = {
  assignment: FacultyAssignment
  rubric: RubricCriterion[]
  submissions: SubmissionSummary[]
}

/** GET /api/faculty/submissions/{id}/ */
export type SubmissionDetailResponse = {
  id: Id
  assignment: FacultyAssignment
  student: StudentRef & {
    /** Context for the grader, not the student's full record. */
    cgpa: number | null
    lateSubmissions: number
  }
  submittedAt: ISODateTime | null
  late: boolean
  comment: string
  attachments: Attachment[]
  /** Inline text submission, when the assignment takes one. Markdown. */
  body: string | null
  rubric: RubricCriterion[]
  /** Existing marks, empty on an ungraded submission. */
  scores: { criterionId: Id; points: number }[]
  feedback: string | null
  totalScore: number | null
}

/**
 * PUT /api/faculty/submissions/{id}/grade/
 *
 * PUT, not PATCH: a grade is replaced wholesale, and a partial rubric would
 * silently keep stale marks from a previous pass.
 */
export type GradeSubmissionRequest = {
  scores: { criterionId: Id; points: number }[]
  feedback: string
  /** False keeps it provisional and invisible to the student. */
  release: boolean
}

export type GradeSubmissionResult = {
  id: Id
  totalScore: number
  grade: string
  released: boolean
  gradedAt: ISODateTime
}

// ===========================================================================
// Gradebook
// ===========================================================================

export type AssessmentColumn = {
  id: Id
  label: string
  maxPoints: number
  /** Weight toward the final grade, 0–100. */
  weightPercent: number
  /** False once results are published — the column locks. */
  editable: boolean
}

/** GET /api/faculty/gradebook/?sectionId= */
export type GradebookResponse = {
  section: Section
  columns: AssessmentColumn[]
  rows: {
    student: StudentRef
    /** columnId -> points. Missing key means not yet entered. */
    scores: Record<Id, number | null>
    total: number | null
    grade: string | null
  }[]
  /** Cells still empty across the whole sheet. */
  remainingEntries: number
}

/**
 * PATCH /api/faculty/gradebook/?sectionId=
 *
 * Batched: a teacher tabs through thirty cells, and thirty requests would
 * race each other into an inconsistent sheet. One request, one transaction.
 */
export type SaveGradesRequest = {
  entries: { studentId: Id; columnId: Id; points: number | null }[]
}

export type SaveGradesResult = {
  saved: number
  /** Cells the server refused, with why. Render against the cell. */
  rejected: { studentId: Id; columnId: Id; reason: string }[]
}

// ===========================================================================
// Attendance
// ===========================================================================

/** GET /api/faculty/attendance/?sectionId=&date= */
export type AttendanceSheetResponse = {
  section: Section
  date: ISODate
  /** Null when no class is scheduled that day — render the reason, not zeros. */
  session: { id: Id; startsAt: ISODateTime; endsAt: ISODateTime } | null
  roster: { student: StudentRef; mark: AttendanceMark }[]
  /** Already submitted once — the UI shows "edit" rather than "submit". */
  submitted: boolean
  lastSession: { date: ISODate; presentCount: number; totalCount: number } | null
}

/**
 * PUT /api/faculty/attendance/{sessionId}/
 *
 * The whole roster, every time. A partial submit cannot distinguish
 * "unmarked" from "marked absent", and that difference is a student's
 * exam eligibility.
 */
export type SubmitAttendanceRequest = {
  marks: { studentId: Id; mark: AttendanceMark }[]
}

export type SubmitAttendanceResult = {
  sessionId: Id
  presentCount: number
  totalCount: number
  submittedAt: ISODateTime
}

// ===========================================================================
// Examinations
// ===========================================================================

/** GET /api/faculty/exams/ */
export type FacultyExamsResponse = {
  metrics: Metric[]
  /** Papers this member owns, with the submission deadline. */
  papers: {
    id: Id
    section: Section
    status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
    dueAt: ISODateTime
    submittedAt: ISODateTime | null
  }[]
  duties: {
    id: Id
    title: string
    startsAt: ISODateTime
    endsAt: ISODateTime
    venue: string
  }[]
}

/** POST /api/faculty/exams/papers/{id}/submit/ — multipart. */
export type SubmitPaperRequest = { file: File; note: string }

// ===========================================================================
// Profile
// ===========================================================================

/** GET /api/faculty/profile/ */
export type FacultyProfileResponse = {
  id: Id
  fullName: string
  designation: string
  email: string
  phone: string | null
  officeRoom: string | null
  avatarUrl: string | null
  specializations: string[]
  metrics: Metric[]
  education: { id: Id; institution: string; degree: string; note: string }[]
}

/** PATCH /api/faculty/profile/ — only the fields a member may self-edit. */
export type UpdateProfileRequest = Partial<{
  phone: string
  officeRoom: string
  specializations: string[]
}>

// ===========================================================================
// Research
// ===========================================================================

/** GET /api/faculty/research/ */
export type Publication = {
  id: Id
  title: string
  venue: string
  year: number
  citationCount: number
  doi: string | null
  url: string | null
}

export type ResearchPortfolioResponse = {
  metrics: Metric[]
  publications: Publication[]
}

export type ProjectState = 'ACTIVE' | 'REVIEW' | 'CLOSED'

/** GET /api/faculty/research/grants/ */
export type GrantProject = {
  id: Id
  title: string
  state: ProjectState
  fundingBody: string
  awarded: Money
  spent: Money
  startsOn: ISODate
  endsOn: ISODate
  assistantCount: number
}

export type GrantsResponse = {
  currency: 'BDT'
  metrics: Metric[]
  projects: GrantProject[]
  publications: Publication[]
}

// ===========================================================================
// Library
// ===========================================================================

export type LibraryItemKind = 'BOOK' | 'JOURNAL' | 'THESIS' | 'DATASET'

/** GET /api/faculty/library/?q=&kind= — `Paginated<LibraryItem>` */
export type LibraryItem = {
  id: Id
  title: string
  author: string
  kind: LibraryItemKind
  year: number | null
  /** False when every copy is out; `availableAt` says when one returns. */
  available: boolean
  availableAt: ISODate | null
  shelf: string | null
}

/** POST /api/faculty/library/{id}/reserve/ */
export type ReserveItemResult = {
  id: Id
  itemId: Id
  status: 'RESERVED' | 'QUEUED'
  /** Position when queued, null when reserved outright. */
  queuePosition: number | null
  expiresAt: ISODateTime | null
}

// ===========================================================================
// Personal finance
// ===========================================================================

/** GET /api/faculty/finance/ */
export type Payslip = {
  id: Id
  /** `2026-05` — the pay period, not a display string. */
  period: string
  paidOn: ISODate
  gross: Money
  deductions: Money
  net: Money
  pdfUrl: string
}

export type FacultyFinanceResponse = {
  currency: 'BDT'
  metrics: Metric[]
  payslips: Payslip[]
  payoutMethod: { label: string; maskedAccount: string } | null
}
