import { useFixture } from '@/lib/fixtures'
import type { Assistant } from '@/components/patterns/assistant-panel'
import type { MetricTone } from '@/components/patterns/metric-card'

/** Examination module data (Phase 4.4 — 9 screens). Content from Figma 1:8461 et al. */

export const useExamOverview = () =>
  useFixture<{ metrics: { label: string; value: string; tone: MetricTone }[] }>(
    ['exams', 'overview'],
    {
      metrics: [
        { label: 'Total Exams', value: '12', tone: 'brand' },
        { label: 'Upcoming', value: '03', tone: 'warning' },
        { label: 'Completed', value: '09', tone: 'success' },
        { label: 'Avg Score', value: '84.6%', tone: 'info' },
        { label: 'Highest', value: '96%', tone: 'success' },
        { label: 'CGPA Impact', value: '+0.12', tone: 'accent' },
      ],
    },
  )

export type ExamSlot = {
  code: string
  name: string
  date: string
  time: string
  venue: string
  room: string
}

const SCHEDULE: ExamSlot[] = [
  { code: 'CSE-4102', name: 'Artificial Intelligence', date: 'Oct 12, 2024', time: '10:00 AM - 12:00 PM', venue: 'Auditorium West', room: 'Building 4, 3rd Floor' },
  { code: 'CSE-4105', name: 'Distributed Systems', date: 'Oct 14, 2024', time: '02:00 PM - 04:00 PM', venue: 'Lab Tower 1', room: 'Room 802' },
  { code: 'CSE-3201', name: 'Software Engineering', date: 'Oct 16, 2024', time: '10:00 AM - 12:00 PM', venue: 'Annex 3', room: 'Room 304' },
]

export const useExamSchedule = () =>
  useFixture<{ exams: ExamSlot[]; nextIn: string; assistant: Assistant }>(['exams', 'schedule'], {
    exams: SCHEDULE,
    nextIn: '4 days 06:20:11',
    assistant: {
      messages: [
        { from: 'ai', text: 'Based on your recent lab attendance, you might want to focus on "Recursive Algorithms" for the Distributed Systems exam.' },
        { from: 'ai', text: 'You have a 48-hour gap between your first and second exams. Recommended study session: 6 hrs/day.' },
      ],
    },
  })

export const useUpcomingExams = () =>
  useFixture<{ exams: ExamSlot[]; cta: { title: string; body: string } }>(['exams', 'upcoming'], {
    exams: SCHEDULE,
    cta: {
      title: 'Ready to Prepare?',
      body: 'Let UniGPT create a 10-day personalized study plan for you.',
    },
  })

export const useAdmitCard = () =>
  useFixture<{
    fields: { label: string; value: string }[]
    exams: ExamSlot[]
    readiness: string
    tip: string
  }>(['exams', 'admit-card'], {
    fields: [
      { label: 'Candidate Name', value: 'Adnan Rahman Chowdhury' },
      { label: 'Student ID / Roll No.', value: 'UG-2024-0891-AD' },
      { label: 'Degree Program', value: 'B.Sc. in Artificial Intelligence' },
      { label: 'Department', value: 'Computer Science & Engineering' },
      { label: 'Exam Center', value: 'Main Campus - Block C, Room 402' },
      { label: 'Date of Issue', value: 'October 10, 2023' },
    ],
    exams: SCHEDULE,
    readiness: 'Exam Readiness: High (78%)',
    tip: "Adnan, your attendance in 2 out of 3 courses is above 90%. Excellent! Don't forget to review Linear Algebra vectors tonight.",
  })

