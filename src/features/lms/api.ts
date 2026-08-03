import { useFixture } from '@/lib/fixtures'
import type { Assistant } from '@/components/patterns/assistant-panel'
import type { MetricTone } from '@/components/patterns/metric-card'

/**
 * LMS module data (Phase 4.2 — 17 screens).
 * Content transcribed from the Figma frames named in each page component.
 * Swap `useFixture` for `useGetData` per hook when Django is ready.
 */

export type Course = {
  code: string
  name: string
  teacher: string
  progress: number
  grade?: string
}

const COURSES: Course[] = [
  { code: 'CS-602', name: 'Advanced Machine Learning', teacher: 'Dr. Sarah Johnson', progress: 72, grade: 'A-' },
  { code: 'CS-510', name: 'Cloud Infrastructure', teacher: 'Prof. David Miller', progress: 58, grade: 'B+' },
  { code: 'CS-455', name: 'Network Security', teacher: 'Prof. James W.', progress: 64, grade: 'B+' },
  { code: 'CS-402', name: 'Human Computer Interaction', teacher: 'Elena Rodriguez', progress: 81, grade: 'A' },
]

// ------------------------------------------------------------------ /lms

export const useLmsOverview = () =>
  useFixture<{ metrics: { label: string; value: string; tone: MetricTone }[]; courses: Course[] }>(
    ['lms', 'overview'],
    {
      metrics: [
        { label: 'Enrolled Courses', value: '6', tone: 'brand' },
        { label: 'Materials', value: '128', tone: 'accent' },
        { label: 'Pending Assignments', value: '8', tone: 'warning' },
        { label: 'Upcoming Quizzes', value: '12', tone: 'info' },
        { label: 'Live Classes', value: '5', tone: 'brand' },
        { label: 'Overall Grade', value: 'A-', tone: 'success' },
      ],
      courses: COURSES,
    },
  )

export const useLmsCourses = () =>
  useFixture<{ term: string; courses: Course[] }>(['lms', 'courses'], {
    term: 'Spring 2026',
    courses: COURSES,
  })

// ------------------------------------------------------- /lms/assignments

export type AssignmentState = 'OVERDUE' | 'DUE SOON' | 'SUBMITTED' | 'GRADED'

export type Assignment = {
  id: string
  title: string
  course: string
  summary: string
  due: string
  meta: string
  state: AssignmentState
}

export const useAssignments = () =>
  useFixture<{
    metrics: { label: string; value: string; tone: MetricTone }[]
    assignments: Assignment[]
    assistant: Assistant
  }>(['lms', 'assignments'], {
    metrics: [
      { label: 'Total Assignments', value: '08', tone: 'brand' },
      { label: 'Submitted & Received', value: '05', tone: 'success' },
      { label: 'Action Required', value: '03', tone: 'danger' },
    ],
    assignments: [
      { id: 'a1', title: 'Neural Network Architecture Project', course: 'CS-602', summary: 'Design a 3-layer CNN for image recognition…', due: 'Oct 24, 2023', meta: '11:59 PM (Past Due)', state: 'OVERDUE' },
      { id: 'a2', title: 'Distributed Systems Case Study', course: 'CS-455', summary: 'Analysis of Kafka vs RabbitMQ message brokers…', due: 'Oct 30, 2023', meta: '3 days remaining', state: 'DUE SOON' },
      { id: 'a3', title: 'UI Design System Documentation', course: 'CS-402', summary: 'Define typography, tokens and components…', due: 'Oct 20, 2023', meta: 'Graded • A-', state: 'GRADED' },
      { id: 'a4', title: 'Blockchain Smart Contract Security', course: 'CS-510', summary: 'Identify vulnerabilities in Solidity contract…', due: 'Oct 26, 2023', meta: 'Submitted Oct 25', state: 'SUBMITTED' },
    ],
    assistant: {
      title: 'Need help with CS602-AI?',
      messages: [
        {
          from: 'ai',
          text: "Your CNN assignment is overdue. I've found 4 peer-reviewed sources and 2 lecture videos from Week 7 that specifically cover CNN architecture design.",
        },
      ],
      suggestions: ['Show sources', 'Draft an outline'],
    },
  })

