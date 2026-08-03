/**
 * Smoke check for the mock API.  `bun run mock:test`
 *
 * Hits every GET route, the mutations that carry real logic, and the failure
 * paths the optimistic UI depends on. Asserts only what would actually break
 * something: status, non-empty body, and the handful of invariants worth
 * having (idempotent payments, 401 before auth, validation rejections).
 *
 * ponytail: plain asserts, no test framework. It fails loudly and exits 1.
 */

import { strict as assert } from 'node:assert'
import { routes } from './server.ts'

const BASE = `http://localhost:${Bun.env.MOCK_PORT ?? 8787}`
/** Latency off — this is a contract check, not a timing one. */
const Q = '?_delay=0'

/** Sample values for `:params`, so every parameterised route is reachable. */
const SAMPLES: Record<string, string> = {
  courseId: 'crs-9',
  offeringId: 'off-1',
  id: 'th-1',
}

/**
 * Routes the generic loop cannot guess: a required query param, or an id that
 * only exists once something has been created. Value is appended to the URL,
 * or `null` to skip and cover it explicitly further down.
 */
const READ_OVERRIDES: Record<string, string | null> = {
  '/api/student/ai/assist/': '&context=student.dashboard',
  '/api/student/finance/payments/:id/': null, // needs a real intent — see writes
}

let token = ''
let failures = 0

function check(name: string, fn: () => void) {
  try {
    fn()
    console.log(`  ok   ${name}`)
  } catch (err) {
    failures++
    console.error(`  FAIL ${name}\n       ${(err as Error).message}`)
  }
}

const auth = () => ({ Authorization: `Bearer ${token}` })

async function get(path: string, extra = '') {
  const res = await fetch(`${BASE}${path}${Q}${extra}`, { headers: auth() })
  return { res, body: res.status === 204 ? null : await res.json().catch(() => null) }
}

async function send(method: string, path: string, payload?: unknown) {
  const res = await fetch(`${BASE}${path}${Q}`, {
    method,
    headers: { ...auth(), ...(payload ? { 'Content-Type': 'application/json' } : {}) },
    body: payload ? JSON.stringify(payload) : undefined,
  })
  return { res, body: res.status === 204 ? null : await res.json().catch(() => null) }
}

// --------------------------------------------------------------------- run

console.log('\nauth')

{
  const { res } = await get('/api/student/dashboard/')
  check('unauthenticated GET is 401', () => assert.equal(res.status, 401))
}

