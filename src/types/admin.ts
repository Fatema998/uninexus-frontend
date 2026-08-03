/**
 * Admin persona wire types — one entry per endpoint in docs/api/admin.md.
 *
 * Same conventions as the other two contracts (src/types/common.ts): ISO
 * instants, decimal-string money, SCREAMING_SNAKE enums, nulls not sentinels,
 * server-owned totals.
 *
 * What is different about admin, and what these types encode:
 *
 * 1. **Scale.** A faculty roster is 50 rows; the user directory is 12,000.
 *    Every list here is paginated with server-side search — there is no
 *    "fetch it all and filter in the browser" option.
 * 2. **Blast radius.** A settings toggle changes behaviour for every user in
 *    the institution. Those writes carry a `version` for optimistic locking,
 *    because two admins saving the same page must not silently clobber.
 * 3. **PII.** This is the only persona that reads contact details, login
 *    history and devices. Those live on their own endpoint, not folded into
 *    a list, so reading a directory does not hand over everyone's IP address.
 * 4. **Irreversibility.** Deactivating a user, revoking sessions, publishing
 *    results — every one returns an audit record, and none is optimistic.
 */

import type {
  CourseRef,
  CurrencyCode,
  Id,
  ISODate,
  ISODateTime,
  Metric,
  Money,
  Role,
  Tone,
} from './common'

// ===========================================================================
// Shared
// ===========================================================================

/**
 * Written by the server on every state-changing admin action.
 *
 * Present in the response so the UI can confirm *what was recorded*, not just
 * that something happened — "deactivated by you at 14:32" is a materially
 * different message from "saved".
 */
export type AuditEntry = {
  id: Id
  action: string
  actorName: string
  at: ISODateTime
  /** Human-readable summary of the change. Never parse it. */
  summary: string
}

export type Department = {
  id: Id
  name: string
  /** `CSE` */
  code: string
}

// ===========================================================================
// Executive dashboard  ·  GET /api/admin/dashboard/
// ===========================================================================

export type AdminDashboardResponse = {
  currency: CurrencyCode
  metrics: Metric[]
  /** Monthly enrolment, oldest first. Drives the trend chart. */
  enrolment: { month: string; students: number }[]
  distribution: { label: string; value: number; tone: Tone }[]
  totalStudents: number
  announcements: { id: Id; title: string; note: string; publishedAt: ISODateTime }[]
  /** Live service states, mirrored from the health endpoint. */
  systems: { id: Id; label: string; healthy: boolean }[]
  financial: { collected: Money; target: Money; percent: number }
  departments: { department: Department; students: number; percent: number; tone: Tone }[]
  events: { id: Id; title: string; note: string; startsAt: ISODateTime }[]
}

// ===========================================================================
// User management
// ===========================================================================

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'INVITED' | 'DEACTIVATED'

/**
 * A directory row. Deliberately excludes phone, address, last-login IP and
 * device history — reading a list of 12,000 users must not hand over
 * everyone's PII. Those live on `UserSecurityProfileResponse`.
 */
export type UserRow = {
  id: Id
  /** `U-1001` — the staff-facing reference, distinct from `id`. */
  reference: string
  fullName: string
  email: string
  role: Role
  department: Department | null
  status: UserStatus
  lastActiveAt: ISODateTime | null
}

/** GET /api/admin/users/ — `Paginated<UserRow>` plus institution-wide counts. */
export type UserManagementResponse = {
  metrics: Metric[]
  count: number
  next: string | null
  previous: string | null
  results: UserRow[]
}

/** POST /api/admin/users/ */
export type CreateUserRequest = {
  fullName: string
  email: string
  role: Role
  departmentId: Id | null
  /** True sends an activation email instead of setting a password here. */
  sendInvite: boolean
}

/**
 * PATCH /api/admin/users/{id}/status/
 *
 * `reason` is mandatory for anything but reactivation: a deactivation with no
 * recorded reason is indistinguishable from a mistake three months later.
 */
export type ChangeUserStatusRequest = {
  status: UserStatus
  reason: string
}

export type ChangeUserStatusResult = {
  user: UserRow
  audit: AuditEntry
}

// ------------------------------------------------------- security profile

export type UserSession = {
  id: Id
  deviceLabel: string
  /** City, country — never a raw IP in the UI payload. */
  location: string | null
  lastSeenAt: ISODateTime
  /** True for the session making this request; it cannot be revoked here. */
  isCurrent: boolean
}

