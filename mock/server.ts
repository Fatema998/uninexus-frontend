/**
 * Dev-only mock API for the student portal.  `bun run mock`
 *
 * Stands in for the Django backend so the frontend can be built against the
 * real fetch path — JWTs, 401 refresh, latency, failures — instead of
 * in-process fixtures. Contract lives in docs/api/student.md; payloads in
 * ./data.ts, typed against src/types.
 *
 * Request knobs, on any route:
 *   ?_delay=1200   override latency in ms (default MOCK_LATENCY or 250)
 *   ?_fail=500     return that status instead of the payload
 *
 * `_fail` is the whole reason this exists rather than a fixture file: an
 * optimistic mutation is only correct if you have watched it roll back.
 *
 * ponytail: in-memory state, wiped on restart. No database — the point is a
 * contract to build against, not a second implementation of the registrar.
 */

import type {
  AddCourseRequest,
  ApiErrorBody,
  CreateNoteRequest,
  CreatePaymentRequest,
  CreateReplyRequest,
  CreateRevaluationRequest,
  DropAddRequest,
  ForumReply,
  Note,
  PaymentIntent,
  QuizAttemptRequest,
  QuizAttemptResult,
  RevaluationRequestRow,
  Role,
  UpdateNoteRequest,
} from '../src/types/index.ts'
import * as D from './data.ts'

const PORT = Number(Bun.env.MOCK_PORT ?? 8787)
const BASE_LATENCY = Number(Bun.env.MOCK_LATENCY ?? 250)
/** Below this, gzip costs more than it saves. Mirrors nginx's gzip_min_length. */
const GZIP_MIN_BYTES = 1024

// ---------------------------------------------------------------- responses

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,Idempotency-Key',
  'Access-Control-Max-Age': '86400',
}

/**
 * JSON, gzipped when it is worth it and the client asked.
 *
 * In production this is the reverse proxy's job (see docs/api/student.md §1.4)
 * — it is here so the dev numbers are honest about what ships.
 */
function json(data: unknown, status = 200, req?: Request): Response {
  const body = JSON.stringify(data)
  const headers: Record<string, string> = { ...CORS, 'Content-Type': 'application/json' }

  const wantsGzip = req?.headers.get('accept-encoding')?.includes('gzip')
  if (wantsGzip && body.length >= GZIP_MIN_BYTES) {
    const zipped = Bun.gzipSync(new TextEncoder().encode(body))
    headers['Content-Encoding'] = 'gzip'
    headers['Vary'] = 'Accept-Encoding'
    return new Response(zipped, { status, headers })
  }
  return new Response(body, { status, headers })
}

const noContent = () => new Response(null, { status: 204, headers: CORS })
const fail = (status: number, body: ApiErrorBody, req?: Request) => json(body, status, req)
const notFound = (req: Request) => fail(404, { detail: 'Not found.' }, req)

// --------------------------------------------------------------------- auth

/**
 * Unsigned JWT with the claims `src/lib/auth.ts` reads. Mirrors
 * `src/lib/dev-auth.ts` so both paths mint the same shape. No real server
 * would accept this; nothing here is a security boundary.
 */
const b64url = (o: unknown) =>
  btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

const PROFILES: Record<Role, { name: string; department: string }> = {
  student: { name: D.ME.fullName, department: D.ME.department! },
  faculty: { name: 'Dr. Hasan Mahmud', department: 'Dept. of Computer Science' },
  admin: { name: 'System Admin', department: 'Institutional Admin' },
}

function mintToken(role: Role, ttlSeconds: number) {
  return [
    b64url({ alg: 'none', typ: 'JWT' }),
    b64url({
      user_id: `${role}-0891`,
      role,
      full_name: PROFILES[role].name,
      email: `${role}@unigpt.dev`,
      department: PROFILES[role].department,
      exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    }),
    '',
  ].join('.')
}

/** Access tokens are short on purpose: the 401-refresh path gets exercised. */
const ACCESS_TTL = Number(Bun.env.MOCK_ACCESS_TTL ?? 300)

