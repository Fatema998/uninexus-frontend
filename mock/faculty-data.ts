/**
 * Faculty mock payloads. Typed against `src/types/faculty.ts` — if the
 * contract changes and this stops compiling, mock and doc cannot diverge.
 *
 * Content carried over from the Figma-transcribed fixtures in
 * `src/features/faculty/api.ts`, reshaped onto the wire contract.
 */

import type {
  AssignedSection,
  AssignedSectionsResponse,
  AttendanceSheetResponse,
  FacultyAcademicResponse,
  FacultyAssignment,
  FacultyAssignmentsResponse,
  FacultyDashboardResponse,
  FacultyExamsResponse,
  FacultyFinanceResponse,
  FacultyProfileResponse,
  GradebookResponse,
  GrantsResponse,
  LibraryItem,
  ResearchPortfolioResponse,
  RubricCriterion,
  Section,
  SectionDetailResponse,
  StudentRef,
  SubmissionDetailResponse,
  SubmissionsResponse,
} from '../src/types/faculty.ts'
import type { CourseRef, Id } from '../src/types/index.ts'
import { TERM, dayIn, inDays, inHours } from './data.ts'

const c = (id: string, code: string, title: string, credits: number): CourseRef => ({
  id,
  code,
  title,
  credits,
})

const COURSES = {
  dsa: c('fcrs-1', 'CSE-3101', 'Data Structures & Algorithms', 3),
  dbms: c('fcrs-2', 'CSE-4203', 'Database Management Systems', 3),
  se: c('fcrs-3', 'CSE-5105', 'Software Engineering', 3),
  ai: c('fcrs-4', 'CSE-6207', 'Artificial Intelligence', 3),
  oop: c('fcrs-5', 'CSE-2101', 'Object Oriented Programming', 3),
  os: c('fcrs-6', 'CSE-2203', 'Operating Systems', 3),
  nlp: c('fcrs-7', 'NLP-501', 'Natural Language Processing', 3),
} as const

const section = (
  id: string,
  course: CourseRef,
  name: string,
  enrolledCount: number,
  room: string,
): Section => ({ id, course, name, termId: TERM.id, enrolledCount, room })

export const SECTIONS: AssignedSection[] = [
  { ...section('sec-1', COURSES.dsa, 'A', 52, 'Hall 302'), syllabusProgress: 33, chaptersDone: 4, chaptersTotal: 12 },
  { ...section('sec-2', COURSES.dbms, 'B', 45, 'Lab A'), syllabusProgress: 58, chaptersDone: 7, chaptersTotal: 12 },
  { ...section('sec-3', COURSES.se, 'A', 38, 'Room 210'), syllabusProgress: 41, chaptersDone: 5, chaptersTotal: 12 },
  { ...section('sec-4', COURSES.ai, 'C', 41, 'Lab 3'), syllabusProgress: 27, chaptersDone: 3, chaptersTotal: 11 },
  { ...section('sec-5', COURSES.oop, 'A', 60, 'Hall 401'), syllabusProgress: 72, chaptersDone: 9, chaptersTotal: 12 },
  { ...section('sec-6', COURSES.os, 'B', 47, 'Room 108'), syllabusProgress: 64, chaptersDone: 8, chaptersTotal: 12 },
]

/** Drop the teaching-progress fields; endpoints that only need a `Section`. */
const bare = (s: AssignedSection): Section => ({
  id: s.id,
  course: s.course,
  name: s.name,
  termId: s.termId,
  enrolledCount: s.enrolledCount,
  room: s.room,
})

export const ROSTER: StudentRef[] = [
  { id: 'stu-1', registrationNo: '21-45092-2', fullName: 'Adnan Rahman', avatarUrl: null },
  { id: 'stu-2', registrationNo: '21-45093-1', fullName: 'Sarah Jenkins', avatarUrl: null },
  { id: 'stu-3', registrationNo: '21-45094-3', fullName: 'Marcus Chen', avatarUrl: null },
  { id: 'stu-4', registrationNo: '21-45095-4', fullName: 'Fatima Noor', avatarUrl: null },
  { id: 'stu-5', registrationNo: '21-45096-5', fullName: 'David Wilson', avatarUrl: null },
]

// ===========================================================================
// Dashboard
// ===========================================================================

