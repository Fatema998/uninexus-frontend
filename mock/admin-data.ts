/**
 * Admin mock payloads. Typed against `src/types/admin.ts`.
 *
 * Content carried over from the Figma-transcribed fixtures in
 * `src/features/admin/api.ts` and `api-ops.ts`, reshaped onto the contract.
 *
 * The user directory is generated rather than listed: admin lists are the one
 * place where pagination and server-side search have to be exercised, and
 * five hardcoded rows would never fill a second page.
 */

import type {
  AcademicManagementResponse,
  AdminDashboardResponse,
  AdminFinanceResponse,
  AdminSettingsResponse,
  ApplicationDetailResponse,
  ApplicationRow,
  AuditEntry,
  Department,
  ExamHubResponse,
  ExamScheduleResponse,
  LedgerEntry,
  MarksEntryResponse,
  SupportResponse,
  SystemHealthResponse,
  Ticket,
  UserRow,
  UserSecurityProfileResponse,
} from '../src/types/admin.ts'
import type { Id, Role } from '../src/types/index.ts'
import { inDays, inHours } from './data.ts'

const dept = (id: string, name: string, code: string): Department => ({ id, name, code })

export const DEPARTMENTS: Department[] = [
  dept('dep-1', 'Computer Science & Engineering', 'CSE'),
  dept('dep-2', 'Business Administration', 'BBA'),
  dept('dep-3', 'Engineering', 'ENG'),
  dept('dep-4', 'Pharmacy', 'PHR'),
]

// ===========================================================================
// Users — generated, so pagination and search are real
// ===========================================================================

const FIRST = ['Adnan', 'Sarah', 'Marcus', 'Fatima', 'David', 'Nusrat', 'Tanvir', 'Priya', 'Rafiq', 'Lina']
const LAST = ['Rahman', 'Jenkins', 'Chen', 'Noor', 'Wilson', 'Jahan', 'Alam', 'Nair', 'Islam', 'Haque']

/** Deterministic: the same id always yields the same row across restarts. */
export const USERS: UserRow[] = Array.from({ length: 137 }, (_, i) => {
  const role: Role = i % 11 === 0 ? 'admin' : i % 4 === 0 ? 'faculty' : 'student'
  const first = FIRST[i % FIRST.length]!
  const last = LAST[(i * 7) % LAST.length]!
  return {
    id: `usr-${1000 + i}`,
    reference: `U-${1000 + i}`,
    fullName: role === 'faculty' ? `Dr. ${first} ${last}` : `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@unigpt.edu`,
    role,
    department: role === 'admin' ? null : DEPARTMENTS[i % DEPARTMENTS.length]!,
    status: i % 17 === 0 ? 'DEACTIVATED' : i % 23 === 0 ? 'SUSPENDED' : 'ACTIVE',
    lastActiveAt: i % 17 === 0 ? null : inHours(-(i % 72)),
  }
})

/** Status changes and revocations land here and survive until restart. */
export const USER_OVERRIDES: Record<Id, Partial<UserRow>> = {}
export const REVOKED_SESSIONS = new Set<string>()

export const USER_METRICS = [
  { label: 'Total Users', value: String(USERS.length), tone: 'brand' as const },
  {
    label: 'Active Users',
    value: String(USERS.filter((u) => u.status === 'ACTIVE').length),
    tone: 'success' as const,
  },
  {
    label: 'Inactive Users',
    value: String(USERS.filter((u) => u.status !== 'ACTIVE').length),
    tone: 'warning' as const,
  },
  { label: 'User Roles', value: '3', tone: 'accent' as const },
  { label: 'New This Month', value: '12', tone: 'info' as const },
]

export const audit = (action: string, summary: string): AuditEntry => ({
  id: `aud-${Math.random().toString(36).slice(2, 10)}`,
  action,
  actorName: 'System Admin',
  at: new Date().toISOString(),
  summary,
})