export const useAssignmentDetail = (id: string) =>
  useFixture<{
    title: string
    course: string
    due: string
    brief: string
    requirements: string[]
    integrityNote: string
    assistant: Assistant
  }>(['lms', 'assignments', id], {
    title: 'Binary Tree Operations',
    course: 'CS-301 Data Structures',
    due: 'Oct 30, 2023 • 11:59 PM',
    brief:
      'Please implement the following binary tree operations as discussed in Week 6 lectures:',
    requirements: [
      'Insertion and deletion with correct re-balancing',
      'In-order, pre-order and post-order traversal',
      'Height and balance-factor calculation',
      'Unit tests covering the degenerate cases',
    ],
    integrityNote:
      "By submitting, you agree that this assignment is your own work and complies with the university's Academic Integrity Policy.",
    assistant: {
      title: 'Need help with code?',
      messages: [
        {
          from: 'ai',
          text: 'Remember to check your Binary Search Tree balancing logic (AVL/Red-Black) as it carries 40% of the marks for this assignment.',
        },
      ],
    },
  })

// ----------------------------------------------------------- /lms/quizzes

export type Quiz = {
  id: string
  title: string
  course: string
  questions: number
  minutes: number
  state: 'AVAILABLE' | 'COMPLETED' | 'LOCKED'
  score?: string
}

export const useQuizzes = () =>
  useFixture<{ quizzes: Quiz[]; revision: { title: string; body: string } }>(['lms', 'quizzes'], {
    quizzes: [
      { id: 'q1', title: 'Introduction to SQL', course: 'CS-204', questions: 20, minutes: 30, state: 'AVAILABLE' },
      { id: 'q2', title: 'Binary Search Trees & Balancing (AVL)', course: 'CS-301', questions: 15, minutes: 25, state: 'AVAILABLE' },
      { id: 'q3', title: 'Graph Algorithms', course: 'CS-301', questions: 18, minutes: 30, state: 'COMPLETED', score: '82%' },
      { id: 'q4', title: 'Red-Black Trees', course: 'CS-301', questions: 12, minutes: 20, state: 'LOCKED' },
    ],
    revision: {
      title: 'Suggested Revision Plan',
      body: "Based on your past results in Introduction to SQL, we recommend reviewing Normalization Forms before starting today's quiz. Your average score in similar topics is 78%, which is 10% below your overall average.",
    },
  })

export type QuizQuestion = { id: string; prompt: string; options: string[]; answer: number }

export const usePracticeQuiz = (id: string) =>
  useFixture<{ title: string; questions: QuizQuestion[]; rank: string }>(['lms', 'practice', id], {
    title: 'Binary Search Trees & Balancing (AVL)',
    rank: "You're in the top 15% of your class this week. Take 2 more quizzes to reach Silver tier.",
    questions: [
      {
        id: 'q1',
        prompt: 'What is the worst-case time complexity of a search in a balanced AVL tree?',
        options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
        answer: 1,
      },
      {
        id: 'q2',
        prompt: 'An AVL tree rebalances when the balance factor of a node becomes:',
        options: ['0', '±1', '±2 or beyond', 'Any negative value'],
        answer: 2,
      },
      {
        id: 'q3',
        prompt: 'Which rotation fixes a left-right imbalance?',
        options: ['Single right rotation', 'Single left rotation', 'Left-then-right rotation', 'No rotation needed'],
        answer: 2,
      },
    ],
  })

// ------------------------------------------------- /lms/live · /recordings

export const useLiveClasses = () =>
  useFixture<{
    live: { title: string; teacher: string; startsIn: string }[]
    upcoming: { title: string; meta: string }[]
  }>(['lms', 'live'], {
    live: [{ title: 'Computer Architecture', teacher: 'Prof. David M.', startsIn: 'Live now' }],
    upcoming: [
      { title: 'Algorithms & Complexity', meta: 'Oct 21, 2023 • Dr. Elena S.' },
      { title: 'Database Systems', meta: 'Oct 20, 2023 • Prof. James W.' },
    ],
  })

export const useRecordings = () =>
  useFixture<{
    metrics: { label: string; value: string; tone: MetricTone }[]
    tip: string
    sessions: { title: string; date: string; time: string; duration: string }[]
  }>(['lms', 'recordings'], {
    metrics: [
      { label: 'Sessions this month', value: '12', tone: 'brand' },
      { label: 'Total watch time', value: '18h', tone: 'accent' },
    ],
    tip: 'Review "DBMS Indexing" to prepare for the upcoming mid-terms on May 20th.',
    sessions: [
      { title: 'Database Management', date: '10 May 2026', time: '10:00 AM - 11:30 AM', duration: '1h 30m' },
      { title: 'Web Technologies', date: '08 May 2026', time: '02:00 PM - 03:30 PM', duration: '1h 30m' },
      { title: 'Artificial Intelligence', date: '05 May 2026', time: '11:00 AM - 12:30 PM', duration: '1h 30m' },
    ],
  })

