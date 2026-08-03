import { useFixture } from '@/lib/fixtures'
import type { Assistant } from '@/components/patterns/assistant-panel'
import type { MetricTone } from '@/components/patterns/metric-card'

/**
 * Academic module data (Phase 4.1 — 11 screens).
 *
 * Content is transcribed from the Figma frames listed against each hook.
 * Swap `useFixture` for `useGetData` per hook once Django exposes the
 * endpoint; the components do not change. See docs/architecture.md §5.
 */

// ------------------------------------------------------- /academic/courses

export type EnrolledCourse = {
  code: string
  name: string
  teacher: string
  credits: number
  progress: number
  grade: string
  status: 'ENROLLED' | 'PENDING'
}

export const useMyCourses = () =>
  useFixture<{
    metrics: { label: string; value: string; tone: MetricTone }[]
    courses: EnrolledCourse[]
    assistant: Assistant
  }>(['academic', 'courses'], {
    metrics: [
      { label: 'Enrolled Courses', value: '6', tone: 'brand' },
      { label: 'In Progress', value: '5', tone: 'accent' },
      { label: 'Credits This Term', value: '12', tone: 'info' },
      { label: 'Assessments Due', value: '18', tone: 'warning' },
    ],
    courses: [
      { code: 'CS-401', name: 'Advanced Algorithms', teacher: 'Prof. Sarah Jenkins', credits: 3, progress: 78, grade: 'A-', status: 'ENROLLED' },
      { code: 'CS-455', name: 'Distributed Systems', teacher: 'Dr. Michael Chen', credits: 3, progress: 64, grade: 'B+', status: 'ENROLLED' },
      { code: 'CS-470', name: 'Machine Learning Foundations', teacher: 'Dr. Michael Chen', credits: 3, progress: 52, grade: 'B+', status: 'ENROLLED' },
      { code: 'MA-210', name: 'Linear Algebra & Matrices', teacher: 'Prof. Michael Chen', credits: 4, progress: 88, grade: 'A', status: 'ENROLLED' },
      { code: 'PH-101', name: 'Digital Ethics', teacher: 'Prof. Alistair Vance', credits: 2, progress: 0, grade: 'N/A', status: 'PENDING' },
    ],
    assistant: {
      messages: [
        {
          from: 'ai',
          text: 'You have a Distributed Systems quiz coming up in 2 days. Would you like a summary of the last 3 lectures?',
        },
      ],
      suggestions: ['Summarise lectures', 'Show my grades'],
    },
  })

// ---------------------------------------------------- /academic/curriculum

export const useCurriculum = () =>
  useFixture<{
    stats: { label: string; value: string; tone: MetricTone; progress?: number }[]
    courses: { name: string; dept: string; credits: number; state: 'DONE' | 'IN PROGRESS' | 'REMAINING' }[]
    assistant: Assistant
  }>(['academic', 'curriculum'], {
    stats: [
      { label: 'Degree Completion', value: '74%', tone: 'brand', progress: 74 },
      { label: 'Remaining', value: '16', tone: 'warning' },
      { label: 'In Progress', value: '5', tone: 'accent' },
    ],
    courses: [
      { name: 'Algorithms & Complexity', dept: 'Dept. of Computer Science', credits: 3, state: 'IN PROGRESS' },
      { name: 'Operating Systems', dept: 'Dept. of Computer Science', credits: 3, state: 'DONE' },
      { name: 'Linear Algebra & Matrices', dept: 'Dept. of Mathematics', credits: 4, state: 'DONE' },
      { name: 'Database Management Systems', dept: 'Dept. of Computer Science', credits: 3, state: 'REMAINING' },
    ],
    assistant: {
      messages: [
        {
          from: 'ai',
          text: 'Based on your current progress in Algorithms, I recommend picking Artificial Intelligence as an elective next semester.',
        },
      ],
    },
  })

// ----------------------------------------------- /academic/degree-progress

export const useDegreeProgress = () =>
  useFixture<{
    buckets: { label: string; note: string; percent: number; tone: MetricTone }[]
    milestones: { title: string; note: string; state: 'done' | 'current' | 'upcoming' }[]
    deadline: { title: string; note: string }
    forecast: string
  }>(['academic', 'degree-progress'], {
    buckets: [
      { label: 'Core Credits', note: '24 more credits to core completion', percent: 68, tone: 'brand' },
      { label: 'Elective Credits', note: 'Choose 3 more elective modules', percent: 45, tone: 'accent' },
      { label: 'General Education', note: 'Global Perspective req. pending', percent: 82, tone: 'info' },
    ],
    milestones: [
      { title: 'Year 1: Foundations', note: 'Completed • 4.0 GPA', state: 'done' },
      { title: 'Year 2: Core Engineering', note: 'Completed • 3.8 GPA', state: 'done' },
      { title: 'Year 3: Specialization', note: 'Current Year. Enrolled in 5 advanced modules including Neural Networks.', state: 'current' },
      { title: 'Year 4: Capstone & Ethics', note: 'Upcoming. Eligible for Early Graduation pathway.', state: 'upcoming' },
    ],
    deadline: { title: 'Proposal Deadline', note: 'Due in 4 months (Oct 15, 2024)' },
    forecast:
      'Based on your current pace, you are on track to graduate with Honors in June 2025.',
  })

