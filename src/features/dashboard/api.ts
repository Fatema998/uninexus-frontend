import { useFixture } from '@/lib/fixtures'
import type { MetricTone } from '@/components/patterns/metric-card'

/**
 * Dashboard data. Values are transcribed from the Figma frames
 * (student 9:6820 · faculty 1:2 · admin 7:15548) so the screens match the
 * design at a glance — replace `useFixture` with `useGetData` once the Django
 * endpoints exist. Query keys already follow the [module, resource] convention.
 */

export type Metric = {
  label: string
  value: string
  tone: MetricTone
  icon: string
  unit?: string
  badge?: { label: string; tone: 'success' | 'info' | 'warning' | 'brand' | 'neutral' }
  progress?: number
}

// ---------------------------------------------------------------- student

export type StudentDashboard = {
  hero: { badge: string; heading: string; body: string }
  metrics: Metric[]
  deadlines: { day: string; month: string; title: string; meta: string; overdue?: boolean }[]
  courses: { name: string; teacher: string; status: 'ENROLLED' | 'PENDING'; grade: string }[]
  assistant: { messages: { from: 'ai' | 'me'; text: string }[]; suggestions: string[] }
}

export const useStudentDashboard = () =>
  useFixture<StudentDashboard>(['student', 'dashboard'], {
    hero: {
      badge: 'Semester Active',
      heading: 'Welcome back, Alex',
      body: 'Your current semester progress is 74%. Two deadlines are due this week.',
    },
    metrics: [
      { label: 'Cumulative GPA', value: '3.88', tone: 'brand', icon: 'GraduationCap' },
      { label: 'Total Credits', value: '104', unit: '/ 120', tone: 'accent', icon: 'Award', progress: 86 },
      { label: 'Attendance', value: '92%', tone: 'info', icon: 'CalendarCheck' },
      { label: 'Active Courses', value: '05', tone: 'brand', icon: 'BookOpen' },
      { label: 'Due This Week', value: '02', tone: 'warning', icon: 'ClipboardList' },
      { label: 'Fees Cleared', value: '100%', tone: 'success', icon: 'Wallet' },
    ],
    deadlines: [
      { day: '24', month: 'OCT', title: 'Algorithm Analysis Quiz', meta: 'Canvas Submission • 11:59 PM', overdue: true },
      { day: '28', month: 'OCT', title: 'LMS Ethics Essay', meta: 'Turnitin Check Required' },
    ],
    courses: [
      { name: 'Advanced Algorithms', teacher: 'Prof. Sarah Jenkins • Room 402', status: 'ENROLLED', grade: 'A-' },
      { name: 'Machine Learning Foundations', teacher: 'Dr. Michael Chen • Online Sync', status: 'ENROLLED', grade: 'B+' },
      { name: 'Digital Ethics', teacher: 'Prof. Alistair Vance • Hybrid', status: 'PENDING', grade: 'N/A' },
    ],
    assistant: {
      messages: [
        { from: 'ai', text: 'Analyzing your study patterns for the upcoming finals week.' },
        { from: 'me', text: 'What should I revise first?' },
        { from: 'ai', text: 'Start with Recursion — it is 40% of the Algorithms quiz on the 24th.' },
      ],
      suggestions: ['Plan my week', 'Summarise lecture 04', 'Practice quiz'],
    },
  })

// ---------------------------------------------------------------- faculty

export type FacultyDashboard = {
  metrics: Metric[]
  schedule: { state: 'CURRENT' | 'UPCOMING'; title: string; meta: string }[]
  courses: { name: string; code: string; section: string; students: number; tag: string }[]
  reviews: { title: string; meta: string }[]
  teaching: { completed: number; remaining: number }
  activity: { title: string; meta: string; tone: MetricTone }[]
  insight: string
}

