import { useFixture } from '@/lib/fixtures'
import type { Assistant } from '@/components/patterns/assistant-panel'
import type { MetricTone } from '@/components/patterns/metric-card'

/** Attendance module data (Phase 4.3 — 5 screens). Content from Figma 1:15772 et al. */

export const useAttendanceOverview = () =>
  useFixture<{
    metrics: { label: string; value: string; tone: MetricTone; progress?: number }[]
    today: { title: string; time: string; state: 'PRESENT' | 'UPCOMING' }[]
    assistant: Assistant
    streak: string
  }>(['attendance', 'overview'], {
    metrics: [
      { label: 'Overall Attendance', value: '92%', tone: 'info', progress: 92 },
      { label: 'Classes Attended', value: '184', tone: 'brand' },
      { label: 'Classes Missed', value: '16', tone: 'danger' },
      { label: 'Lectures', value: '94%', tone: 'success', progress: 94 },
      { label: 'Labs', value: '88%', tone: 'accent', progress: 88 },
      { label: 'Seminars', value: '90%', tone: 'warning', progress: 90 },
    ],
    today: [
      { title: 'Data Structures', time: '09:00 AM - 10:30 AM', state: 'PRESENT' },
      { title: 'Database Systems', time: '02:00 PM - 03:30 PM', state: 'UPCOMING' },
    ],
    streak: "You've maintained a 12-day streak! Consistency is highest on Tuesdays.",
    assistant: {
      messages: [
        {
          from: 'ai',
          text: 'Your attendance in Database Systems dropped by 5% this week. Would you like to schedule a review session?',
        },
      ],
      suggestions: ['Schedule review', 'Show weak courses'],
    },
  })

export type DayMark = 'PRESENT' | 'ABSENT' | 'LATE' | 'PENDING'

export const useDailyAttendance = () =>
  useFixture<{
    date: string
    classes: { title: string; place: string; mark: DayMark }[]
    recommendation: string
  }>(['attendance', 'daily'], {
    date: 'Today',
    classes: [
      { title: 'Data Structures', place: 'Lab 304 • Prof. Sarah Jenkins', mark: 'PRESENT' },
      { title: 'Database Systems', place: 'Lecture Hall A • Dr. Robert Chen', mark: 'PRESENT' },
      { title: 'Discrete Mathematics', place: 'Seminar Room B2 • Prof. Liam Vance', mark: 'ABSENT' },
      { title: 'Web Tech', place: 'Main Campus Hub • Dr. Emily Watson', mark: 'PENDING' },
    ],
    recommendation: 'Apply for the Summer Internship by Friday to secure early interview.',
  })

export const useCourseAttendance = () =>
  useFixture<{
    course: { name: string; meta: string; percent: number }
    sessions: { date: string; time: string; mark: DayMark }[]
    note: string
    nextClass: string
    assistant: Assistant
  }>(['attendance', 'by-course'], {
    course: {
      name: 'CSE 301 Data Structures',
      meta: 'Instructor: Dr. Sarah Jenkins • Room 402B • 4 Credits',
      percent: 92,
    },
    sessions: [
      { date: 'Mar 12, 2026', time: '10:00 AM - 11:30 AM', mark: 'PRESENT' },
      { date: 'Mar 10, 2026', time: '10:00 AM - 11:30 AM', mark: 'PRESENT' },
      { date: 'Mar 05, 2026', time: '02:00 PM - 04:00 PM', mark: 'LATE' },
      { date: 'Mar 03, 2026', time: '10:00 AM - 11:30 AM', mark: 'PRESENT' },
      { date: 'Feb 26, 2026', time: '10:00 AM - 11:30 AM', mark: 'ABSENT' },
    ],
    note: "You've maintained a 100% presence on Tuesdays. Maintaining this trend ensures you're eligible for the early exam registration reward.",
    nextClass: "Next class (Mar 14) is a guest lecture by Google engineers. Don't miss out!",
    assistant: {
      messages: [
        {
          from: 'ai',
          text: "I've analyzed your attendance for CSE 301. You are safely above the 75% mandatory threshold.",
        },
      ],
    },
  })

export const useAttendanceHistory = () =>
  useFixture<{
    terms: { term: string; percent: number; attended: number; total: number }[]
    insight: string
    updated: string
  }>(['attendance', 'history'], {
    terms: [
      { term: 'Fall 2025', percent: 92, attended: 184, total: 200 },
      { term: 'Summer 2025', percent: 88, attended: 132, total: 150 },
      { term: 'Spring 2025', percent: 95, attended: 190, total: 200 },
    ],
    insight:
      'Your attendance in Discrete Mathematics has dropped below the 90% threshold this semester.',
    updated: 'Last updated: Today, 08:42 AM',
  })

export const useAttendanceAnalytics = () =>
  useFixture<{
    metrics: { label: string; value: string; tone: MetricTone }[]
    byDay: { day: string; percent: number }[]
    forecast: { headline: string; body: string }
  }>(['attendance', 'analytics'], {
    metrics: [
      { label: 'Avg. Attendance', value: '87.6%', tone: 'info' },
      { label: 'Best Subject', value: 'AI - 95%', tone: 'success' },
      { label: 'Most Missed Day', value: 'Friday', tone: 'warning' },
      { label: 'GPA Impact', value: '+0.15', tone: 'brand' },
    ],
    byDay: [
      { day: 'Mon', percent: 92 },
      { day: 'Tue', percent: 100 },
      { day: 'Wed', percent: 88 },
      { day: 'Thu', percent: 90 },
      { day: 'Fri', percent: 74 },
    ],
    forecast: {
      headline: 'AI Attendance Forecast: 91% total attendance at semester end.',
      body: 'Based on your current trajectories in Machine Learning and Software Ethics, your attendance is expected to climb +3.4% as exams approach. Maintaining this will yield a predicted GPA boost of 0.2.',
    },
  })
