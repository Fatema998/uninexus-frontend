/** `bun test` — the branchy bits of format.ts. Everything else is one Intl call. */

import { expect, test } from 'bun:test'
import { duration, fileSize, money, percent, relative } from './format'

test('money takes the wire decimal string without losing paisa', () => {
  expect(money('48500.00')).toBe('৳48,500.00')
  expect(money('0.05')).toBe('৳0.05')
  expect(money(48500)).toBe('৳48,500.00')
})

test('relative picks the largest unit that reaches 1', () => {
  const now = Date.parse('2026-05-25T12:00:00Z')
  const at = (ms: number) => relative(new Date(now + ms).toISOString(), now)

  expect(at(90 * 60_000)).toBe('in 1 hour') // not "in 90 minutes"
  expect(at(-2 * 3_600_000)).toBe('2 hours ago')
  expect(at(3 * 86_400_000)).toBe('in 3 days')
  expect(at(30_000)).toBe('just now')
})

test('duration renders both styles', () => {
  expect(duration(5400)).toBe('1h 30m')
  expect(duration(1800)).toBe('30m')
  expect(duration(1104, 'clock')).toBe('18:24')
  expect(duration(5400, 'clock')).toBe('1:30:00')
})

test('fileSize steps through binary units', () => {
  expect(fileSize(512)).toBe('512 B')
  expect(fileSize(1_153_434)).toBe('1.1 MB')
  expect(fileSize(327_155_712)).toBe('312 MB')
})

test('percent rounds rather than truncates', () => {
  expect(percent(63.2)).toBe('63%')
  expect(percent(87.6)).toBe('88%')
})
