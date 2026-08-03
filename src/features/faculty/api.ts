import { useFixture } from '@/lib/fixtures'
import type { MetricTone } from '@/components/patterns/metric-card'

/** Faculty module data (Phase 5 — 14 screens). Content from Figma 1:433 et al. */

export type FacultyCourse = {
  code: string
  name: string
  section: string
  students: number
  progress: number
}

const COURSES: FacultyCourse[] = [
  { code: 'CSE 3101', name: 'Data Structures & Algorithms', section: 'Sec A', students: 52, progress: 33 },
  { code: 'CSE 4203', name: 'Database Management Systems', section: 'Sec B', students: 45, progress: 58 },
  { code: 'CSE 5105', name: 'Software Engineering', section: 'Sec A', students: 38, progress: 41 },
  { code: 'CSE 6207', name: 'Artificial Intelligence', section: 'Sec C', students: 41, progress: 27 },
  { code: 'CSE 2101', name: 'Object Oriented Programming', section: 'Sec A', students: 60, progress: 72 },
  { code: 'CSE 2203', name: 'Operating Systems', section: 'Sec B', students: 47, progress: 64 },
]

export const useAssignedCourses = () =>
  useFixture<{ courses: FacultyCourse[] }>(['faculty', 'courses', 'assigned'], { courses: COURSES })

export const useCoursesManagement = () =>
  useFixture<{
    courses: FacultyCourse[]
    chaptersNote: string
    materials: { name: string; uploaded: string }[]
    activity: { title: string; meta: string }[]
  }>(['faculty', 'courses'], {
    courses: COURSES.slice(0, 4),
    chaptersNote: '4 of 12 chapters completed this semester.',
    materials: [
      { name: 'Lecture_04_Recursion.pdf', uploaded: 'Uploaded: Jan 15, 2026' },
      { name: 'Intro_to_Trees.pptx', uploaded: 'Uploaded: Jan 12, 2026' },
    ],
    activity: [
      { title: 'Attendance Marked', meta: 'Today, 11:30 AM • CSE 3101' },
      { title: 'Assignment Published', meta: 'Yesterday, 04:15 PM • CSE 4203' },
    ],
  })

export const useFacultyAssignments = () =>
  useFixture<{
    metrics: { label: string; value: string; tone: MetricTone }[]
    distribution: { band: string; count: number }[]
    insight: string
  }>(['faculty', 'assignments'], {
    metrics: [
      { label: 'Active Assignments', value: '04', tone: 'brand' },
      { label: 'Submissions Received', value: '182', tone: 'accent' },
      { label: 'Pending Marking', value: '38', tone: 'warning' },
      { label: 'Average Score', value: '76.4', tone: 'info' },
    ],
    distribution: [
      { band: '90–100', count: 24 },
      { band: '80–89', count: 51 },
      { band: '70–79', count: 62 },
      { band: '60–69', count: 33 },
      { band: 'Below 60', count: 12 },
    ],
    insight: 'Grading Speed increased by 42%',
  })

export const useAssignmentReview = (id: string) =>
  useFixture<{
    assignment: string
    student: { name: string; id: string; gpa: string; late: number }
    code: string
    metrics: { label: string; value: string; tone: MetricTone }[]
    rubric: { label: string; max: number }[]
  }>(['faculty', 'assignments', id, 'review'], {
    assignment: 'Assignment 2: BST Implementation',
    student: { name: 'Adnan Rahman', id: '21-45092-2', gpa: '3.82', late: 0 },
    code: 'void inorderTraversal(Node* root) { ... }',
    metrics: [
      { label: 'Total Submitted', value: '182', tone: 'brand' },
      { label: 'Pending Grading', value: '38', tone: 'warning' },
      { label: 'Graded', value: '144', tone: 'success' },
      { label: 'Average Marks', value: '76.4', tone: 'info' },
    ],
    rubric: [
      { label: 'Correctness', max: 40 },
      { label: 'Complexity analysis', max: 25 },
      { label: 'Code quality', max: 20 },
      { label: 'Documentation', max: 15 },
    ],
  })

export type GradeRow = {
  id: string
  name: string
  midterm: number | null
  assignment: number | null
  final: number | null
}