/** GET /api/admin/users/{id}/security/ */
export type UserSecurityProfileResponse = {
  user: UserRow
  /** PII, only on this endpoint. */
  contact: { phone: string | null; address: string | null }
  stats: Metric[]
  sessions: UserSession[]
  recentLogins: { id: Id; at: ISODateTime; location: string | null; success: boolean }[]
  notes: { id: Id; label: string; body: string; tone: Tone }[]
  /** Recent admin actions against this account. */
  audit: AuditEntry[]
}

/** DELETE /api/admin/users/{id}/sessions/{sessionId}/ → `AuditEntry` */
/** POST /api/admin/users/{id}/password-reset/ → `AuditEntry` */

// ===========================================================================
// Admissions
// ===========================================================================

export type ApplicationStatus = 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'WAITLISTED'

export type ApplicationRow = {
  id: Id
  /** `HS-99120` */
  reference: string
  applicantName: string
  programme: { id: Id; name: string; school: string }
  status: ApplicationStatus
  submittedAt: ISODateTime
  /** Null until someone picks it up. */
  reviewerName: string | null
}

/** GET /api/admin/admissions/ — paginated with institution-wide counts. */
export type AdmissionsResponse = {
  metrics: Metric[]
  programmes: { id: Id; name: string; school: string; applicantCount: number }[]
  count: number
  next: string | null
  previous: string | null
  results: ApplicationRow[]
}

/** GET /api/admin/admissions/{id}/ */
export type ApplicationDetailResponse = {
  id: Id
  reference: string
  applicantName: string
  status: ApplicationStatus
  programme: { id: Id; name: string; school: string }
  personal: {
    dateOfBirth: ISODate
    nationality: string
    email: string
    phone: string
  }
  scores: { id: Id; label: string; value: string }[]
  documents: { id: Id; label: string; url: string; verified: boolean }[]
  /** Offer letter templates the decision can use. */
  templates: { id: Id; label: string }[]
  decision: {
    by: string
    at: ISODateTime
    note: string
  } | null
}

/**
 * POST /api/admin/admissions/{id}/decision/
 *
 * Not optimistic and not reversible from this screen: an approval sends an
 * offer letter. `templateId` is required for APPROVED, forbidden otherwise.
 */
export type DecideApplicationRequest = {
  status: Extract<ApplicationStatus, 'APPROVED' | 'REJECTED' | 'WAITLISTED'>
  templateId: Id | null
  note: string
}

export type DecideApplicationResult = {
  application: ApplicationRow
  audit: AuditEntry
  /** True when the offer/rejection email was queued. */
  notificationQueued: boolean
}

// ===========================================================================
// Academic management
// ===========================================================================

/** GET /api/admin/academic/ */
export type AcademicManagementResponse = {
  metrics: Metric[]
  departments: {
    department: Department
    programmeCount: number
    facultyCount: number
    studentCount: number
    headName: string | null
  }[]
}

// ===========================================================================
// Examinations
// ===========================================================================

/** GET /api/admin/exams/ */
export type ExamHubResponse = {
  metrics: Metric[]
  ongoing: { id: Id; title: string; venue: string; startsAt: ISODateTime }[]
  /** Institution-wide activity log, newest first. */
  log: { id: Id; text: string; at: ISODateTime; tone: Tone }[]
}

export type SlotState = 'CONFIRMED' | 'PENDING' | 'UNASSIGNED' | 'CONFLICT'

export type ExamSlotRow = {
  id: Id
  course: CourseRef
  startsAt: ISODateTime
  endsAt: ISODateTime
  hall: string | null
  proctorName: string | null
  state: SlotState
  /** Why this slot conflicts. Present only when `state === 'CONFLICT'`. */
  conflictReason: string | null
}

/** GET /api/admin/exams/schedule/ */
export type ExamScheduleResponse = {
  metrics: Metric[]
  slots: ExamSlotRow[]
  /** Halls and proctors the UI can assign from. Server-owned, not constants. */
  halls: { id: Id; name: string; capacity: number }[]
  proctors: { id: Id; name: string }[]
}

/** PATCH /api/admin/exams/schedule/{slotId}/ */
export type AssignSlotRequest = {
  hallId: Id | null
  proctorId: Id | null
}

// ------------------------------------------------------------ marks entry

export type MarkRow = {
  student: { id: Id; registrationNo: string; fullName: string }
  marks: number | null
}