// ------------------------------------------------------- /academic/credits

export const useCreditProgress = () =>
  useFixture<{
    overall: { earned: number; required: number }
    byCategory: { label: string; earned: number; required: number; tone: MetricTone }[]
    perTerm: { term: string; credits: number; gpa: string }[]
  }>(['academic', 'credits'], {
    overall: { earned: 104, required: 120 },
    byCategory: [
      { label: 'Core', earned: 52, required: 64, tone: 'brand' },
      { label: 'Electives', earned: 27, required: 36, tone: 'accent' },
      { label: 'General Education', earned: 25, required: 20, tone: 'info' },
    ],
    perTerm: [
      { term: 'Fall 2023', credits: 18, gpa: '3.82' },
      { term: 'Spring 2024', credits: 17, gpa: '3.90' },
      { term: 'Fall 2024', credits: 18, gpa: '3.86' },
      { term: 'Spring 2025', credits: 15, gpa: '3.88' },
    ],
  })

// ------------------------------------------------------- /academic/routine

export type RoutineSlot = { day: string; start: string; title: string; room: string; tone: MetricTone }

export const useClassRoutine = () =>
  useFixture<{
    slots: RoutineSlot[]
    files: { name: string; meta: string }[]
    wifi: string
    dailyGoal: number
    assistant: Assistant
  }>(['academic', 'routine'], {
    slots: [
      { day: 'Mon', start: '09:00', title: 'Advanced Algorithms', room: 'Room 402', tone: 'brand' },
      { day: 'Mon', start: '11:00', title: 'Linear Algebra', room: 'Room 210', tone: 'accent' },
      { day: 'Tue', start: '10:00', title: 'Neural Networks', room: 'Lab 3', tone: 'info' },
      { day: 'Wed', start: '09:00', title: 'Distributed Systems', room: 'Room 402', tone: 'brand' },
      { day: 'Thu', start: '14:00', title: 'Digital Ethics', room: 'Auditorium B', tone: 'warning' },
      { day: 'Fri', start: '11:00', title: 'ML Foundations', room: 'Online Sync', tone: 'accent' },
    ],
    files: [
      { name: 'Algorithms_Ch12.pdf', meta: 'Shared by Dr. Mitchell' },
      { name: 'Lab_Notes_W8.docx', meta: '2 hours ago' },
    ],
    wifi: 'Campus Wi-Fi: UNI_STUDENT_5G',
    dailyGoal: 65,
    assistant: {
      messages: [
        {
          from: 'ai',
          text: 'You have a quiz in Neural Networks today. Would you like to review the lecture notes?',
        },
      ],
      suggestions: ['Review notes', 'Set a reminder'],
    },
  })

// ------------------------------------------------------ /academic/calendar

export const useAcademicCalendar = () =>
  useFixture<{
    month: string
    firstWeekday: number
    days: number
    today: number
    events: Record<number, { label: string; tone: MetricTone }>
  }>(['academic', 'calendar'], {
    month: 'May 2025',
    firstWeekday: 4, // 1 May 2025 is a Thursday
    days: 31,
    today: 19,
    events: {
      1: { label: 'Labour Day', tone: 'danger' },
      4: { label: 'Regist. Opens', tone: 'brand' },
      13: { label: 'Lab Viva', tone: 'warning' },
      22: { label: "Founder's Day", tone: 'accent' },
    },
  })

// ------------------------------------------------------- /academic/faculty

export const useFacultyDirectory = () =>
  useFixture<{
    faculty: { name: string; title: string; room: string; email: string }[]
    assistant: Assistant
  }>(['academic', 'faculty'], {
    faculty: [
      { name: 'Dr. Ishtiaque Ahmed', title: 'Professor of AI & Robotics', room: 'Room 512', email: 'i.ahmed@unigpt.edu' },
      { name: 'Dr. Sarah Jenkins', title: 'Associate Dean, CSE', room: 'Room 214', email: 's.jenkins@unigpt.edu' },
      { name: 'Prof. Michael Chen', title: 'HOD, Mathematics', room: 'Room 108', email: 'm.chen@unigpt.edu' },
      { name: 'Dr. Elena Rodriguez', title: 'Director of Research', room: 'Room 601', email: 'e.rodriguez@unigpt.edu' },
      { name: 'Prof. David Wilson', title: 'Lead Lecturer, Business', room: 'Room 320', email: 'd.wilson@unigpt.edu' },
      { name: 'Dr. Amara Okafor', title: 'Sr. Lecturer, Sociology', room: 'Room 415', email: 'a.okafor@unigpt.edu' },
    ],
    assistant: {
      title: 'Directory Assistant',
      messages: [
        {
          from: 'ai',
          text: "Hello! Need help finding a professor's office? You can ask me things like 'Where is Dr. Ahmed's office?' or 'Who teaches Artificial Intelligence?'",
        },
      ],
      suggestions: ['Where is Dr. Ahmed?', 'Who teaches AI?', 'Draft an email'],
    },
  })