export const DASHBOARD: FacultyDashboardResponse = {
  metrics: [
    { label: 'Active Courses', value: '06', tone: 'brand', icon: 'BookOpen' },
    { label: 'Total Students', value: '248', tone: 'accent', icon: 'Users' },
    { label: "Today's Classes", value: '03', tone: 'info', icon: 'Clock' },
    { label: 'Pending Assignment Reviews', value: '38', tone: 'warning', icon: 'ClipboardList' },
    { label: 'Attendance Pending', value: '01', tone: 'danger', icon: 'TriangleAlert' },
    { label: 'Research Projects', value: '03', tone: 'brand', icon: 'FlaskConical' },
  ],
  todaySchedule: [
    { id: 'ts-1', section: bare(SECTIONS[0]!), startsAt: inHours(-0.5), endsAt: inHours(1), room: 'Hall 302', state: 'CURRENT' },
    { id: 'ts-2', section: bare(SECTIONS[3]!), startsAt: inHours(3), endsAt: inHours(4.5), room: 'Lab 3', state: 'UPCOMING' },
  ],
  sections: SECTIONS.slice(0, 2).map(bare),
  pendingReviews: [
    { id: 'sub-1', assignmentTitle: 'Assignment 2: BST Implementation', student: ROSTER[1]!, submittedAt: inHours(-2) },
    { id: 'sub-2', assignmentTitle: 'Data Mining Lab Report', student: ROSTER[2]!, submittedAt: inHours(-4) },
  ],
  teachingLoad: { completedHours: 10, remainingHours: 4 },
  activity: [
    { id: 'act-1', title: 'Grades published — Midterm, CSE-3101 Sec A', at: inHours(-0.3), tone: 'brand' },
    { id: 'act-2', title: 'New course material — Advanced ML Lecture 04', at: inHours(-1), tone: 'accent' },
    { id: 'act-3', title: 'Meeting scheduled — Curriculum Committee', at: inHours(-3), tone: 'success' },
  ],
  insight: 'Students in CSE-3101 are struggling with recursion. Consider a remedial session.',
}

// ===========================================================================
// Academic
// ===========================================================================

export const ACADEMIC: FacultyAcademicResponse = {
  metrics: [
    { label: 'Total Academic Weeks', value: '16', tone: 'brand' },
    { label: 'Current Week', value: 'Week 08', tone: 'accent' },
    { label: 'Active Semester', value: TERM.name, tone: 'info' },
    { label: 'Total Assigned Hours', value: '14 hrs/week', tone: 'warning' },
  ],
  term: { id: TERM.id, name: TERM.name, weekNumber: 8, totalWeeks: 16 },
  weeklySchedule: [
    { id: 'ws-1', label: 'CSE-3101 Sec A', room: 'Hall 302', day: 'MON', startsAt: '09:00', endsAt: '10:30' },
    { id: 'ws-2', label: 'CSE-4203 Sec B', room: 'Lab A', day: 'TUE', startsAt: '11:00', endsAt: '12:30' },
    { id: 'ws-3', label: 'Office Hours', room: 'Room 105', day: 'WED', startsAt: '14:00', endsAt: '16:00' },
    { id: 'ws-4', label: 'Research Sync', room: 'Virtual', day: 'THU', startsAt: '10:00', endsAt: '11:00' },
  ],
  milestones: [
    { id: 'ms-1', title: 'Midterm Examinations', note: 'Question paper submission deadline by midnight.', dueAt: inDays(6) },
    { id: 'ms-2', title: 'Project Proposals', note: 'CSE-4203 final year project defense sessions start.', dueAt: inDays(20) },
    { id: 'ms-3', title: 'Final Examinations', note: `Closure of ${TERM.name} semester activities.`, dueAt: inDays(48) },
  ],
}

// ===========================================================================
// Courses
// ===========================================================================

export const ASSIGNED_SECTIONS: AssignedSectionsResponse = { sections: SECTIONS }

export function sectionDetail(id: string): SectionDetailResponse | null {
  const found = SECTIONS.find((s) => s.id === id)
  if (!found) return null
  return {
    section: found,
    materials: [
      { id: 'mat-1', filename: 'Lecture_04_Recursion.pdf', sizeBytes: 2_411_724, mimeType: 'application/pdf', url: '/mock/files/Lecture_04_Recursion.pdf', uploadedAt: inDays(-8) },
      { id: 'mat-2', filename: 'Intro_to_Trees.pptx', sizeBytes: 5_872_026, mimeType: 'application/vnd.ms-powerpoint', url: '/mock/files/Intro_to_Trees.pptx', uploadedAt: inDays(-11) },
    ],
    recentActivity: [
      { id: 'ra-1', title: 'Attendance marked', at: inHours(-3) },
      { id: 'ra-2', title: 'Assignment published', at: inDays(-1) },
    ],
  }
}