function roleFromAuth(req: Request): Role | null {
  const raw = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!raw) return null
  try {
    const claims = JSON.parse(atob(raw.split('.')[1]!.replace(/-/g, '+').replace(/_/g, '/')))
    if (typeof claims.exp === 'number' && claims.exp * 1000 <= Date.now()) return null
    return claims.role ?? null
  } catch {
    return null
  }
}

// ------------------------------------------------------------ mutable state

/** Everything a student mutation can touch. Reset by restarting the server. */
const state = {
  notes: [...D.NOTES] as Note[],
  revaluations: [...D.REVALUATION.requests] as RevaluationRequestRow[],
  replies: {} as Record<string, ForumReply[]>,
  readAnnouncements: new Set<string>(),
  /** offeringIds the student has added this session. */
  cart: new Set<string>(),
  droppedOfferings: new Set<string>(),
  payments: [] as PaymentIntent[],
  /** idempotencyKey -> payment id, so a retry never charges twice. */
  paymentKeys: {} as Record<string, string>,
  lectureProgress: {} as Record<string, { positionSeconds: number; watched: boolean }>,
}

let seq = 1000
const nextId = (prefix: string) => `${prefix}-${++seq}`

// ------------------------------------------------------------------- router

type Ctx = { req: Request; params: Record<string, string>; query: URLSearchParams }
type Handler = (ctx: Ctx) => Response | Promise<Response>

const routes: { method: string; segments: string[]; handler: Handler }[] = []

const route = (method: string, path: string, handler: Handler) =>
  routes.push({ method, segments: path.split('/').filter(Boolean), handler })

const GET = (p: string, h: Handler) => route('GET', p, h)
const POST = (p: string, h: Handler) => route('POST', p, h)
const PATCH = (p: string, h: Handler) => route('PATCH', p, h)
const DELETE = (p: string, h: Handler) => route('DELETE', p, h)

/** Static payload shorthand — the majority of GETs are exactly this. */
const serve = (path: string, data: unknown) => GET(path, ({ req }) => json(data, 200, req))

function match(method: string, pathname: string) {
  const parts = pathname.split('/').filter(Boolean)
  for (const r of routes) {
    if (r.method !== method || r.segments.length !== parts.length) continue
    const params: Record<string, string> = {}
    let ok = true
    for (let i = 0; i < parts.length; i++) {
      const seg = r.segments[i]!
      if (seg.startsWith(':')) params[seg.slice(1)] = decodeURIComponent(parts[i]!)
      else if (seg !== parts[i]) { ok = false; break }
    }
    if (ok) return { handler: r.handler, params }
  }
  return null
}

const body = async <T>(req: Request): Promise<T> => (await req.json()) as T

// ===========================================================================
// Auth
// ===========================================================================

POST('/api/token/', async ({ req }) => {
  const { username } = await body<{ username?: string; password?: string }>(req)
  const role = username?.trim().toLowerCase() as Role | undefined
  if (!role || !(role in PROFILES)) {
    return fail(401, { detail: 'No active account found with the given credentials.' }, req)
  }
  return json(
    { access: mintToken(role, ACCESS_TTL), refresh: mintToken(role, 60 * 60 * 24) },
    200,
    req,
  )
})

POST('/api/token/refresh/', async ({ req }) => {
  const { refresh } = await body<{ refresh?: string }>(req)
  const role = refresh ? roleFromAuth(new Request('http://x', { headers: { authorization: `Bearer ${refresh}` } })) : null
  if (!role) return fail(401, { detail: 'Token is invalid or expired.', code: 'token_not_valid' }, req)
  return json({ access: mintToken(role, ACCESS_TTL) }, 200, req)
})

GET('/api/me/', ({ req }) => json(D.ME, 200, req))

// ===========================================================================
// Dashboard + assistant
// ===========================================================================

serve('/api/student/dashboard/', D.DASHBOARD)

