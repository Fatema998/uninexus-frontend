import { useFixture } from '@/lib/fixtures'
import type { MetricTone } from '@/components/patterns/metric-card'

/** Admin/ERP module data (Phase 6 — 10 screens). Content from Figma 7:* frames. */

export type UserRow = {
  id: string
  name: string
  email: string
  role: string
  department: string
  active: boolean
}

export const useUserManagement = () =>
  useFixture<{ metrics: { label: string; value: string; tone: MetricTone }[]; users: UserRow[] }>(
    ['admin', 'users'],
    {
      metrics: [
        { label: 'Total Users', value: '2,548', tone: 'brand' },
        { label: 'Active Users', value: '2,312', tone: 'success' },
        { label: 'Inactive Users', value: '236', tone: 'warning' },
        { label: 'User Roles', value: '8', tone: 'accent' },
        { label: 'New Users', value: '127', tone: 'info' },
      ],
      users: [
        { id: 'U-1001', name: 'Dr. Hasan Mahmud', email: 'hasan.mahmud@unigpt.edu', role: 'Faculty', department: 'CSE', active: true },
        { id: 'U-1002', name: 'Alex Rivera', email: 'alex.rivera@unigpt.edu', role: 'Student', department: 'CSE', active: true },
        { id: 'U-1003', name: 'Sarah Jenkins', email: 's.jenkins@unigpt.edu', role: 'Faculty', department: 'CSE', active: true },
        { id: 'U-1004', name: 'Admin Staff', email: 'admin@unigpt.edu', role: 'Admin', department: 'Registry', active: true },
        { id: 'U-1005', name: 'Marcus Chen', email: 'm.chen@unigpt.edu', role: 'Student', department: 'BBA', active: false },
      ],
    },
  )

export const useSecurityProfile = (id: string) =>
  useFixture<{
    user: { name: string; role: string; department: string }
    stats: { label: string; value: string; tone: MetricTone }[]
    devices: { name: string; meta: string; current: boolean }[]
    location: string
    notes: { label: string; body: string }[]
  }>(['admin', 'users', id], {
    user: { name: 'Dr. Hasan Mahmud', role: 'Faculty', department: 'Computer Science & Engineering' },
    stats: [
      { label: 'Logins (30d)', value: '142', tone: 'brand' },
      { label: 'Trust Score', value: '98/100', tone: 'success' },
    ],
    devices: [
      { name: 'MacBook Pro 14"', meta: 'San Francisco, USA • Active now', current: true },
      { name: 'iPhone 15 Pro', meta: 'Last used: 2h ago', current: false },
    ],
    location: 'San Francisco, USA',
    notes: [
      { label: 'Access Policy', body: 'Policy compliant across all units.' },
      { label: 'Credentials', body: 'Expiring within the next 48 hours.' },
    ],
  })

export type Application = {
  id: string
  name: string
  program: string
  school: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
}

export const useAdmissions = () =>
  useFixture<{
    metrics: { label: string; value: string; tone: MetricTone }[]
    programs: { name: string; school: string; applicants: number }[]
    applications: Application[]
  }>(['admin', 'admissions'], {
    metrics: [
      { label: 'Total Applications', value: '1,248', tone: 'brand' },
      { label: 'Pending Verification', value: '312', tone: 'warning' },
      { label: 'Approved Admissions', value: '842', tone: 'success' },
      { label: 'Rejected Applications', value: '94', tone: 'danger' },
    ],
    programs: [
      { name: 'B.Sc. in CSE', school: 'Computer Science', applicants: 512 },
      { name: 'BBA in Finance', school: 'Business School', applicants: 386 },
      { name: 'B.Eng in Robotics', school: 'Engineering', applicants: 350 },
    ],
    applications: [
      { id: 'HS-99120', name: 'Rahim Hasan', program: 'B.Sc. in CSE', school: 'Computer Science', status: 'PENDING' },
      { id: 'HS-99121', name: 'Nusrat Jahan', program: 'BBA in Finance', school: 'Business School', status: 'PENDING' },
      { id: 'HS-99122', name: 'Tanvir Alam', program: 'B.Eng in Robotics', school: 'Engineering', status: 'APPROVED' },
    ],
  })

export const useApplicationReview = (id: string) =>
  useFixture<{
    student: { name: string; id: string }
    personal: { label: string; value: string }[]
    scores: { label: string; value: string }[]
    templates: string[]
  }>(['admin', 'admissions', id], {
    student: { name: 'Rahim Hasan', id: 'HS-99120' },
    personal: [
      { label: 'Date of Birth', value: 'January 15, 2004' },
      { label: 'Nationality', value: 'Bangladeshi' },
      { label: 'Primary Contact', value: 'rahim.hasan@email.com' },
      { label: 'Phone', value: '+880 1712-345678' },
    ],
    scores: [
      { label: 'IELTS', value: '7.5' },
      { label: 'SAT', value: '1480' },
    ],
    templates: ['Standard Offer Letter', 'Conditional Offer', 'Scholarship Offer'],
  })

export const useAcademicManagement = () =>
  useFixture<{
    metrics: { label: string; value: string; tone: MetricTone }[]
    departments: { name: string; programs: number; faculty: number; students: number }[]
  }>(['admin', 'academic'], {
    metrics: [
      { label: 'Departments', value: '24', tone: 'brand' },
      { label: 'Programs', value: '112', tone: 'accent' },
      { label: 'Courses', value: '642', tone: 'info' },
      { label: 'Faculty', value: '1,248', tone: 'success' },
      { label: 'Students', value: '12,485', tone: 'warning' },
    ],
    departments: [
      { name: 'Computer Science & Engineering', programs: 8, faculty: 142, students: 2450 },
      { name: 'Business Administration', programs: 6, faculty: 98, students: 1820 },
      { name: 'Engineering', programs: 11, faculty: 176, students: 1440 },
      { name: 'Pharmacy', programs: 4, faculty: 62, students: 880 },
    ],
  })