export const useFacultyDashboard = () =>
  useFixture<FacultyDashboard>(['faculty', 'dashboard'], {
    metrics: [
      { label: 'Active Courses', value: '06', tone: 'brand', icon: 'BookOpen' },
      { label: 'Total Students', value: '248', tone: 'accent', icon: 'Users' },
      { label: "Today's Classes", value: '03', tone: 'info', icon: 'Clock' },
      { label: 'Pending Assignment Reviews', value: '38', tone: 'warning', icon: 'ClipboardList' },
      { label: 'Attendance Pending', value: '01', tone: 'danger', icon: 'TriangleAlert' },
      { label: 'Research Projects', value: '03', tone: 'brand', icon: 'FlaskConical' },
    ],
    schedule: [
      { state: 'CURRENT', title: 'Data Structures & AI', meta: 'Room 402 • 10:30 AM - 12:00 PM' },
      { state: 'UPCOMING', title: 'Ethics in Computing', meta: 'Auditorium B • 02:00 PM' },
    ],
    courses: [
      { name: 'Intro to Machine Learning', code: 'CS-401', section: 'Section A', students: 52, tag: 'AI' },
      { name: 'Database Systems', code: 'CS-302', section: 'Section B', students: 45, tag: 'DB' },
    ],
    reviews: [
      { title: 'Neural Network Optimization', meta: 'Submitted by Sarah Jenkins • 2 hours ago' },
      { title: 'Data Mining Lab Report', meta: 'Submitted by Marcus Chen • 4 hours ago' },
    ],
    teaching: { completed: 10, remaining: 4 },
    activity: [
      { title: 'Grades Published', meta: 'Midterm Exam - Sec A • 20m ago', tone: 'brand' },
      { title: 'New Course Material', meta: 'Advanced ML Lecture 04 • 1h ago', tone: 'accent' },
      { title: 'Meeting Scheduled', meta: 'Curriculum Committee • 3h ago', tone: 'success' },
    ],
    insight: 'Students in CS-401 are struggling with "Recursion". Consider adding a remedial session.',
  })

// ------------------------------------------------------------------ admin

export type AdminDashboard = {
  metrics: Metric[]
  enrollment: { month: string; students: number }[]
  distribution: { label: string; value: number; tone: MetricTone }[]
  totalStudents: string
  announcements: { title: string; meta: string }[]
  systems: { label: string; healthy: boolean }[]
  financial: { collected: string; target: string; percent: number }
  departments: { name: string; students: string; percent: number; tone: MetricTone }[]
  events: { day: string; month: string; title: string; meta: string }[]
}

export const useAdminDashboard = () =>
  useFixture<AdminDashboard>(['admin', 'dashboard'], {
    metrics: [
      { label: 'Total Students', value: '12,485', tone: 'brand', icon: 'Users', badge: { label: '+4.2%', tone: 'success' } },
      { label: 'Total Faculty', value: '1,248', tone: 'accent', icon: 'GraduationCap', badge: { label: 'Stable', tone: 'neutral' } },
      { label: 'Total Courses', value: '642', tone: 'info', icon: 'BookOpen', badge: { label: '+12 New', tone: 'brand' } },
      { label: 'Total Departments', value: '24', tone: 'brand', icon: 'Building2' },
      { label: 'Pending Admissions', value: '312', tone: 'danger', icon: 'ClipboardList', badge: { label: 'Action', tone: 'warning' } },
      { label: 'Total Revenue', value: '৳128.75M', tone: 'success', icon: 'Banknote', badge: { label: '+8.6%', tone: 'success' } },
    ],
    enrollment: [
      { month: 'JAN', students: 8200 }, { month: 'FEB', students: 8300 },
      { month: 'MAR', students: 8900 }, { month: 'APR', students: 10100 },
      { month: 'MAY', students: 10600 }, { month: 'JUN', students: 10700 },
      { month: 'JUL', students: 10800 }, { month: 'AUG', students: 11200 },
      { month: 'SEP', students: 11600 }, { month: 'OCT', students: 12000 },
      { month: 'NOV', students: 12485 },
    ],
    distribution: [
      { label: 'Undergrad', value: 60, tone: 'brand' },
      { label: 'Graduate', value: 25, tone: 'accent' },
      { label: 'Postgrad', value: 15, tone: 'info' },
    ],
    totalStudents: '12.4k',
    announcements: [
      { title: 'Annual University Gala', meta: 'Registration starts from next Monday' },
      { title: 'Mid-Term Exam Schedule', meta: 'Published for all departments' },
    ],
    systems: [
      { label: 'LMS', healthy: true },
      { label: 'DB', healthy: true },
      { label: 'API', healthy: true },
    ],
    financial: { collected: '৳128.75M', target: '৳165M', percent: 78 },
    departments: [
      { name: 'Computer Science', students: '2,450 Std.', percent: 100, tone: 'brand' },
      { name: 'Business Admin', students: '1,820 Std.', percent: 74, tone: 'accent' },
      { name: 'Engineering', students: '1,440 Std.', percent: 59, tone: 'info' },
    ],
    events: [
      { day: '24', month: 'MAY', title: 'Annual Board Meeting', meta: 'Conference Room A • 10:00 AM' },
      { day: '27', month: 'MAY', title: '15th Convocation Ceremony', meta: 'University Grand Hall • 02:00 PM' },
    ],
  })