GET('/api/student/ai/assist/', ({ req, query }) => {
  const context = query.get('context') ?? ''
  const found = D.ASSISTANTS[context]
  if (!found) return notFound(req)
  return json({ context, ...found }, 200, req)
})

// ===========================================================================
// Academic
// ===========================================================================

serve('/api/student/academic/courses/', D.MY_COURSES)
serve('/api/student/academic/curriculum/', D.CURRICULUM)
serve('/api/student/academic/degree-progress/', D.DEGREE_PROGRESS)
serve('/api/student/academic/credits/', D.CREDIT_PROGRESS)
serve('/api/student/academic/routine/', D.ROUTINE)
serve('/api/student/academic/classrooms/', D.CLASSROOMS)

GET('/api/student/academic/calendar/', ({ req, query }) =>
  json(D.calendarFor(query.get('month') ?? new Date().toISOString().slice(0, 7)), 200, req),
)

GET('/api/student/academic/faculty/', ({ req, query }) => {
  const q = (query.get('q') ?? '').toLowerCase()
  const dept = query.get('department')
  const rows = D.FACULTY_DIRECTORY.filter(
    (f) =>
      (!q || f.name.toLowerCase().includes(q) || (f.title ?? '').toLowerCase().includes(q)) &&
      (!dept || f.department === dept),
  )
  return json(paginate(rows, query, '/api/student/academic/faculty/'), 200, req)
})

serve('/api/student/academic/registration/semester/', D.SEMESTER_REGISTRATION)

POST('/api/student/academic/registration/semester/', async ({ req }) => {
  const { termId, offeringIds } = await body<{ termId?: string; offeringIds?: string[] }>(req)
  if (!termId || !offeringIds?.length) {
    return fail(400, { offeringIds: ['Select at least one course before submitting.'] }, req)
  }
  return json({ ...D.SEMESTER_REGISTRATION, approval: 'PENDING' }, 202, req)
})

GET('/api/student/academic/registration/courses/', ({ req, query }) => {
  const q = (query.get('q') ?? '').toLowerCase()
  const dept = query.get('department')
  const rows = D.OFFERINGS.filter(
    (o) =>
      (!q || o.course.title.toLowerCase().includes(q) || o.course.code.toLowerCase().includes(q)) &&
      (!dept || dept === 'All Departments' || o.department === dept),
  ).map((o) =>
    // Seats move as the session adds courses, so the UI can show its own effect.
    state.cart.has(o.id) ? { ...o, seatsTaken: o.seatsTaken + 1, canRegister: false, blockedReason: 'Already added.' } : o,
  )
  return json(paginate(rows, query, '/api/student/academic/registration/courses/'), 200, req)
})

POST('/api/student/academic/registration/courses/', async ({ req }) => {
  const { offeringId } = await body<AddCourseRequest>(req)
  const offering = D.OFFERINGS.find((o) => o.id === offeringId)
  if (!offering) return fail(400, { offeringId: ['Unknown offering.'] }, req)
  if (!offering.canRegister) return fail(409, { detail: offering.blockedReason ?? 'Cannot register.', code: 'seat_unavailable' }, req)
  if (state.cart.has(offeringId)) return fail(409, { detail: 'Already registered.', code: 'duplicate' }, req)
  state.cart.add(offeringId)
  return json({ ...offering, seatsTaken: offering.seatsTaken + 1, canRegister: false, blockedReason: 'Already added.' }, 201, req)
})

DELETE('/api/student/academic/registration/courses/:offeringId/', ({ params }) => {
  state.cart.delete(params.offeringId!)
  return noContent()
})

GET('/api/student/academic/registration/drop-add/', ({ req }) =>
  json(
    {
      ...D.DROP_ADD,
      enrolled: D.DROP_ADD.enrolled.filter((e) => !state.droppedOfferings.has(e.offeringId)),
      enrolledCredits: D.DROP_ADD.enrolled
        .filter((e) => !state.droppedOfferings.has(e.offeringId))
        .reduce((n, e) => n + e.course.credits, 0),
    },
    200,
    req,
  ),
)