export const useAdminFinance = () =>
  useFixture<{
    metrics: { label: string; value: string; tone: MetricTone }[]
    breakdown: { label: string; percent: number; tone: MetricTone }[]
    transactions: { title: string; party: string; amount: number; inbound: boolean }[]
  }>(['admin', 'finance'], {
    metrics: [
      { label: 'Total Revenue YTD', value: '128.75M', tone: 'success' },
      { label: 'Total Expenses YTD', value: '78.42M', tone: 'warning' },
      { label: 'Net Profit YTD', value: '50.33M', tone: 'brand' },
      { label: 'Pending Invoices', value: '23.45M', tone: 'danger' },
      { label: 'Total Receivables', value: '34.68M', tone: 'info' },
    ],
    breakdown: [
      { label: 'Tuition', percent: 68, tone: 'brand' },
      { label: 'Hostel & Transport', percent: 14, tone: 'accent' },
      { label: 'Grants', percent: 11, tone: 'info' },
      { label: 'Other', percent: 7, tone: 'warning' },
    ],
    transactions: [
      { title: 'Tuition Fee - CSE-042', party: 'Student: Faisal Ahmed', amount: 42500, inbound: true },
      { title: 'Server Maintenance', party: 'Vendor: AWS Cloud', amount: 128000, inbound: false },
      { title: 'Library Fines Batch B', party: '52 Transactions', amount: 18400, inbound: true },
      { title: 'Tuition Fee - BBA-201', party: 'Rafiqul Islam • BBA - 3rd Year', amount: 38000, inbound: true },
      { title: 'Laboratory Supplies', party: 'Dept: Pharmacy', amount: 96000, inbound: false },
      { title: 'Tuition Fee - EEE-101', party: 'Zubayer Al Mahmud • EEE - 1st Year', amount: 41000, inbound: true },
    ],
  })

export const useExamHub = () =>
  useFixture<{
    metrics: { label: string; value: string; tone: MetricTone }[]
    ongoing: { title: string; place: string }[]
    log: { text: string; when: string }[]
  }>(['admin', 'exams'], {
    metrics: [
      { label: 'Total Exams', value: '48', tone: 'brand' },
      { label: 'Ongoing Exams', value: '12', tone: 'warning' },
      { label: 'Completed Exams', value: '26', tone: 'success' },
      { label: 'Results Published', value: '18', tone: 'info' },
    ],
    ongoing: [
      { title: 'Psychology 101', place: 'Hall B-12 • 10:00 AM' },
      { title: 'Linear Algebra', place: 'Main Library • 02:00 PM' },
      { title: 'Robotics Lab Final', place: 'Tech Center • 09:00 AM' },
    ],
    log: [
      { text: 'Prof. Miller published Physics results.', when: '2 minutes ago' },
      { text: 'Admin Sarah rescheduled CSE-402.', when: '45 minutes ago' },
      { text: 'Discrepancy in B.Arch Semester III.', when: '2 hours ago' },
    ],
  })

export const useExamScheduling = () =>
  useFixture<{
    metrics: { label: string; value: string; tone: MetricTone }[]
    slots: { code: string; name: string; hall: string; proctor: string; state: 'CONFIRMED' | 'PENDING' | 'UNASSIGNED' }[]
    aiNote: string
  }>(['admin', 'exams', 'schedule'], {
    metrics: [
      { label: 'Scheduled Courses', value: '18', tone: 'brand' },
      { label: 'Assigned Halls', value: '12 Halls', tone: 'accent' },
      { label: 'Proctor Allocation', value: '95%', tone: 'success' },
      { label: 'Conflict Alerts', value: '02', tone: 'danger' },
    ],
    slots: [
      { code: 'CSE-201', name: 'Data Structures', hall: 'Hall 101', proctor: 'Dr. Sarah Jenkins', state: 'CONFIRMED' },
      { code: 'MAT-105', name: 'Calculus II', hall: 'Hall 202', proctor: 'Prof. Alan Turing', state: 'CONFIRMED' },
      { code: 'PHY-301', name: 'Quantum Theory', hall: 'Hall 303', proctor: 'Dr. Robert Oppen', state: 'PENDING' },
      { code: 'GEN-102', name: 'Ethics & AI', hall: 'Reserve 1', proctor: 'Unassigned', state: 'UNASSIGNED' },
    ],
    aiNote:
      'Our AI optimization engine can auto-fill the remaining 6 slots based on previous availability.',
  })

export type MarkRow = { id: string; name: string; marks: number | null }

export const useMarksEntry = () =>
  useFixture<{
    course: { id: string; students: number; weightage: string; status: string }
    rows: MarkRow[]
    insight: string
  }>(['admin', 'exams', 'marks'], {
    course: { id: 'CSE-301', students: 52, weightage: '30%', status: 'Pending' },
    rows: [
      { id: '21-45092-2', name: 'Adnan Rahman', marks: 26 },
      { id: '21-45093-1', name: 'Sarah Jenkins', marks: 28 },
      { id: '21-45094-3', name: 'Marcus Chen', marks: null },
      { id: '21-45095-4', name: 'Fatima Noor', marks: 24 },
      { id: '21-45096-5', name: 'David Wilson', marks: null },
    ],
    insight:
      'Section A is performing 12% better in algorithm complexity than the historical mean. Consider increasing difficulty for the final exam.',
  })