export const useLectures = (id: string) =>
  useFixture<{
    module: string
    summary: string
    lectures: { title: string; duration: string; watched: boolean }[]
  }>(['lms', 'lectures', id], {
    module: 'Module 4: Dynamic Programming',
    summary:
      'Deep dive into optimal substructures and overlapping subproblems. Learn how to optimize recursive solutions using memoization and tabulation techniques.',
    lectures: [
      { title: '4.1 Optimal Substructure', duration: '18:24', watched: true },
      { title: '4.2 Overlapping Subproblems', duration: '22:10', watched: true },
      { title: '4.3 Memoization in Practice', duration: '31:05', watched: false },
      { title: '4.4 Tabulation & Space Optimisation', duration: '27:48', watched: false },
    ],
  })

// ------------------------------------------- /lms/materials · /downloads

export type MaterialGroup = { label: string; files: number; size: string; tone: MetricTone }

export const useMaterials = (id: string) =>
  useFixture<{ groups: MaterialGroup[] }>(['lms', 'materials', id], {
    groups: [
      { label: 'Lecture Notes', files: 24, size: '128 MB', tone: 'brand' },
      { label: 'PDF Textbooks', files: 8, size: '450 MB', tone: 'accent' },
      { label: 'Slides', files: 15, size: '84 MB', tone: 'info' },
      { label: 'Lab Manuals', files: 12, size: '32 MB', tone: 'warning' },
    ],
  })

export const useDownloads = () =>
  useFixture<{ files: { name: string; course: string; size: string; done: boolean }[] }>(
    ['lms', 'downloads'],
    {
      files: [
        { name: 'Algorithms_Ch12.pdf', course: 'CS-301', size: '4.2 MB', done: true },
        { name: 'Lab_Notes_W8.docx', course: 'CS-301', size: '1.1 MB', done: true },
        { name: 'ML_Lecture_04.mp4', course: 'CS-602', size: '312 MB', done: false },
        { name: 'Revised_Midterm_Syllabus_CS402.pdf', course: 'CS-402', size: '1.4 MB', done: true },
      ],
    },
  )

// ------------------------------------------------------------ /lms/forum

export const useForum = () =>
  useFixture<{
    threads: { title: string; snippet: string; replies: number; course: string; pinned?: boolean }[]
  }>(['lms', 'forum'], {
    threads: [
      { title: 'Midterm Review Session & Query Thread', snippet: 'Post your questions ahead of Friday.', replies: 42, course: 'CS-301', pinned: true },
      { title: 'B-Tree insertion: Handling 4-node overflows', snippet: "I'm struggling with the split logic", replies: 12, course: 'CS-301' },
      { title: 'Economic Analysis: Supply Chain Shifts', snippet: 'Analyzing the impact of recent…', replies: 8, course: 'BA-210' },
      { title: 'Neural Network Backpropagation Calculus', snippet: 'The chain rule application for the', replies: 19, course: 'CS-602' },
      { title: "Shakespeare's Hamlet: Act III Analysis", snippet: 'Looking for secondary sources…', replies: 5, course: 'EN-140' },
    ],
  })

// ------------------------------------------------------------ /lms/notes

export const useNotes = () =>
  useFixture<{
    notes: { id: string; title: string; snippet: string; tag: string }[]
    open: { title: string; tag: string; body: string[]; facts: { label: string; value: string }[] }
  }>(['lms', 'notes'], {
    notes: [
      { id: 'n1', title: 'Heap Sort Complexity', snippet: 'Analyzing the time and space complexity of heap sort…', tag: 'Complexity Analysis' },
      { id: 'n2', title: 'AVL Rotations', snippet: 'Self-balancing binary search trees. Rotation operations and…', tag: 'Trees' },
      { id: 'n3', title: 'Graph Traversal', snippet: 'BFS vs DFS implementations in C++. Applications in…', tag: 'Graphs' },
    ],
    open: {
      title: 'Heap Sort Complexity',
      tag: 'Complexity Analysis',
      body: [
        'Heap sort is an efficient, comparison-based sorting algorithm. It is particularly known for its consistent performance.',
        'Heap sort can be thought of as an improved selection sort: like selection sort, heap sort divides its input into a sorted and an unsorted region.',
      ],
      facts: [
        { label: 'Best Case', value: 'O(n log n)' },
        { label: 'Average Case', value: 'O(n log n)' },
        { label: 'Worst Case', value: 'O(n log n)' },
      ],
    },
  })