POST('/api/student/academic/registration/drop-add/', async ({ req }) => {
  const { action, offeringId } = await body<DropAddRequest>(req)
  const row = D.DROP_ADD.enrolled.find((e) => e.offeringId === offeringId)
  if (action === 'DROP') {
    if (!row) return fail(400, { offeringId: ['Not enrolled in this offering.'] }, req)
    if (!row.canDrop) return fail(409, { detail: 'The drop deadline for this course has passed.', code: 'drop_closed' }, req)
    state.droppedOfferings.add(offeringId)
  } else {
    state.droppedOfferings.delete(offeringId)
  }
  return json(
    { id: nextId('da'), action, offeringId, status: 'PENDING', submittedAt: new Date().toISOString() },
    201,
    req,
  )
})

// ===========================================================================
// LMS
// ===========================================================================

serve('/api/student/lms/overview/', D.LMS_OVERVIEW)
serve('/api/student/lms/courses/', D.LMS_COURSES_RESPONSE)
serve('/api/student/lms/live/', D.LIVE_CLASSES)
serve('/api/student/lms/recordings/', D.RECORDINGS)
serve('/api/student/lms/downloads/', D.DOWNLOADS)
serve('/api/student/lms/progress/', D.LEARNING_PROGRESS)
serve('/api/student/lms/analytics/', D.LEARNING_ANALYTICS)
serve('/api/student/lms/gradebook/', D.GRADEBOOK)
serve('/api/student/lms/quizzes/', D.QUIZZES)

GET('/api/student/lms/courses/:courseId/lectures/', ({ req, params }) => {
  const base = D.lecturesFor(params.courseId!)
  return json(
    { ...base, lectures: base.lectures.map((l) => ({ ...l, ...state.lectureProgress[l.id] })) },
    200,
    req,
  )
})

GET('/api/student/lms/courses/:courseId/materials/', ({ req, params }) =>
  json(D.materialsFor(params.courseId!), 200, req),
)

POST('/api/student/lms/lectures/:id/progress/', async ({ req, params }) => {
  const { positionSeconds, watched } = await body<{ positionSeconds: number; watched: boolean }>(req)
  state.lectureProgress[params.id!] = { positionSeconds, watched }
  return noContent()
})

GET('/api/student/lms/assignments/', ({ req, query }) => {
  const st = query.get('state')
  return json(
    st
      ? { ...D.ASSIGNMENTS, assignments: D.ASSIGNMENTS.assignments.filter((a) => a.state === st) }
      : D.ASSIGNMENTS,
    200,
    req,
  )
})

GET('/api/student/lms/assignments/:id/', ({ req, params }) =>
  json({ ...D.ASSIGNMENT_DETAIL, id: params.id! }, 200, req),
)

POST('/api/student/lms/assignments/:id/submissions/', async ({ req, params }) => {
  const form = await req.formData()
  if (form.get('integrityAgreed') !== 'true') {
    return fail(400, { integrityAgreed: ['You must accept the academic integrity declaration.'] }, req)
  }
  // flatMap, not filter: `instanceof File` does not narrow here because Bun's
  // and node's `File` globals both resolve, and neither is the other.
  const files = form.getAll('files').flatMap((f) => (typeof f === 'string' ? [] : [f]))
  if (!files.length) return fail(400, { files: ['Attach at least one file.'] }, req)

  return json(
    {
      id: nextId('sub'),
      assignmentId: params.id!,
      state: 'SUBMITTED',
      comment: String(form.get('comment') ?? ''),
      attachments: files.map((f) => ({
        id: nextId('att'),
        filename: f.name,
        sizeBytes: f.size,
        mimeType: f.type || 'application/octet-stream',
        url: `/mock/files/${encodeURIComponent(f.name)}`,
        uploadedAt: new Date().toISOString(),
      })),
      submittedAt: new Date().toISOString(),
      grade: null,
      feedback: null,
    },
    201,
    req,
  )
})