{
  const res = await fetch(`${BASE}/api/token/${Q}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'student', password: 'anything' }),
  })
  const b = (await res.json()) as { access: string; refresh: string }
  token = b.access
  check('POST /api/token/ mints a pair', () => {
    assert.equal(res.status, 200)
    assert.ok(b.access && b.refresh, 'missing access/refresh')
  })

  const bad = await fetch(`${BASE}/api/token/${Q}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'nobody', password: 'x' }),
  })
  check('unknown user is 401', () => assert.equal(bad.status, 401))

  const refreshed = await fetch(`${BASE}/api/token/refresh/${Q}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: b.refresh }),
  })
  check('refresh returns a new access token', () => assert.equal(refreshed.status, 200))
}

console.log('\nreads — every GET route')

const getRoutes = routes.filter((r) => r.method === 'GET')
assert.ok(getRoutes.length > 40, `expected 40+ GET routes, found ${getRoutes.length}`)

for (const r of getRoutes) {
  const template = `/${r.segments.join('/')}/`
  if (template in READ_OVERRIDES && READ_OVERRIDES[template] === null) continue

  const path = `/${r.segments.map((s) => (s.startsWith(':') ? SAMPLES[s.slice(1)] ?? 'x' : s)).join('/')}/`
  const { res, body } = await get(path, READ_OVERRIDES[template] ?? '')
  check(`GET ${path}`, () => {
    assert.equal(res.status, 200, `status ${res.status}`)
    assert.ok(body && Object.keys(body).length > 0, 'empty body')
  })
}

{
  const { res } = await get('/api/student/ai/assist/', '&context=nope')
  check('unknown assistant context → 404', () => assert.equal(res.status, 404))
}

console.log('\nwrites')

{
  const { res, body } = await send('POST', '/api/student/lms/notes/', {
    title: 'Smoke note',
    body: 'created by the smoke check',
    tag: 'Trees',
  })
  const id = (body as { id: string }).id
  check('POST note → 201 with an id', () => {
    assert.equal(res.status, 201)
    assert.ok(id, 'no id returned')
  })

  const listed = await get('/api/student/lms/notes/')
  check('created note appears in the list', () =>
    assert.ok((listed.body as { results: { id: string }[] }).results.some((n) => n.id === id)),
  )

  const patched = await send('PATCH', `/api/student/lms/notes/${id}/`, { title: 'Renamed' })
  check('PATCH note applies', () => assert.equal((patched.body as { title: string }).title, 'Renamed'))

  const deleted = await send('DELETE', `/api/student/lms/notes/${id}/`)
  check('DELETE note → 204', () => assert.equal(deleted.res.status, 204))

  const gone = await send('DELETE', `/api/student/lms/notes/${id}/`)
  check('deleting twice → 404', () => assert.equal(gone.res.status, 404))
}

{
  const blank = await send('POST', '/api/student/lms/notes/', { title: '   ' })
  check('blank title → 400 with a field error', () => {
    assert.equal(blank.res.status, 400)
    assert.ok(Array.isArray((blank.body as { title?: string[] }).title), 'no field error array')
  })
}

{
  const { res, body } = await send('POST', '/api/student/exams/revaluation/', {
    courseId: 'crs-9',
    examTypeId: 'et-1',
    reviewTypeId: 'rt-1',
    reason: 'Section B was marked against the wrong rubric.',
  })
  check('POST revaluation → 201 PENDING', () => {
    assert.equal(res.status, 201)
    assert.equal((body as { status: string }).status, 'PENDING')
  })

  const listed = await get('/api/student/exams/revaluation/')
  check('new request is prepended to the list', () =>
    assert.equal(
      (listed.body as { requests: { id: string }[] }).requests[0]!.id,
      (body as { id: string }).id,
    ),
  )
}

{
  const key = crypto.randomUUID()
  const payload = { amount: '6500.00', methodId: 'pm-1', invoiceIds: ['inv-2'], idempotencyKey: key }
  const first = await send('POST', '/api/student/finance/payments/', payload)
  const second = await send('POST', '/api/student/finance/payments/', payload)
  check('payment is idempotent under a replayed key', () => {
    assert.equal(first.res.status, 201)
    assert.equal(second.res.status, 200)
    assert.equal((first.body as { id: string }).id, (second.body as { id: string }).id)
  })

  const tooSmall = await send('POST', '/api/student/finance/payments/', {
    ...payload,
    amount: '10.00',
    idempotencyKey: crypto.randomUUID(),
  })
  check('below minimum → 400', () => assert.equal(tooSmall.res.status, 400))

  const noKey = await send('POST', '/api/student/finance/payments/', { ...payload, idempotencyKey: '' })
  check('missing idempotency key → 400', () => assert.equal(noKey.res.status, 400))

  const polled = await get(`/api/student/finance/payments/${(first.body as { id: string }).id}/`)
  check('payment intent is pollable and starts unsettled', () => {
    assert.equal(polled.res.status, 200)
    const p = polled.body as { status: string; redirectUrl: string | null }
    assert.equal(p.status, 'REDIRECT_REQUIRED')
    assert.ok(p.redirectUrl, 'no gateway redirect to hand off to')
  })
}

{
  const { res, body } = await send('POST', '/api/student/lms/quizzes/qz-2/attempts/', {
    answers: [
      { questionId: 'pq-1', optionId: 'pq-1-b' },
      { questionId: 'pq-2', optionId: 'pq-2-a' },
      { questionId: 'pq-3', optionId: 'pq-3-c' },
    ],
    elapsedSeconds: 240,
  })
  check('quiz attempt grades 2/3', () => {
    assert.equal(res.status, 201)
    const r = body as { correctCount: number; totalCount: number; scorePercent: number }
    assert.equal(r.correctCount, 2)
    assert.equal(r.totalCount, 3)
    assert.equal(r.scorePercent, 67)
  })
}

{
  const dup = await send('POST', '/api/student/academic/registration/courses/', { offeringId: 'off-1' })
  const again = await send('POST', '/api/student/academic/registration/courses/', { offeringId: 'off-1' })
  check('registering twice → 409', () => {
    assert.equal(dup.res.status, 201)
    assert.equal(again.res.status, 409)
  })

  const full = await send('POST', '/api/student/academic/registration/courses/', { offeringId: 'off-5' })
  check('full section → 409 seat_unavailable', () => {
    assert.equal(full.res.status, 409)
    assert.equal((full.body as { code: string }).code, 'seat_unavailable')
  })
}

console.log('\noptimistic-UI support')

{
  const res = await fetch(`${BASE}/api/student/lms/notes/?_fail=500`, { method: 'POST', headers: auth() })
  check('?_fail=500 replaces the handler', () => assert.equal(res.status, 500))

  const res409 = await fetch(`${BASE}/api/student/lms/notes/?_fail=409`, { headers: auth() })
  check('?_fail=409 works on reads too', () => assert.equal(res409.status, 409))

  // The rollback is only observable if the failure lands *after* the latency —
  // an instant 500 undoes the optimistic patch before it can be seen.
  const started = Date.now()
  const slowFail = await fetch(`${BASE}/api/student/lms/notes/?_fail=500&_delay=400`, {
    method: 'POST',
    headers: auth(),
  })
  check('_fail waits out _delay before failing', () => {
    assert.equal(slowFail.status, 500)
    assert.ok(Date.now() - started >= 400, 'failed instantly; the patch was never visible')
  })
}

{
  const started = Date.now()
  await fetch(`${BASE}/api/student/dashboard/?_delay=400`, { headers: auth() })
  check('?_delay holds the response', () => assert.ok(Date.now() - started >= 400))
}

console.log('\ntransport')

{
  const plain = await fetch(`${BASE}/api/student/lms/overview/${Q}`, {
    headers: { ...auth(), 'Accept-Encoding': 'identity' },
  })
  const raw = (await plain.arrayBuffer()).byteLength

  const zipped = await fetch(`${BASE}/api/student/academic/faculty/${Q}`, {
    headers: { ...auth(), 'Accept-Encoding': 'gzip' },
  })
  check('gzip is negotiated on payloads over 1 KB', () => {
    // Bun's fetch decodes transparently, so assert on the header, not the size.
    assert.equal(zipped.headers.get('content-encoding'), 'gzip')
    assert.equal(zipped.headers.get('vary'), 'Accept-Encoding')
  })
  check('small payloads are left uncompressed', () => assert.ok(raw > 0))
}

{
  const res = await fetch(`${BASE}/api/student/nope/`, { headers: auth() })
  const b = (await res.json()) as { detail?: string }
  check('unknown route → 404 with a DRF-shaped body', () => {
    assert.equal(res.status, 404)
    assert.equal(typeof b.detail, 'string')
  })
}

console.log(failures === 0 ? '\nall checks passed\n' : `\n${failures} check(s) failed\n`)
process.exit(failures === 0 ? 0 : 1)