export function securityProfile(userId: string): UserSecurityProfileResponse | null {
  const base = USERS.find((u) => u.id === userId)
  if (!base) return null
  const user = { ...base, ...USER_OVERRIDES[userId] }

  return {
    user,
    contact: { phone: '+880 1712-345678', address: 'Road 12, House 45, Banani, Dhaka' },
    stats: [
      { label: 'Logins (30d)', value: '142', tone: 'brand' },
      { label: 'Trust Score', value: '98/100', tone: 'success' },
    ],
    sessions: [
      { id: `${userId}-s1`, deviceLabel: 'MacBook Pro 14"', location: 'Dhaka, Bangladesh', lastSeenAt: inHours(-0.1), isCurrent: true },
      { id: `${userId}-s2`, deviceLabel: 'iPhone 15 Pro', location: 'Dhaka, Bangladesh', lastSeenAt: inHours(-2), isCurrent: false },
      { id: `${userId}-s3`, deviceLabel: 'Chrome on Windows', location: 'Chattogram, Bangladesh', lastSeenAt: inDays(-4), isCurrent: false },
    ].filter((s) => !REVOKED_SESSIONS.has(s.id)),
    recentLogins: [
      { id: `${userId}-l1`, at: inHours(-0.1), location: 'Dhaka, Bangladesh', success: true },
      { id: `${userId}-l2`, at: inHours(-26), location: 'Dhaka, Bangladesh', success: true },
      { id: `${userId}-l3`, at: inDays(-3), location: 'Unknown', success: false },
    ],
    notes: [
      { id: 'n1', label: 'Access Policy', body: 'Policy compliant across all units.', tone: 'success' },
      { id: 'n2', label: 'Credentials', body: 'Expiring within the next 48 hours.', tone: 'warning' },
    ],
    audit: [audit('LOGIN', 'Signed in from Dhaka, Bangladesh')],
  }
}

// ===========================================================================
// Dashboard
// ===========================================================================