GET('/api/student/lms/quizzes/:id/practice/', ({ req, params }) =>
  json({ ...D.PRACTICE_QUIZ, id: params.id! }, 200, req),
)

POST('/api/student/lms/quizzes/:id/attempts/', async ({ req, params }) => {
  const { answers, elapsedSeconds } = await body<QuizAttemptRequest>(req)
  const perQuestion = D.PRACTICE_QUIZ.questions.map((q) => ({
    questionId: q.id,
    correct: answers.find((a) => a.questionId === q.id)?.optionId === q.correctOptionId,
    correctOptionId: q.correctOptionId!,
  }))
  const correctCount = perQuestion.filter((p) => p.correct).length
  const result: QuizAttemptResult = {
    id: nextId('att'),
    quizId: params.id!,
    scorePercent: Math.round((correctCount / perQuestion.length) * 100),
    correctCount,
    totalCount: perQuestion.length,
    submittedAt: new Date().toISOString(),
    perQuestion,
  }
  void elapsedSeconds
  return json(result, 201, req)
})

GET('/api/student/lms/forum/threads/', ({ req, query }) => {
  const courseId = query.get('courseId')
  const rows = D.FORUM_THREADS.filter((t) => !courseId || t.course.id === courseId).map((t) => ({
    ...t,
    replyCount: t.replyCount + (state.replies[t.id]?.length ?? 0),
  }))
  return json({ results: rows, nextCursor: null }, 200, req)
})

GET('/api/student/lms/forum/threads/:id/', ({ req, params }) => {
  const detail = D.threadDetail(params.id!)
  if (!detail) return notFound(req)
  return json({ ...detail, replies: [...detail.replies, ...(state.replies[params.id!] ?? [])] }, 200, req)
})

POST('/api/student/lms/forum/threads/', async ({ req }) => {
  const { courseId, title, body: text } = await body<{ courseId?: string; title?: string; body?: string }>(req)
  if (!title?.trim()) return fail(400, { title: ['This field may not be blank.'] }, req)
  const course = Object.values(D.COURSES).find((x) => x.id === courseId) ?? D.COURSES.dsa
  return json(
    {
      id: nextId('th'),
      title,
      excerpt: (text ?? '').slice(0, 120),
      course,
      authorName: D.ME.fullName,
      replyCount: 0,
      pinned: false,
      lastActivityAt: new Date().toISOString(),
    },
    201,
    req,
  )
})

POST('/api/student/lms/forum/threads/:id/replies/', async ({ req, params }) => {
  const { body: text } = await body<CreateReplyRequest>(req)
  if (!text?.trim()) return fail(400, { body: ['This field may not be blank.'] }, req)
  const reply: ForumReply = {
    id: nextId('rp'),
    body: text,
    authorName: D.ME.fullName,
    authorAvatarUrl: null,
    isMine: true,
    createdAt: new Date().toISOString(),
  }
  ;(state.replies[params.id!] ??= []).push(reply)
  return json(reply, 201, req)
})

GET('/api/student/lms/notes/', ({ req, query }) => {
  const q = (query.get('q') ?? '').toLowerCase()
  const tag = query.get('tag')
  const rows = state.notes.filter(
    (n) => (!q || n.title.toLowerCase().includes(q)) && (!tag || n.tag === tag),
  )
  return json(paginate(rows, query, '/api/student/lms/notes/'), 200, req)
})

POST('/api/student/lms/notes/', async ({ req }) => {
  const input = await body<CreateNoteRequest>(req)
  if (!input.title?.trim()) return fail(400, { title: ['This field may not be blank.'] }, req)
  const note: Note = {
    id: nextId('nt'),
    title: input.title,
    body: input.body ?? '',
    tag: input.tag ?? null,
    courseId: input.courseId ?? null,
    updatedAt: new Date().toISOString(),
  }
  state.notes.unshift(note)
  return json(note, 201, req)
})