export const useExamResults = () =>
  useFixture<{
    metrics: { label: string; value: string; tone: MetricTone; note?: string }[]
    rows: { code: string; name: string; category: string; grade: string; points: string }[]
    insight: string
    predictedGpa: string
  }>(['exams', 'results'], {
    metrics: [
      { label: 'Semester GPA', value: '3.88', tone: 'brand' },
      { label: 'Credits Attempted', value: '18', tone: 'accent', note: 'Full-load semester' },
      { label: 'Credits Earned', value: '18', tone: 'success' },
      { label: 'Academic Standing', value: 'Excellent', tone: 'success' },
    ],
    rows: [
      { code: 'CSE 401', name: 'Data Structures & Algorithms', category: 'Core Major', grade: 'A', points: '4.00' },
      { code: 'CSE 402', name: 'Software Engineering Principles', category: 'Core Major', grade: 'A-', points: '3.70' },
      { code: 'MAT 301', name: 'Differential Equations', category: 'Mathematics', grade: 'B+', points: '3.30' },
      { code: 'ENG 210', name: 'Technical Communication', category: 'General Ed', grade: 'A', points: '4.00' },
    ],
    insight:
      "Adnan, you've outperformed the class average by 14.2% this semester. Your strongest performance was in Data Structures (CSE401). Consider exploring advanced algorithms in the next term.",
    predictedGpa: '3.91',
  })

export const useGradeReport = () =>
  useFixture<{
    completion: number
    terms: { term: string; gpa: string; credits: number }[]
    cgpa: string
  }>(['exams', 'grade-report'], {
    completion: 63.2,
    cgpa: '3.86',
    terms: [
      { term: 'Fall 2025', gpa: '3.88', credits: 18 },
      { term: 'Spring 2025', gpa: '3.90', credits: 17 },
      { term: 'Fall 2024', gpa: '3.82', credits: 18 },
      { term: 'Spring 2024', gpa: '3.84', credits: 15 },
    ],
  })

export const useRevaluation = () =>
  useFixture<{
    courses: { code: string; name: string }[]
    examTypes: string[]
    reviewTypes: string[]
    requests: { code: string; type: string; status: 'PENDING' | 'APPROVED' | 'REJECTED'; date: string }[]
  }>(['exams', 'revaluation'], {
    courses: [
      { code: 'CS301', name: 'Data Structures' },
      { code: 'MA202', name: 'Discrete Math' },
      { code: 'CS202', name: 'Computer Networks' },
      { code: 'HU101', name: 'Ethical Studies' },
    ],
    examTypes: ['Semester End', 'Mid Term', 'Practical'],
    reviewTypes: ['Standard Revaluation', 'Photocopy of Script', 'Re-totalling'],
    requests: [
      { code: 'CS202', type: 'Standard Revaluation', status: 'PENDING', date: 'Oct 18, 2024' },
      { code: 'MA202', type: 'Re-totalling', status: 'APPROVED', date: 'Sep 30, 2024' },
    ],
  })

export const useExamAttendanceSheet = () =>
  useFixture<{
    exam: { code: string; name: string; when: string; where: string }
    entries: { label: string; time: string; done: boolean }[]
  }>(['exams', 'attendance'], {
    exam: {
      code: 'CS-402',
      name: 'Artificial Intelligence',
      when: 'Oct 24, 2024 • 10:30 AM',
      where: 'Main Hall A - Room 204',
    },
    entries: [
      { label: 'Entry scanned', time: 'at 10:28:44 AM', done: true },
      { label: 'Script collected', time: 'at 01:52:10 PM', done: true },
      { label: 'Next exam check-in', time: 'at 08:45:30 AM', done: false },
    ],
  })

export const useExamAnalytics = () =>
  useFixture<{
    summary: string
    breakdown: { label: string; percent: number; tone: MetricTone }[]
    weakest: { title: string; note: string }
    recommendations: string[]
  }>(['exams', 'analytics'], {
    summary: 'Across 6 active courses',
    breakdown: [
      { label: 'Theory', percent: 88, tone: 'brand' },
      { label: 'Practical', percent: 92, tone: 'success' },
      { label: 'Viva', percent: 79, tone: 'accent' },
      { label: 'Assignments', percent: 84, tone: 'info' },
      { label: 'Attendance weightage', percent: 71, tone: 'warning' },
    ],
    weakest: { title: 'CS402: Distributed Systems', note: '3 absences recorded this term' },
    recommendations: [
      'Revise Differential Equations (Math) before the next mid-term.',
      'Book a viva practice slot — it is your lowest assessment category.',
      'Attend the CS402 make-up lab to recover attendance weightage.',
    ],
  })