// ===========================================================================
// Assignments
// ===========================================================================

export const RUBRIC: RubricCriterion[] = [
  { id: 'rub-1', label: 'Correctness', maxPoints: 40 },
  { id: 'rub-2', label: 'Complexity analysis', maxPoints: 25 },
  { id: 'rub-3', label: 'Code quality', maxPoints: 20 },
  { id: 'rub-4', label: 'Documentation', maxPoints: 15 },
]

export const ASSIGNMENTS: FacultyAssignment[] = [
  { id: 'fasg-1', title: 'Assignment 2: BST Implementation', section: bare(SECTIONS[0]!), dueAt: inDays(-2), totalPoints: 100, submittedCount: 48, gradedCount: 30, enrolledCount: 52, published: true },
  { id: 'fasg-2', title: 'Normalization Case Study', section: bare(SECTIONS[1]!), dueAt: inDays(4), totalPoints: 100, submittedCount: 21, gradedCount: 0, enrolledCount: 45, published: true },
  { id: 'fasg-3', title: 'Sprint Retrospective Report', section: bare(SECTIONS[2]!), dueAt: inDays(9), totalPoints: 50, submittedCount: 0, gradedCount: 0, enrolledCount: 38, published: true },
  { id: 'fasg-4', title: 'Search Heuristics Lab', section: bare(SECTIONS[3]!), dueAt: inDays(14), totalPoints: 100, submittedCount: 0, gradedCount: 0, enrolledCount: 41, published: false },
]

export const ASSIGNMENTS_RESPONSE: FacultyAssignmentsResponse = {
  metrics: [
    { label: 'Active Assignments', value: '04', tone: 'brand' },
    { label: 'Submissions Received', value: '182', tone: 'accent' },
    { label: 'Pending Marking', value: '38', tone: 'warning' },
    { label: 'Average Score', value: '76.4', tone: 'info' },
  ],
  assignments: ASSIGNMENTS,
  scoreDistribution: [
    { band: '90–100', count: 24 },
    { band: '80–89', count: 51 },
    { band: '70–79', count: 62 },
    { band: '60–69', count: 33 },
    { band: 'Below 60', count: 12 },
  ],
  insight: 'Grading speed increased by 42% this term.',
}

export function submissionsFor(assignmentId: string): SubmissionsResponse | null {
  const assignment = ASSIGNMENTS.find((a) => a.id === assignmentId)
  if (!assignment) return null
  return {
    assignment,
    rubric: RUBRIC,
    submissions: ROSTER.map((student, i) => ({
      id: `sub-${assignmentId}-${i}`,
      student,
      submittedAt: i === 4 ? null : inDays(-3 + i * 0.2),
      late: i === 2,
      score: i < 2 ? 82 - i * 6 : null,
      graded: i < 2,
    })),
  }
}

export function submissionDetail(id: string): SubmissionDetailResponse {
  return {
    id,
    assignment: ASSIGNMENTS[0]!,
    student: { ...ROSTER[0]!, cgpa: 3.82, lateSubmissions: 0 },
    submittedAt: inDays(-2),
    late: false,
    comment: 'Included the iterative traversal as an appendix.',
    attachments: [
      { id: 'satt-1', filename: 'bst.cpp', sizeBytes: 12_402, mimeType: 'text/x-c', url: '/mock/files/bst.cpp', uploadedAt: inDays(-2) },
    ],
    body: 'void inorderTraversal(Node* root) {\n  if (!root) return;\n  inorderTraversal(root->left);\n  visit(root);\n  inorderTraversal(root->right);\n}',
    rubric: RUBRIC,
    scores: [],
    feedback: null,
    totalScore: null,
  }
}

// ===========================================================================
// Gradebook
// ===========================================================================

export const COLUMNS = [
  { id: 'col-1', label: 'Midterm', maxPoints: 30, weightPercent: 30, editable: true },
  { id: 'col-2', label: 'Assignment', maxPoints: 20, weightPercent: 20, editable: true },
  { id: 'col-3', label: 'Final', maxPoints: 50, weightPercent: 50, editable: true },
]

/** Mutable: the gradebook is the one sheet a teacher edits in bulk. */
export const GRADES: Record<Id, Record<Id, number | null>> = {
  'stu-1': { 'col-1': 28, 'col-2': 18, 'col-3': null },
  'stu-2': { 'col-1': 30, 'col-2': 19, 'col-3': null },
  'stu-3': { 'col-1': 24, 'col-2': 15, 'col-3': null },
  'stu-4': { 'col-1': 27, 'col-2': 20, 'col-3': null },
  'stu-5': { 'col-1': null, 'col-2': null, 'col-3': null },
}