export const useGradebook = () =>
  useFixture<{ courses: string[]; assessments: string[]; rows: GradeRow[]; remaining: number }>(
    ['faculty', 'gradebook'],
    {
      courses: ['CSE 3101 - Data Structures & Algorithms', 'CSE 4203 - Database Management Systems'],
      assessments: ['All Assessments', 'Midterm', 'Assignment', 'Final'],
      remaining: 42,
      rows: [
        { id: '21-45092-2', name: 'Adnan Rahman', midterm: 28, assignment: 18, final: null },
        { id: '21-45093-1', name: 'Sarah Jenkins', midterm: 30, assignment: 19, final: null },
        { id: '21-45094-3', name: 'Marcus Chen', midterm: 24, assignment: 15, final: null },
        { id: '21-45095-4', name: 'Fatima Noor', midterm: 27, assignment: 20, final: null },
      ],
    },
  )

export type AttendanceStudent = { id: string; name: string; present: boolean }

export const useFacultyAttendance = () =>
  useFixture<{
    session: string
    lastSession: string
    students: AttendanceStudent[]
    notices: { time: string; title: string; place: string }[]
  }>(['faculty', 'attendance'], {
    session: 'CSE 3101 Sec A',
    lastSession: 'Yesterday • 42 Present',
    students: [
      { id: '21-45092-2', name: 'Adnan Rahman', present: true },
      { id: '21-45093-1', name: 'Sarah Jenkins', present: true },
      { id: '21-45094-3', name: 'Marcus Chen', present: false },
      { id: '21-45095-4', name: 'Fatima Noor', present: true },
      { id: '21-45096-5', name: 'David Wilson', present: true },
    ],
    notices: [
      { time: '02:00 PM Today', title: 'Faculty Meeting', place: 'Board Room • Room 101' },
      { time: 'Tomorrow', title: 'Workshop: AI in Ed', place: 'Auditorium • 10:00 AM' },
    ],
  })

export const useFacultyExams = () =>
  useFixture<{
    metrics: { label: string; value: string; tone: MetricTone }[]
    courses: string[]
    duties: { title: string; when: string; place: string }[]
  }>(['faculty', 'exams'], {
    metrics: [
      { label: 'Upcoming Exams', value: '02', tone: 'brand' },
      { label: 'Pending Evaluation', value: '84', tone: 'warning' },
      { label: 'Papers Submitted', value: '03', tone: 'success' },
      { label: 'Exam Duty Hours', value: '06', tone: 'info' },
    ],
    courses: ['Natural Language Processing (NLP-501)', 'Data Structures (CSE 3101)'],
    duties: [
      { title: 'Invigilation — NLP-501', when: 'Oct 24, 10:30 AM', place: 'Main Hall A' },
      { title: 'Question paper review', when: 'Oct 20, 02:00 PM', place: 'Room 105' },
    ],
  })

export const useFacultyProfile = () =>
  useFixture<{
    fields: { label: string; value: string }[]
    metrics: { label: string; value: string; tone: MetricTone }[]
    education: { school: string; note: string }[]
  }>(['faculty', 'profile'], {
    fields: [
      { label: 'Full Legal Name', value: 'Dr. Hasan Mahmud' },
      { label: 'Designation', value: 'Professor' },
      { label: 'Official Email', value: 'hasan.mahmud@unigpt.edu' },
      { label: 'Contact Number', value: '+880 1712-345678' },
      { label: 'Office Room', value: 'Room 105' },
      { label: 'Specialization', value: 'Neural Network Architectures, Computer Vision' },
    ],
    metrics: [
      { label: 'Research Index', value: '18', tone: 'brand' },
      { label: 'Citations', value: '340', tone: 'accent' },
    ],
    education: [
      { school: 'Stanford University, USA', note: 'Focus: Neural Network Architectures and Computer Vision' },
      { school: 'BUET, Bangladesh', note: 'B.Sc. in Computer Science & Engineering' },
    ],
  })

export const useFacultyAcademic = () =>
  useFixture<{
    metrics: { label: string; value: string; tone: MetricTone }[]
    schedule: { code: string; place: string }[]
    milestones: { title: string; note: string }[]
  }>(['faculty', 'academic'], {
    metrics: [
      { label: 'Total Academic Weeks', value: '16', tone: 'brand' },
      { label: 'Current Week', value: 'Week 08', tone: 'accent' },
      { label: 'Active Semester', value: 'Spring 2026', tone: 'info' },
      { label: 'Total Assigned Hours', value: '14 hrs/week', tone: 'warning' },
    ],
    schedule: [
      { code: 'CSE 3101', place: 'Hall 302' },
      { code: 'CSE 4203', place: 'Lab A' },
      { code: 'Office Hrs', place: 'Room 105' },
      { code: 'Research Sync', place: 'Virtual' },
    ],
    milestones: [
      { title: 'Midterm Examinations', note: 'Question paper submission deadline by midnight.' },
      { title: 'Project Proposals', note: 'CSE 4203 final year project defense sessions start.' },
      { title: 'Final Examinations', note: 'Closure of Spring 2026 semester activities.' },
    ],
  })