PATCH('/api/student/lms/notes/:id/', async ({ req, params }) => {
  const i = state.notes.findIndex((n) => n.id === params.id)
  if (i < 0) return notFound(req)
  const patch = await body<UpdateNoteRequest>(req)
  state.notes[i] = { ...state.notes[i]!, ...patch, updatedAt: new Date().toISOString() }
  return json(state.notes[i], 200, req)
})

DELETE('/api/student/lms/notes/:id/', ({ req, params }) => {
  const i = state.notes.findIndex((n) => n.id === params.id)
  if (i < 0) return notFound(req)
  state.notes.splice(i, 1)
  return noContent()
})

GET('/api/student/lms/announcements/', ({ req }) => {
  const announcements = D.ANNOUNCEMENTS.announcements.map((a) =>
    state.readAnnouncements.has(a.id) ? { ...a, read: true } : a,
  )
  return json({ announcements, unreadCount: announcements.filter((a) => !a.read).length }, 200, req)
})

POST('/api/student/lms/announcements/:id/read/', ({ params }) => {
  state.readAnnouncements.add(params.id!)
  return noContent()
})

// ===========================================================================
// Attendance
// ===========================================================================

serve('/api/student/attendance/overview/', D.ATTENDANCE_OVERVIEW)
serve('/api/student/attendance/history/', D.ATTENDANCE_HISTORY)
serve('/api/student/attendance/analytics/', D.ATTENDANCE_ANALYTICS)

GET('/api/student/attendance/daily/', ({ req, query }) =>
  json(D.dailyAttendance(query.get('date') ?? D.dayIn(0)), 200, req),
)

GET('/api/student/attendance/courses/:courseId/', ({ req, params }) =>
  json(D.courseAttendance(params.courseId!), 200, req),
)

// ===========================================================================
// Examinations
// ===========================================================================

serve('/api/student/exams/overview/', D.EXAM_OVERVIEW)
serve('/api/student/exams/schedule/', D.EXAM_SCHEDULE)
serve('/api/student/exams/upcoming/', D.UPCOMING_EXAMS)
serve('/api/student/exams/admit-card/', D.ADMIT_CARD)
serve('/api/student/exams/results/', D.EXAM_RESULTS)
serve('/api/student/exams/grade-report/', D.GRADE_REPORT)
serve('/api/student/exams/attendance/', D.EXAM_ATTENDANCE)
serve('/api/student/exams/analytics/', D.EXAM_ANALYTICS)

GET('/api/student/exams/revaluation/', ({ req }) =>
  json({ ...D.REVALUATION, requests: state.revaluations }, 200, req),
)

POST('/api/student/exams/revaluation/', async ({ req }) => {
  const input = await body<CreateRevaluationRequest>(req)
  const course = D.REVALUATION.eligibleCourses.find((c) => c.id === input.courseId)
  const examType = D.REVALUATION.examTypes.find((e) => e.id === input.examTypeId)
  const reviewType = D.REVALUATION.reviewTypes.find((r) => r.id === input.reviewTypeId)
  if (!course) return fail(400, { courseId: ['Not eligible for revaluation.'] }, req)
  if (!examType) return fail(400, { examTypeId: ['Unknown exam type.'] }, req)
  if (!reviewType) return fail(400, { reviewTypeId: ['Unknown review type.'] }, req)
  if (!input.reason?.trim()) return fail(400, { reason: ['This field may not be blank.'] }, req)

  const row: RevaluationRequestRow = {
    id: nextId('rv'),
    course,
    examType: examType.label,
    reviewType: reviewType.label,
    status: 'PENDING',
    submittedAt: new Date().toISOString(),
    fee: reviewType.fee,
    outcome: null,
  }
  state.revaluations = [row, ...state.revaluations]
  return json(row, 201, req)
})

// ===========================================================================
// Finance
// ===========================================================================

serve('/api/student/finance/overview/', D.FINANCE_OVERVIEW)
serve('/api/student/finance/payment-options/', D.PAYMENT_OPTIONS)
serve('/api/student/finance/statement/', D.FEE_STATEMENT)
serve('/api/student/finance/invoices/', D.INVOICES)
serve('/api/student/finance/installments/', D.INSTALLMENTS)