const LETTER = (pct: number) =>
  pct >= 90 ? 'A' : pct >= 80 ? 'A-' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : 'C'

export function gradebook(sectionId: string): GradebookResponse {
  const found = SECTIONS.find((s) => s.id === sectionId) ?? SECTIONS[0]!
  const rows = ROSTER.map((student) => {
    const scores = GRADES[student.id] ?? {}
    const entered = COLUMNS.filter((col) => scores[col.id] != null)
    // Total is only meaningful once every column is in — a partial sum reads
    // like a failing grade to a student who has simply not sat the final.
    const complete = entered.length === COLUMNS.length
    const total = complete ? entered.reduce((n, col) => n + (scores[col.id] ?? 0), 0) : null
    return {
      student,
      scores: Object.fromEntries(COLUMNS.map((col) => [col.id, scores[col.id] ?? null])),
      total,
      grade: total === null ? null : LETTER(total),
    }
  })

  return {
    section: bare(found),
    columns: COLUMNS,
    rows,
    remainingEntries: rows.reduce(
      (n, r) => n + COLUMNS.filter((col) => r.scores[col.id] === null).length,
      0,
    ),
  }
}

// ===========================================================================
// Attendance
// ===========================================================================

/** sessionId -> studentId -> mark. Persists for the life of the process. */
export const ATTENDANCE: Record<string, Record<Id, string>> = {}

export function attendanceSheet(sectionId: string, date: string): AttendanceSheetResponse {
  const found = SECTIONS.find((s) => s.id === sectionId) ?? SECTIONS[0]!
  const sessionId = `ses-${found.id}-${date}`
  const saved = ATTENDANCE[sessionId]

  return {
    section: bare(found),
    date,
    session: { id: sessionId, startsAt: `${date}T09:00:00Z`, endsAt: `${date}T10:30:00Z` },
    roster: ROSTER.map((student) => ({
      student,
      mark: (saved?.[student.id] as never) ?? (student.id === 'stu-3' ? 'ABSENT' : 'PRESENT'),
    })),
    submitted: saved !== undefined,
    lastSession: { date: dayIn(-2), presentCount: 42, totalCount: 52 },
  }
}

// ===========================================================================
// Examinations
// ===========================================================================

export const EXAMS: FacultyExamsResponse = {
  metrics: [
    { label: 'Upcoming Exams', value: '02', tone: 'brand' },
    { label: 'Pending Evaluation', value: '84', tone: 'warning' },
    { label: 'Papers Submitted', value: '03', tone: 'success' },
    { label: 'Exam Duty Hours', value: '06', tone: 'info' },
  ],
  papers: [
    { id: 'pap-1', section: section('sec-7', COURSES.nlp, 'A', 34, 'Hall 201'), status: 'DRAFT', dueAt: inDays(3), submittedAt: null },
    { id: 'pap-2', section: bare(SECTIONS[0]!), status: 'SUBMITTED', dueAt: inDays(-4), submittedAt: inDays(-5) },
    { id: 'pap-3', section: bare(SECTIONS[1]!), status: 'APPROVED', dueAt: inDays(-12), submittedAt: inDays(-14) },
  ],
  duties: [
    { id: 'duty-1', title: 'Invigilation — NLP-501', startsAt: inDays(5), endsAt: inDays(5.1), venue: 'Main Hall A' },
    { id: 'duty-2', title: 'Question paper review', startsAt: inDays(2), endsAt: inDays(2.08), venue: 'Room 105' },
  ],
}

// ===========================================================================
// Profile · research · library · finance
// ===========================================================================

export const PROFILE: FacultyProfileResponse = {
  id: 'fac-me',
  fullName: 'Dr. Hasan Mahmud',
  designation: 'Professor',
  email: 'hasan.mahmud@unigpt.edu',
  phone: '+880 1712-345678',
  officeRoom: 'Room 105',
  avatarUrl: null,
  specializations: ['Neural Network Architectures', 'Computer Vision'],
  metrics: [
    { label: 'Research Index', value: '18', tone: 'brand' },
    { label: 'Citations', value: '340', tone: 'accent' },
  ],
  education: [
    { id: 'edu-1', institution: 'Stanford University, USA', degree: 'Ph.D. in Computer Science', note: 'Focus: neural network architectures and computer vision' },
    { id: 'edu-2', institution: 'BUET, Bangladesh', degree: 'B.Sc. in Computer Science & Engineering', note: 'First class, first position' },
  ],
}