export const useFacultyLibrary = () =>
  useFixture<{ items: { title: string; author: string; kind: string }[] }>(['faculty', 'library'], {
    items: [
      { title: 'Advanced Neural Architectures', author: 'by Dr. Sarah J. Mitchell', kind: 'Book' },
      { title: 'Principles of Distributed Systems', author: 'by Prof. Robert Arkwright', kind: 'Book' },
      { title: 'Sustainable Computing Review 2024', author: 'Published by Global Eco-Review', kind: 'Journal' },
      { title: 'Compiler Design in Practice', author: 'by Dr. Linus K. Vogel', kind: 'Book' },
    ],
  })

export const useResearchPortfolio = () =>
  useFixture<{
    metrics: { label: string; value: string; tone: MetricTone }[]
    papers: { title: string; venue: string }[]
  }>(['faculty', 'research', 'portfolio'], {
    metrics: [
      { label: 'Active Grants', value: '02', tone: 'brand' },
      { label: 'Published Papers', value: '14', tone: 'accent' },
      { label: 'Citations', value: '340', tone: 'info' },
      { label: 'Research Assistants', value: '04', tone: 'success' },
    ],
    papers: [
      { title: 'A Deep Learning Approach to Bengali Semantic Search', venue: 'IEEE Transactions on Knowledge and Data Engineering, 2023' },
      { title: 'Cross-Lingual Information Retrieval for Bengali Queries', venue: 'ACM Transactions on Information Systems, 2022' },
      { title: 'Transformer Based Summarization for Bengali News', venue: 'Journal of Computer Science, 2022' },
    ],
  })

export const useGrants = () =>
  useFixture<{
    metrics: { label: string; value: string; tone: MetricTone }[]
    projects: { title: string; state: 'ACTIVE' | 'REVIEW' | 'CLOSED' }[]
    publications: { title: string; cite: string }[]
  }>(['faculty', 'research', 'grants'], {
    metrics: [
      { label: 'Active Projects', value: '03', tone: 'brand' },
      { label: 'Published Papers', value: '14', tone: 'accent' },
      { label: 'Grant Funding', value: '12,50,000', tone: 'success' },
      { label: 'Student RAs', value: '05', tone: 'info' },
    ],
    projects: [
      { title: 'AI-Driven Predictive Analytics in Healthcare', state: 'ACTIVE' },
      { title: 'Optimized Graph Algorithms for Traffic Routing', state: 'ACTIVE' },
      { title: 'Multi-Agent Systems for Disaster Response: A Neural Approach', state: 'REVIEW' },
    ],
    publications: [
      { title: 'Multi-Agent Systems for Disaster Response', cite: 'Mahmud, H., et al. (2024). IEEE Transactions on AI.' },
      { title: 'Ethical Implications of LLMs in Southeast Asian Academia', cite: 'Islam, S., Mahmud, H. (2023). ACM Conference on Fairness & Ethics.' },
    ],
  })

export const useFacultyFinance = () =>
  useFixture<{
    metrics: { label: string; value: number; tone: MetricTone }[]
    payslips: { month: string; paid: string; amount: number }[]
    method: string
  }>(['faculty', 'finance'], {
    metrics: [
      { label: 'Monthly Base Salary', value: 115000, tone: 'brand' },
      { label: 'YTD Earnings', value: 460000, tone: 'success' },
      { label: 'Tax Deductions', value: 57500, tone: 'warning' },
    ],
    payslips: [
      { month: 'May 2026', paid: 'Paid: 01 May 2026', amount: 115000 },
      { month: 'April 2026', paid: 'Paid: 01 Apr 2026', amount: 115000 },
      { month: 'March 2026', paid: 'Paid: 01 Mar 2026', amount: 115000 },
      { month: 'February 2026', paid: 'Paid: 01 Feb 2026', amount: 115000 },
    ],
    method: 'Bank Transfer • Dutch-Bangla Bank ••••4412',
  })