// ---------------------------------------------------- /academic/classrooms

export const useClassrooms = () =>
  useFixture<{
    rooms: { name: string; building: string; capacity: number; session?: { title: string; endsIn: string } }[]
    assistant: Assistant
  }>(['academic', 'classrooms'], {
    rooms: [
      { name: 'Room 402', building: 'Building A • Floor 4', capacity: 60, session: { title: 'CSE 301: Advanced Data Structures', endsIn: 'Ends in 45 mins' } },
      { name: 'Auditorium B', building: 'Building C • Ground', capacity: 250, session: { title: 'Orientation Seminar 2024', endsIn: 'Ends in 2 hours' } },
      { name: 'Lab 3', building: 'Building A • Floor 2', capacity: 40 },
      { name: 'Room 210', building: 'Building B • Floor 2', capacity: 55 },
    ],
    assistant: {
      messages: [
        {
          from: 'ai',
          text: "I've found 3 available labs in Building A that match your 2:00 PM session requirements. Would you like to reserve Lab 3?",
        },
      ],
      suggestions: ['Reserve Lab 3', 'Show free rooms'],
    },
  })

// ------------------------------------------ /academic/registration/courses

export type OfferedCourse = {
  code: string
  name: string
  note: string
  noteTone: 'neutral' | 'brand' | 'warning'
  credits: number
  seats: string
  dept: string
}

export const useCourseRegistration = () =>
  useFixture<{ departments: string[]; courses: OfferedCourse[] }>(
    ['academic', 'registration', 'courses'],
    {
      departments: ['All Departments', 'Computer Science', 'Mathematics', 'General Education'],
      courses: [
        { code: 'CS-301', name: 'Data Structures & Algorithms', note: 'Prerequisite: CS201 Intro to Programming', noteTone: 'neutral', credits: 3, seats: '12 / 60', dept: 'Computer Science' },
        { code: 'CS-310', name: 'Database Management Systems', note: 'Core Requirement', noteTone: 'brand', credits: 3, seats: '5 / 50', dept: 'Computer Science' },
        { code: 'CS-405', name: 'Artificial Intelligence', note: 'Warning: High workload elective', noteTone: 'warning', credits: 3, seats: '22 / 45', dept: 'Computer Science' },
        { code: 'GE-120', name: 'Technical Communications', note: 'General Education', noteTone: 'neutral', credits: 2, seats: '31 / 80', dept: 'General Education' },
      ],
    },
  )

// ----------------------------------------- /academic/registration/semester

export const useSemesterRegistration = () =>
  useFixture<{
    semesters: { name: string; window: string; state: 'OPEN' | 'UPCOMING' }[]
    advisor: { name: string; dept: string }
    summary: { label: string; value: string }[]
  }>(['academic', 'registration', 'semester'], {
    semesters: [
      { name: 'Spring 2026', window: 'Registration open until 12 Dec', state: 'OPEN' },
      { name: 'Summer 2026', window: 'Opens 3 Mar 2026', state: 'UPCOMING' },
    ],
    advisor: { name: 'Dr. Ishtiaque Ahmed', dept: 'Department of Computer Science & Engineering' },
    summary: [
      { label: 'Courses selected', value: '4' },
      { label: 'Total credits', value: '11' },
      { label: 'Estimated fee', value: '৳42,500' },
      { label: 'Advisor approval', value: 'Pending' },
    ],
  })

// ----------------------------------------- /academic/registration/drop-add

export const useDropAdd = () =>
  useFixture<{
    enrolled: { code: string; name: string; teacher: string; credits: number }[]
    summary: { label: string; value: string }[]
    assistant: Assistant
  }>(['academic', 'registration', 'drop-add'], {
    enrolled: [
      { code: 'CS-405', name: 'Machine Learning', teacher: 'Dr. Alan Turing Jr.', credits: 3 },
      { code: 'MA-220', name: 'Linear Algebra II', teacher: 'Prof. Euler', credits: 4 },
      { code: 'PH-330', name: 'Quantum Physics', teacher: 'Dr. Schrodinger', credits: 3 },
    ],
    summary: [
      { label: 'Enrolled credits', value: '10' },
      { label: 'Full-time minimum', value: '12' },
      { label: 'Drop deadline', value: '14 Dec' },
    ],
    assistant: {
      messages: [
        {
          from: 'ai',
          text: 'I noticed you have 10 credits enrolled. To stay full-time, you need 2 more credits. Based on your major, I recommend Machine Learning (CS405) — it fits perfectly in your Monday gap.',
        },
      ],
      suggestions: ['Add CS405', 'Show my gaps'],
    },
  })