/** GET /api/admin/exams/marks/?sectionId=&assessmentId= */
export type MarksEntryResponse = {
  course: CourseRef
  sectionName: string
  assessment: { id: Id; label: string; maxPoints: number; weightPercent: number }
  rows: MarkRow[]
  /** False once results are published — the sheet locks. */
  editable: boolean
  status: 'DRAFT' | 'SUBMITTED' | 'PUBLISHED'
  insight: string | null
}

/** PATCH /api/admin/exams/marks/ — batched, same partial-success contract as faculty. */
export type SaveMarksRequest = {
  sectionId: Id
  assessmentId: Id
  entries: { studentId: Id; marks: number | null }[]
}

export type SaveMarksResult = {
  saved: number
  rejected: { studentId: Id; reason: string }[]
}

/**
 * POST /api/admin/exams/marks/publish/
 *
 * The single most irreversible action in the product: it makes marks visible
 * to every student in the section at once. Requires every row filled.
 */
export type PublishMarksRequest = {
  sectionId: Id
  assessmentId: Id
  /** Typed confirmation, echoing the course code. Guards against a mis-click. */
  confirmation: string
}

export type PublishMarksResult = {
  publishedCount: number
  audit: AuditEntry
}

// ===========================================================================
// Finance control
// ===========================================================================

export type LedgerEntry = {
  id: Id
  title: string
  /** `Student: Faisal Ahmed`, `Vendor: AWS Cloud`, `52 Transactions`. */
  party: string
  amount: Money
  /** True for money in. */
  inbound: boolean
  at: ISODateTime
  reference: string
}

/** GET /api/admin/finance/ */
export type AdminFinanceResponse = {
  currency: CurrencyCode
  metrics: Metric[]
  revenueBreakdown: { id: Id; label: string; percent: number; amount: Money; tone: Tone }[]
  recentEntries: LedgerEntry[]
}

/** GET /api/admin/finance/ledger/?cursor=&direction= — `Cursored<LedgerEntry>` */

// ===========================================================================
// System health
// ===========================================================================

export type ServiceState = 'OPERATIONAL' | 'DEGRADED' | 'DOWN' | 'MAINTENANCE'

/** GET /api/admin/health/ */
export type SystemHealthResponse = {
  overall: { state: ServiceState; note: string }
  metrics: Metric[]
  services: {
    id: Id
    name: string
    state: ServiceState
    uptimePercent: number
    latencyMs: number
    checkedAt: ISODateTime
  }[]
  incidents: {
    id: Id
    title: string
    startedAt: ISODateTime
    resolvedAt: ISODateTime | null
    severity: 'MINOR' | 'MAJOR' | 'CRITICAL'
  }[]
}

// ===========================================================================
// Institution settings
// ===========================================================================

export type SettingToggle = {
  key: string
  label: string
  note: string
  enabled: boolean
  /**
   * True when flipping this affects users other than the admin — the UI
   * requires an explicit confirmation for these.
   */
  institutionWide: boolean
}

/** GET /api/admin/settings/ */
export type AdminSettingsResponse = {
  /**
   * Optimistic-lock token. Send it back on save; a mismatch means another
   * admin changed something first and the server returns 409 rather than
   * letting the second save silently win.
   */
  version: string
  institution: {
    name: string
    shortCode: string
    contactEmail: string
    timezone: string
  }
  term: {
    activeTermId: Id
    activeTermName: string
    startsOn: ISODate
    endsOn: ISODate
    fullTimeCreditMinimum: number
  }
  toggles: SettingToggle[]
}

/** PUT /api/admin/settings/ — whole object, guarded by `version`. */
export type SaveSettingsRequest = {
  version: string
  institution: AdminSettingsResponse['institution']
  term: Omit<AdminSettingsResponse['term'], 'activeTermName'>
  toggles: { key: string; enabled: boolean }[]
}

export type SaveSettingsResult = {
  settings: AdminSettingsResponse
  audit: AuditEntry
}

// ===========================================================================
// Support
// ===========================================================================

export type TicketStatus = 'OPEN' | 'PENDING' | 'CLOSED'

export type Ticket = {
  id: Id
  /** `TCK-4412` */
  reference: string
  subject: string
  fromName: string
  status: TicketStatus
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  createdAt: ISODateTime
  updatedAt: ISODateTime
}

/** GET /api/admin/support/ */
export type SupportResponse = {
  channels: { id: Id; label: string; value: string; note: string }[]
  tickets: Ticket[]
  /** Runbook links, server-owned so they can change without a deploy. */
  topics: { id: Id; label: string; url: string }[]
}

/** PATCH /api/admin/support/tickets/{id}/ */
export type UpdateTicketRequest = {
  status: TicketStatus
}