GET('/api/student/finance/history/', ({ req }) =>
  json(
    {
      ...D.PAYMENT_HISTORY,
      results: [...state.payments.filter((p) => p.status === 'SUCCESS').map(toRecord), ...D.PAYMENT_HISTORY.results],
    },
    200,
    req,
  ),
)

const toRecord = (p: PaymentIntent) => ({
  id: p.id,
  paidAt: p.createdAt,
  reference: p.reference ?? p.id,
  methodLabel: 'Mock Gateway',
  amount: p.amount,
  status: p.status,
  receiptUrl: null,
})

POST('/api/student/finance/payments/', async ({ req }) => {
  const input = await body<CreatePaymentRequest>(req)
  if (!input.idempotencyKey) {
    return fail(400, { idempotencyKey: ['Required. Generate one per payment attempt.'] }, req)
  }
  // Replaying a key returns the original intent — never a second charge.
  const existingId = state.paymentKeys[input.idempotencyKey]
  if (existingId) {
    return json(state.payments.find((p) => p.id === existingId), 200, req)
  }
  const amount = Number(input.amount)
  if (!Number.isFinite(amount) || amount <= 0) {
    return fail(400, { amount: ['Enter a valid amount.'] }, req)
  }
  if (amount < Number(D.PAYMENT_OPTIONS.minimumPayable)) {
    return fail(400, { amount: [`Minimum payable is ${D.PAYMENT_OPTIONS.minimumPayable}.`] }, req)
  }
  if (amount > Number(D.PAYMENT_OPTIONS.outstanding)) {
    return fail(400, { amount: [`Cannot exceed the outstanding ${D.PAYMENT_OPTIONS.outstanding}.`] }, req)
  }

  const intent: PaymentIntent = {
    id: nextId('pay'),
    // Real gateways hand off; the UI must handle REDIRECT_REQUIRED, so mock it.
    status: 'REDIRECT_REQUIRED',
    amount: amount.toFixed(2),
    currency: 'BDT',
    redirectUrl: `http://localhost:${PORT}/mock/gateway/${seq}`,
    reference: `TXN-${seq}`,
    failureReason: null,
    createdAt: new Date().toISOString(),
  }
  state.payments.push(intent)
  state.paymentKeys[input.idempotencyKey] = intent.id
  return json(intent, 201, req)
})

GET('/api/student/finance/payments/:id/', ({ req, params }) => {
  const p = state.payments.find((x) => x.id === params.id)
  if (!p) return notFound(req)
  // Settles ~10s after creation, so the polling UI has something to observe.
  if (p.status === 'REDIRECT_REQUIRED' && Date.now() - Date.parse(p.createdAt) > 10_000) {
    p.status = 'SUCCESS'
    p.redirectUrl = null
  }
  return json(p, 200, req)
})

// ===========================================================================
// AI
// ===========================================================================

serve('/api/student/ai/overview/', D.AI_OVERVIEW)
serve('/api/student/ai/advisor/', D.ADVISOR)
serve('/api/student/ai/recommendations/', D.RECOMMENDATIONS)
serve('/api/student/ai/study-planner/options/', D.STUDY_PLANNER_OPTIONS)
serve('/api/student/ai/quiz/options/', D.QUIZ_GENERATOR_OPTIONS)

GET('/api/student/ai/conversations/', ({ req }) =>
  json({ results: D.AI_OVERVIEW.recentConversations, nextCursor: null }, 200, req),
)

GET('/api/student/ai/conversations/:id/', ({ req, params }) =>
  json(D.conversation(params.id!), 200, req),
)

/**
 * SSE, not JSON — the chat UI must handle a stream, so the mock streams.
 * Frames match `AiStreamEvent`.
 */