// --------------------------------------------- /lms/progress · /analytics

export const useLearningProgress = () =>
  useFixture<{
    overall: number
    studyHours: string
    streak: string
    courses: { name: string; teacher: string; percent: number; tone: MetricTone }[]
  }>(['lms', 'progress'], {
    overall: 68,
    studyHours: '124h',
    streak: '9 Days',
    courses: [
      { name: 'Advanced Algorithms (CS301)', teacher: 'Professor David Miller', percent: 78, tone: 'brand' },
      { name: 'Machine Learning Foundations (CS305)', teacher: 'Dr. Sarah Johnson', percent: 64, tone: 'accent' },
      { name: 'Human Computer Interaction (CS402)', teacher: 'Elena Rodriguez', percent: 81, tone: 'info' },
      { name: 'Database Systems (CS204)', teacher: 'Michael Chen', percent: 55, tone: 'warning' },
    ],
  })

export const useLearningAnalytics = () =>
  useFixture<{
    proficiency: { label: string; percent: number; tone: MetricTone }[]
    insight: string
    milestone: { label: string; value: string }
    focus: { label: string; value: string }
  }>(['lms', 'analytics'], {
    proficiency: [
      { label: 'Logic', percent: 88, tone: 'brand' },
      { label: 'Algorithms', percent: 76, tone: 'accent' },
      { label: 'Systems', percent: 71, tone: 'info' },
      { label: 'Discrete Math', percent: 54, tone: 'warning' },
      { label: 'Communication', percent: 82, tone: 'success' },
    ],
    insight:
      'Based on your activity heatmap, your peak cognitive performance occurs between 10:00 AM and 11:30 AM. Shift your "Complex Algorithms" study sessions to this window to increase retention by an estimated 22%.',
    milestone: { label: 'Next Milestone', value: 'Exam Readiness: 88%' },
    focus: { label: 'Focus Suggestion', value: 'Review Discrete Math' },
  })

// ---------------------------------------------------- /lms/announcements

export const useAnnouncements = () =>
  useFixture<{
    featured: { title: string; from: string; role: string; body: string[]; attachment: { name: string; meta: string } }
    recent: { title: string; body: string }[]
    summary: string
  }>(['lms', 'announcements'], {
    featured: {
      title: 'CS402 Midterm Rescheduled',
      from: 'Dr. Ahmed Al-Farsi',
      role: 'Lead AI Professor',
      body: [
        'Dear Students, please be informed that the midterm examination for the AI module has been rescheduled from Wednesday to Thursday, 14th November at 10:00 AM in the Main Auditorium. This is to accommodate the Guest Lecture series happening on the same day.',
        'Please review the revised syllabus coverage attached below to ensure you are prepared for the updated content list.',
      ],
      attachment: { name: 'Revised_Midterm_Syllabus_CS402.pdf', meta: '1.4 MB • Updated Today' },
    },
    recent: [
      { title: 'Lab 3: System Design Doc', body: 'All necessary SDKs and library packages for the upcoming Lab 4 (Agile Sprint Simulation) have been uploaded to the course module.' },
      { title: 'AI Guest Lecture', body: 'Join us this Friday for a special session with industry experts from DeepMind discussing the ethical frameworks of modern AI.' },
      { title: 'Eigenvalues Solution Key', body: 'The detailed solution key for the Eigenvalues assignment is now available for review before the quiz.' },
    ],
    summary:
      'UniGPT has analyzed 5 new announcements today. The most critical update is the rescheduling of your CS402 exam. Would you like me to update your calendar?',
  })

// -------------------------------------------------------- /lms/gradebook

export const useGradebook = () =>
  useFixture<{
    completion: number
    insight: { title: string; body: string }
    rows: { code: string; name: string; credits: number; grade: string; points: string }[]
  }>(['lms', 'gradebook'], {
    completion: 65,
    insight: {
      title: 'On Track for Distinction',
      body: 'Maintain current performance in "Artificial Intelligence" to secure a Summa Cum Laude projection.',
    },
    rows: [
      { code: 'CSE-4101', name: 'Artificial Intelligence', credits: 3, grade: 'A', points: '4.00' },
      { code: 'CSE-3205', name: 'Database Management', credits: 3, grade: 'A-', points: '3.70' },
      { code: 'CSE-3102', name: 'Computer Networks', credits: 3, grade: 'B+', points: '3.30' },
      { code: 'ENG-2101', name: 'Business Communication', credits: 2, grade: 'A', points: '4.00' },
    ],
  })