export const DASHBOARD: AdminDashboardResponse = {
  currency: 'BDT',
  metrics: [
    { label: 'Total Students', value: '12,485', tone: 'brand', icon: 'Users', badge: { label: '+4.2%', tone: 'success' } },
    { label: 'Total Faculty', value: '1,248', tone: 'accent', icon: 'GraduationCap', badge: { label: 'Stable', tone: 'neutral' } },
    { label: 'Total Courses', value: '642', tone: 'info', icon: 'BookOpen', badge: { label: '+12 New', tone: 'brand' } },
    { label: 'Total Departments', value: '24', tone: 'brand', icon: 'Building2' },
    { label: 'Pending Admissions', value: '312', tone: 'danger', icon: 'ClipboardList', badge: { label: 'Action', tone: 'warning' } },
    { label: 'Total Revenue', value: '৳128.75M', tone: 'success', icon: 'Banknote', badge: { label: '+8.6%', tone: 'success' } },
  ],
  enrolment: [
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
  totalStudents: 12485,
  announcements: [
    { id: 'an-1', title: 'Annual University Gala', note: 'Registration starts from next Monday', publishedAt: inDays(-1) },
    { id: 'an-2', title: 'Mid-Term Exam Schedule', note: 'Published for all departments', publishedAt: inDays(-3) },
  ],
  systems: [
    { id: 'sys-1', label: 'LMS', healthy: true },
    { id: 'sys-2', label: 'DB', healthy: true },
    { id: 'sys-3', label: 'API', healthy: true },
  ],
  financial: { collected: '128750000.00', target: '165000000.00', percent: 78 },
  departments: [
    { department: DEPARTMENTS[0]!, students: 2450, percent: 100, tone: 'brand' },
    { department: DEPARTMENTS[1]!, students: 1820, percent: 74, tone: 'accent' },
    { department: DEPARTMENTS[2]!, students: 1440, percent: 59, tone: 'info' },
  ],
  events: [
    { id: 'ev-1', title: 'Annual Board Meeting', note: 'Conference Room A', startsAt: inDays(14) },
    { id: 'ev-2', title: '15th Convocation Ceremony', note: 'University Grand Hall', startsAt: inDays(17) },
  ],
}

// ===========================================================================
// Admissions
// ===========================================================================

const PROGRAMMES = [
  { id: 'prg-1', name: 'B.Sc. in CSE', school: 'Computer Science', applicantCount: 512 },
  { id: 'prg-2', name: 'BBA in Finance', school: 'Business School', applicantCount: 386 },
  { id: 'prg-3', name: 'B.Eng in Robotics', school: 'Engineering', applicantCount: 350 },
]

export const APPLICATIONS: ApplicationRow[] = Array.from({ length: 42 }, (_, i) => {
  const programme = PROGRAMMES[i % PROGRAMMES.length]!
  const status = (['PENDING', 'PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'WAITLISTED'] as const)[i % 6]!
  return {
    id: `app-${i}`,
    reference: `HS-${99120 + i}`,
    applicantName: `${FIRST[(i * 3) % FIRST.length]} ${LAST[i % LAST.length]}`,
    programme,
    status,
    submittedAt: inDays(-(i % 30) - 1),
    reviewerName: status === 'PENDING' ? null : 'System Admin',
  }
})

/** Decisions land here; the list reads through them. */
export const APPLICATION_DECISIONS: Record<Id, ApplicationRow['status']> = {}

export const ADMISSION_METRICS = [
  { label: 'Total Applications', value: '1,248', tone: 'brand' as const },
  { label: 'Pending Verification', value: '312', tone: 'warning' as const },
  { label: 'Approved Admissions', value: '842', tone: 'success' as const },
  { label: 'Rejected Applications', value: '94', tone: 'danger' as const },
]

export { PROGRAMMES }

export function applicationDetail(id: string): ApplicationDetailResponse | null {
  const row = APPLICATIONS.find((a) => a.id === id)
  if (!row) return null
  const status = APPLICATION_DECISIONS[id] ?? row.status

  return {
    id: row.id,
    reference: row.reference,
    applicantName: row.applicantName,
    status,
    programme: row.programme,
    personal: {
      dateOfBirth: '2004-01-15',
      nationality: 'Bangladeshi',
      email: `${row.applicantName.split(' ')[0]!.toLowerCase()}@email.com`,
      phone: '+880 1712-345678',
    },
    scores: [
      { id: 'sc-1', label: 'IELTS', value: '7.5' },
      { id: 'sc-2', label: 'SAT', value: '1480' },
    ],
    documents: [
      { id: 'doc-1', label: 'HSC Transcript', url: '/mock/files/hsc.pdf', verified: true },
      { id: 'doc-2', label: 'Birth Certificate', url: '/mock/files/birth.pdf', verified: true },
      { id: 'doc-3', label: 'Recommendation Letter', url: '/mock/files/rec.pdf', verified: false },
    ],
    templates: [
      { id: 'tpl-1', label: 'Standard Offer Letter' },
      { id: 'tpl-2', label: 'Conditional Offer' },
      { id: 'tpl-3', label: 'Scholarship Offer' },
    ],
    decision:
      status === 'PENDING' || status === 'IN_REVIEW'
        ? null
        : { by: 'System Admin', at: inDays(-2), note: 'Meets all entry requirements.' },
  }
}

// ===========================================================================
// Academic
// ===========================================================================

export const ACADEMIC: AcademicManagementResponse = {
  metrics: [
    { label: 'Departments', value: '24', tone: 'brand' },
    { label: 'Programs', value: '112', tone: 'accent' },
    { label: 'Courses', value: '642', tone: 'info' },
    { label: 'Faculty', value: '1,248', tone: 'success' },
    { label: 'Students', value: '12,485', tone: 'warning' },
  ],
  departments: [
    { department: DEPARTMENTS[0]!, programmeCount: 8, facultyCount: 142, studentCount: 2450, headName: 'Dr. Ishtiaque Ahmed' },
    { department: DEPARTMENTS[1]!, programmeCount: 6, facultyCount: 98, studentCount: 1820, headName: 'Prof. David Wilson' },
    { department: DEPARTMENTS[2]!, programmeCount: 11, facultyCount: 176, studentCount: 1440, headName: null },
    { department: DEPARTMENTS[3]!, programmeCount: 4, facultyCount: 62, studentCount: 880, headName: 'Dr. Amara Okafor' },
  ],
}

// ===========================================================================
// Examinations
// ===========================================================================

export const EXAM_HUB: ExamHubResponse = {
  metrics: [
    { label: 'Total Exams', value: '48', tone: 'brand' },
    { label: 'Ongoing Exams', value: '12', tone: 'warning' },
    { label: 'Completed Exams', value: '26', tone: 'success' },
    { label: 'Results Published', value: '18', tone: 'info' },
  ],
  ongoing: [
    { id: 'ong-1', title: 'Psychology 101', venue: 'Hall B-12', startsAt: inHours(-1) },
    { id: 'ong-2', title: 'Linear Algebra', venue: 'Main Library', startsAt: inHours(2) },
    { id: 'ong-3', title: 'Robotics Lab Final', venue: 'Tech Center', startsAt: inHours(-2) },
  ],
  log: [
    { id: 'lg-1', text: 'Prof. Miller published Physics results.', at: inHours(-0.05), tone: 'success' },
    { id: 'lg-2', text: 'Admin Sarah rescheduled CSE-402.', at: inHours(-0.75), tone: 'info' },
    { id: 'lg-3', text: 'Discrepancy flagged in B.Arch Semester III.', at: inHours(-2), tone: 'danger' },
  ],
}

const c = (id: string, code: string, title: string, credits: number) => ({ id, code, title, credits })

/**
 * Exam start instants, computed once each.
 *
 * Slots that share a sitting must share the *exact* instant: clash detection
 * compares `startsAt` for equality, and two separate `inDays(5)` calls can
 * land a millisecond apart and silently stop colliding.
 */
const DAY3 = inDays(3)
const DAY4 = inDays(4)
const DAY5 = inDays(5)
const endOf = (start: string) => new Date(Date.parse(start) + 2 * 3_600_000).toISOString()

export const SLOTS = [
  { id: 'slot-1', course: c('ac-1', 'CSE-201', 'Data Structures', 3), startsAt: DAY3, endsAt: endOf(DAY3), hall: 'Hall 101', proctorName: 'Dr. Sarah Jenkins', state: 'CONFIRMED' as const, conflictReason: null },
  { id: 'slot-2', course: c('ac-2', 'MAT-105', 'Calculus II', 3), startsAt: DAY4, endsAt: endOf(DAY4), hall: 'Hall 202', proctorName: 'Prof. Alan Turing', state: 'CONFIRMED' as const, conflictReason: null },
  { id: 'slot-3', course: c('ac-3', 'PHY-301', 'Quantum Theory', 3), startsAt: DAY5, endsAt: endOf(DAY5), hall: 'Hall 303', proctorName: null, state: 'PENDING' as const, conflictReason: null },
  { id: 'slot-4', course: c('ac-4', 'GEN-102', 'Ethics & AI', 2), startsAt: DAY5, endsAt: endOf(DAY5), hall: null, proctorName: null, state: 'UNASSIGNED' as const, conflictReason: null },
  { id: 'slot-5', course: c('ac-5', 'CSE-305', 'Operating Systems', 3), startsAt: DAY3, endsAt: endOf(DAY3), hall: 'Hall 101', proctorName: 'Dr. Sarah Jenkins', state: 'CONFLICT' as const, conflictReason: 'Hall 101 and Dr. Jenkins are both double-booked with CSE-201.' },
]

/** Assignments made this session. */
export const SLOT_OVERRIDES: Record<Id, { hall: string | null; proctorName: string | null }> = {}

export const HALLS = [
  { id: 'hall-1', name: 'Hall 101', capacity: 120 },
  { id: 'hall-2', name: 'Hall 202', capacity: 90 },
  { id: 'hall-3', name: 'Hall 303', capacity: 150 },
  { id: 'hall-4', name: 'Reserve 1', capacity: 60 },
]

export const PROCTORS = [
  { id: 'prc-1', name: 'Dr. Sarah Jenkins' },
  { id: 'prc-2', name: 'Prof. Alan Turing' },
  { id: 'prc-3', name: 'Dr. Robert Oppen' },
  { id: 'prc-4', name: 'Dr. Hasan Mahmud' },
]

export function examSchedule(): ExamScheduleResponse {
  const slots = SLOTS.map((s) => {
    const o = SLOT_OVERRIDES[s.id]
    if (!o) return s
    const assigned = o.hall !== null && o.proctorName !== null
    return {
      ...s,
      hall: o.hall,
      proctorName: o.proctorName,
      state: assigned ? ('CONFIRMED' as const) : ('PENDING' as const),
      conflictReason: null,
    }
  })

  return {
    metrics: [
      { label: 'Scheduled Courses', value: String(slots.length), tone: 'brand' },
      { label: 'Assigned Halls', value: String(new Set(slots.map((s) => s.hall).filter(Boolean)).size), tone: 'accent' },
      {
        label: 'Proctor Allocation',
        value: `${Math.round((slots.filter((s) => s.proctorName).length / slots.length) * 100)}%`,
        tone: 'success',
      },
      {
        label: 'Conflict Alerts',
        value: String(slots.filter((s) => s.state === 'CONFLICT').length).padStart(2, '0'),
        tone: 'danger',
      },
    ],
    slots,
    halls: HALLS,
    proctors: PROCTORS,
  }
}

// ------------------------------------------------------------- marks entry

export const MARKS: Record<Id, number | null> = {
  'mstu-0': 26,
  'mstu-1': 28,
  'mstu-2': null,
  'mstu-3': 24,
  'mstu-4': null,
}

export let MARKS_STATUS: MarksEntryResponse['status'] = 'DRAFT'
export const setMarksStatus = (s: MarksEntryResponse['status']) => {
  MARKS_STATUS = s
}

export function marksEntry(): MarksEntryResponse {
  return {
    course: c('ac-6', 'CSE-301', 'Data Structures & Algorithms', 3),
    sectionName: 'A',
    assessment: { id: 'asm-1', label: 'Midterm', maxPoints: 30, weightPercent: 30 },
    rows: Object.keys(MARKS).map((id, i) => ({
      student: {
        id,
        registrationNo: `21-4509${i + 2}-${i + 1}`,
        fullName: `${FIRST[i]!} ${LAST[i]!}`,
      },
      marks: MARKS[id] ?? null,
    })),
    editable: MARKS_STATUS !== 'PUBLISHED',
    status: MARKS_STATUS,
    insight:
      'Section A is performing 12% better in algorithm complexity than the historical mean. Consider increasing difficulty for the final.',
  }
}

// ===========================================================================
// Finance
// ===========================================================================

export const LEDGER: LedgerEntry[] = [
  { id: 'led-1', title: 'Tuition Fee — CSE-042', party: 'Student: Faisal Ahmed', amount: '42500.00', inbound: true, at: inHours(-1), reference: 'TXN-88120' },
  { id: 'led-2', title: 'Server Maintenance', party: 'Vendor: AWS Cloud', amount: '128000.00', inbound: false, at: inHours(-4), reference: 'PO-4412' },
  { id: 'led-3', title: 'Library Fines Batch B', party: '52 Transactions', amount: '18400.00', inbound: true, at: inHours(-8), reference: 'BAT-091' },
  { id: 'led-4', title: 'Tuition Fee — BBA-201', party: 'Rafiqul Islam • BBA 3rd Year', amount: '38000.00', inbound: true, at: inDays(-1), reference: 'TXN-88104' },
  { id: 'led-5', title: 'Laboratory Supplies', party: 'Dept: Pharmacy', amount: '96000.00', inbound: false, at: inDays(-2), reference: 'PO-4401' },
  { id: 'led-6', title: 'Tuition Fee — EEE-101', party: 'Zubayer Al Mahmud • EEE 1st Year', amount: '41000.00', inbound: true, at: inDays(-2), reference: 'TXN-88090' },
]

export const FINANCE: AdminFinanceResponse = {
  currency: 'BDT',
  metrics: [
    { label: 'Total Revenue YTD', value: '৳128.75M', tone: 'success' },
    { label: 'Total Expenses YTD', value: '৳78.42M', tone: 'warning' },
    { label: 'Net Profit YTD', value: '৳50.33M', tone: 'brand' },
    { label: 'Pending Invoices', value: '৳23.45M', tone: 'danger' },
    { label: 'Total Receivables', value: '৳34.68M', tone: 'info' },
  ],
  revenueBreakdown: [
    { id: 'rb-1', label: 'Tuition', percent: 68, amount: '87550000.00', tone: 'brand' },
    { id: 'rb-2', label: 'Hostel & Transport', percent: 14, amount: '18025000.00', tone: 'accent' },
    { id: 'rb-3', label: 'Grants', percent: 11, amount: '14162500.00', tone: 'info' },
    { id: 'rb-4', label: 'Other', percent: 7, amount: '9012500.00', tone: 'warning' },
  ],
  recentEntries: LEDGER,
}

// ===========================================================================
// System health
// ===========================================================================

export const HEALTH: SystemHealthResponse = {
  overall: { state: 'OPERATIONAL', note: 'All API nodes responsive' },
  metrics: [
    { label: 'Uptime (30d)', value: '99.98%', tone: 'success' },
    { label: 'Avg Response', value: '142ms', tone: 'brand' },
    { label: 'Active Sessions', value: '1,284', tone: 'info' },
    { label: 'Open Incidents', value: '01', tone: 'warning' },
  ],
  services: [
    { id: 'svc-1', name: 'LMS', state: 'OPERATIONAL', uptimePercent: 99.99, latencyMs: 118, checkedAt: inHours(-0.02) },
    { id: 'svc-2', name: 'Database', state: 'OPERATIONAL', uptimePercent: 99.98, latencyMs: 24, checkedAt: inHours(-0.02) },
    { id: 'svc-3', name: 'API Gateway', state: 'OPERATIONAL', uptimePercent: 99.97, latencyMs: 142, checkedAt: inHours(-0.02) },
    { id: 'svc-4', name: 'Payment Gateway', state: 'DEGRADED', uptimePercent: 98.42, latencyMs: 612, checkedAt: inHours(-0.02) },
    { id: 'svc-5', name: 'Notification Service', state: 'OPERATIONAL', uptimePercent: 99.95, latencyMs: 88, checkedAt: inHours(-0.02) },
    { id: 'svc-6', name: 'AI Assistant', state: 'OPERATIONAL', uptimePercent: 99.9, latencyMs: 340, checkedAt: inHours(-0.02) },
  ],
  incidents: [
    { id: 'inc-1', title: 'Payment gateway latency above threshold', startedAt: inHours(-0.7), resolvedAt: null, severity: 'MAJOR' },
    { id: 'inc-2', title: 'Scheduled database maintenance', startedAt: inDays(-2), resolvedAt: inDays(-2), severity: 'MINOR' },
    { id: 'inc-3', title: 'LMS file upload failures', startedAt: inDays(-6), resolvedAt: inDays(-6), severity: 'MAJOR' },
  ],
}

// ===========================================================================
// Settings
// ===========================================================================

/** Bumped on every save, so a stale client save is rejected with a 409. */
export let SETTINGS: AdminSettingsResponse = {
  version: 'v1',
  institution: {
    name: 'UniGPT University',
    shortCode: 'UNIGPT',
    contactEmail: 'registry@unigpt.edu',
    timezone: 'Asia/Dhaka',
  },
  term: {
    activeTermId: 'term-2026-spring',
    activeTermName: 'Spring 2026',
    startsOn: '2026-01-12',
    endsOn: '2026-05-30',
    fullTimeCreditMinimum: 12,
  },
  toggles: [
    { key: 'registration', label: 'Course registration open', note: 'Students can add or drop courses.', enabled: true, institutionWide: true },
    { key: 'results', label: 'Publish results to students', note: 'Newly approved results become visible immediately.', enabled: true, institutionWide: true },
    { key: 'payments', label: 'Online payments enabled', note: 'Disable during gateway maintenance.', enabled: false, institutionWide: true },
    { key: 'ai', label: 'AI assistant enabled', note: 'Turns the assistant off across every persona.', enabled: true, institutionWide: true },
  ],
}

export const setSettings = (next: AdminSettingsResponse) => {
  SETTINGS = next
}

// ===========================================================================
// Support
// ===========================================================================

export const TICKETS: Ticket[] = [
  { id: 'tck-1', reference: 'TCK-4412', subject: 'Payment gateway timeout on bulk fee collection', fromName: 'Finance Office', status: 'OPEN', priority: 'URGENT', createdAt: inHours(-0.6), updatedAt: inHours(-0.6) },
  { id: 'tck-2', reference: 'TCK-4408', subject: 'Faculty unable to publish CSE-402 results', fromName: 'Dr. Hasan Mahmud', status: 'PENDING', priority: 'HIGH', createdAt: inHours(-3), updatedAt: inHours(-1) },
  { id: 'tck-3', reference: 'TCK-4390', subject: 'Bulk user import failed for 12 records', fromName: 'Registry', status: 'CLOSED', priority: 'NORMAL', createdAt: inDays(-2), updatedAt: inDays(-1) },
]

/** Status changes made this session. */
export const TICKET_OVERRIDES: Record<Id, Ticket['status']> = {}

export const SUPPORT: SupportResponse = {
  channels: [
    { id: 'ch-1', label: 'Email', value: 'support@unigpt.edu', note: 'Response within 1 business day' },
    { id: 'ch-2', label: 'Phone', value: '+880 9600 123456', note: 'Sun–Thu, 09:00–17:00' },
    { id: 'ch-3', label: 'Emergency', value: 'ops@unigpt.edu', note: 'Platform outages only' },
  ],
  tickets: TICKETS,
  topics: [
    { id: 'tp-1', label: 'Reset a user password', url: '/runbooks/password-reset' },
    { id: 'tp-2', label: 'Restore a deleted course', url: '/runbooks/restore-course' },
    { id: 'tp-3', label: 'Correct a published result', url: '/runbooks/correct-result' },
    { id: 'tp-4', label: 'Refund a duplicate payment', url: '/runbooks/refund' },
  ],
}