POST('/api/student/ai/conversations/:id/messages/', async ({ req }) => {
  const { text } = await body<{ text?: string }>(req)
  if (!text?.trim()) return fail(400, { text: ['This field may not be blank.'] }, req)

  const reply = `Here is a walkthrough of "${text.trim().slice(0, 60)}". Quicksort partitions around a pivot; with a balanced split the recursion depth is log n, and each level costs O(n) — hence O(n log n) on average.`
  const words = reply.split(' ')
  const messageId = nextId('msg')

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder()
      const send = (e: unknown) => controller.enqueue(enc.encode(`data: ${JSON.stringify(e)}\n\n`))
      for (const w of words) {
        send({ type: 'delta', text: `${w} ` })
        await Bun.sleep(30)
      }
      send({ type: 'done', messageId })
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { ...CORS, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  })
})

POST('/api/student/ai/study-planner/', ({ req }) => json(D.STUDY_PLAN, 201, req))
POST('/api/student/ai/notes/', ({ req }) => json(D.GENERATED_NOTE, 201, req))
POST('/api/student/ai/quiz/', ({ req }) => json(D.GENERATED_QUIZ, 201, req))
POST('/api/student/ai/assignment-helper/', ({ req }) => json(D.ASSIGNMENT_HELPER, 201, req))

// ===========================================================================
// Certificates
// ===========================================================================

serve('/api/student/certificates/', D.CERTIFICATES_RESPONSE)

POST('/api/student/certificates/print-orders/', async ({ req }) => {
  const { certificateIds, copies } = await body<{ certificateIds?: string[]; copies?: number }>(req)
  if (!certificateIds?.length) return fail(400, { certificateIds: ['Select at least one certificate.'] }, req)
  return json(
    {
      id: nextId('ord'),
      status: 'PENDING',
      fee: (500 * (copies ?? 1) * certificateIds.length).toFixed(2),
      createdAt: new Date().toISOString(),
    },
    201,
    req,
  )
})

// ---------------------------------------------------------------- pagination

function paginate<T>(rows: T[], query: URLSearchParams, path: string) {
  const size = Math.min(Number(query.get('page_size') ?? 20), 100)
  const page = Math.max(Number(query.get('page') ?? 1), 1)
  const start = (page - 1) * size
  const slice = rows.slice(start, start + size)
  const url = (p: number) => `http://localhost:${PORT}${path}?page=${p}&page_size=${size}`
  return {
    count: rows.length,
    next: start + size < rows.length ? url(page + 1) : null,
    previous: page > 1 ? url(page - 1) : null,
    results: slice,
  }
}

// ===========================================================================
// Server
// ===========================================================================

const server = Bun.serve({
  port: PORT,
  idleTimeout: 60,
  async fetch(req) {
    const url = new URL(req.url)

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })

    // Failure injection first — a route that never runs is the point.
    const forced = Number(url.searchParams.get('_fail'))
    if (forced >= 400) {
      return fail(forced, { detail: `Injected failure (${forced}).`, code: 'mock_failure' }, req)
    }

    const delay = Number(url.searchParams.get('_delay') ?? BASE_LATENCY)
    if (delay > 0) await Bun.sleep(delay)

    const hit = match(req.method, url.pathname)
    if (!hit) return notFound(req)

    // Auth gate, so the 401 → refresh → retry path in use-api.ts gets exercised.
    if (url.pathname.startsWith('/api/student/') || url.pathname === '/api/me/') {
      if (!roleFromAuth(req)) {
        return fail(401, { detail: 'Given token not valid for any token type.', code: 'token_not_valid' }, req)
      }
    }

    try {
      return await hit.handler({ req, params: hit.params, query: url.searchParams })
    } catch (err) {
      console.error(`${req.method} ${url.pathname}`, err)
      return fail(500, { detail: String(err) }, req)
    }
  },
})

console.log(`mock api  →  http://localhost:${server.port}`)
console.log(`  ${routes.length} routes · ${BASE_LATENCY}ms latency · access token ${ACCESS_TTL}s`)
console.log(`  sign in as student / faculty / admin (any password)`)
console.log(`  ?_delay=1200 to slow a call · ?_fail=500 to break one`)

export { routes }