const PUBLICATIONS = [
  { id: 'pub-1', title: 'A Deep Learning Approach to Bengali Semantic Search', venue: 'IEEE Transactions on Knowledge and Data Engineering', year: 2023, citationCount: 41, doi: '10.1109/TKDE.2023.0001', url: null },
  { id: 'pub-2', title: 'Cross-Lingual Information Retrieval for Bengali Queries', venue: 'ACM Transactions on Information Systems', year: 2022, citationCount: 28, doi: '10.1145/TOIS.2022.0002', url: null },
  { id: 'pub-3', title: 'Transformer Based Summarization for Bengali News', venue: 'Journal of Computer Science', year: 2022, citationCount: 17, doi: null, url: null },
]

export const RESEARCH: ResearchPortfolioResponse = {
  metrics: [
    { label: 'Active Grants', value: '02', tone: 'brand' },
    { label: 'Published Papers', value: '14', tone: 'accent' },
    { label: 'Citations', value: '340', tone: 'info' },
    { label: 'Research Assistants', value: '04', tone: 'success' },
  ],
  publications: PUBLICATIONS,
}

export const GRANTS: GrantsResponse = {
  currency: 'BDT',
  metrics: [
    { label: 'Active Projects', value: '03', tone: 'brand' },
    { label: 'Published Papers', value: '14', tone: 'accent' },
    { label: 'Grant Funding', value: '৳12,50,000', tone: 'success' },
    { label: 'Student RAs', value: '05', tone: 'info' },
  ],
  projects: [
    { id: 'prj-1', title: 'AI-Driven Predictive Analytics in Healthcare', state: 'ACTIVE', fundingBody: 'UGC Bangladesh', awarded: '600000.00', spent: '340000.00', startsOn: dayIn(-300), endsOn: dayIn(120), assistantCount: 2 },
    { id: 'prj-2', title: 'Optimized Graph Algorithms for Traffic Routing', state: 'ACTIVE', fundingBody: 'Ministry of ICT', awarded: '450000.00', spent: '180000.00', startsOn: dayIn(-150), endsOn: dayIn(250), assistantCount: 2 },
    { id: 'prj-3', title: 'Multi-Agent Systems for Disaster Response', state: 'REVIEW', fundingBody: 'World Bank', awarded: '200000.00', spent: '0.00', startsOn: dayIn(30), endsOn: dayIn(430), assistantCount: 1 },
  ],
  publications: PUBLICATIONS.slice(0, 2),
}

export const LIBRARY: LibraryItem[] = [
  { id: 'lib-1', title: 'Advanced Neural Architectures', author: 'Dr. Sarah J. Mitchell', kind: 'BOOK', year: 2023, available: true, availableAt: null, shelf: 'CS-402' },
  { id: 'lib-2', title: 'Principles of Distributed Systems', author: 'Prof. Robert Arkwright', kind: 'BOOK', year: 2021, available: false, availableAt: dayIn(9), shelf: 'CS-311' },
  { id: 'lib-3', title: 'Sustainable Computing Review 2024', author: 'Global Eco-Review', kind: 'JOURNAL', year: 2024, available: true, availableAt: null, shelf: 'PER-88' },
  { id: 'lib-4', title: 'Compiler Design in Practice', author: 'Dr. Linus K. Vogel', kind: 'BOOK', year: 2020, available: true, availableAt: null, shelf: 'CS-206' },
  { id: 'lib-5', title: 'Bengali NLP Corpus v3', author: 'UniGPT Research Lab', kind: 'DATASET', year: 2024, available: true, availableAt: null, shelf: null },
]

export const FINANCE: FacultyFinanceResponse = {
  currency: 'BDT',
  metrics: [
    { label: 'Monthly Base Salary', value: '৳115,000.00', tone: 'brand' },
    { label: 'YTD Earnings', value: '৳460,000.00', tone: 'success' },
    { label: 'Tax Deductions', value: '৳57,500.00', tone: 'warning' },
  ],
  payslips: ['2026-05', '2026-04', '2026-03', '2026-02'].map((period) => ({
    id: `pay-${period}`,
    period,
    paidOn: `${period}-01`,
    gross: '115000.00',
    deductions: '14375.00',
    net: '100625.00',
    pdfUrl: `/mock/files/payslip-${period}.pdf`,
  })),
  payoutMethod: { label: 'Dutch-Bangla Bank', maskedAccount: '••••4412' },
}
