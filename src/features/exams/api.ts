import { useGetData, useOptimistic, usePostData } from '@/hooks/use-api'
import type {
  AdmitCardResponse,
  CreateRevaluationRequest,
  ExamAnalyticsResponse,
  ExamAttendanceResponse,
  ExamOverviewResponse,
  ExamResultsResponse,
  ExamScheduleResponse,
  GradeReportResponse,
  RevaluationRequestRow,
  RevaluationResponse,
  UpcomingExamsResponse,
} from '@/types'

/** Examination module data (9 screens). Contract: docs/api/student.md §3.5. */

export const useExamOverview = () =>
  useGetData<ExamOverviewResponse>('/api/student/exams/overview/', ['exams', 'overview'])

export const useExamSchedule = () =>
  useGetData<ExamScheduleResponse>('/api/student/exams/schedule/', ['exams', 'schedule'])

export const useUpcomingExams = () =>
  useGetData<UpcomingExamsResponse>('/api/student/exams/upcoming/', ['exams', 'upcoming'])

/** `card` is null when fees or attendance block issuance — render `blockedReason`. */
export const useAdmitCard = (termId?: string) =>
  useGetData<AdmitCardResponse>(
    `/api/student/exams/admit-card/${termId ? `?termId=${termId}` : ''}`,
    ['exams', 'admit-card', termId ?? 'current'],
  )

export const useExamResults = (termId?: string) =>
  useGetData<ExamResultsResponse>(
    `/api/student/exams/results/${termId ? `?termId=${termId}` : ''}`,
    ['exams', 'results', termId ?? 'latest'],
  )

export const useGradeReport = () =>
  useGetData<GradeReportResponse>('/api/student/exams/grade-report/', ['exams', 'grade-report'])

export const useRevaluation = () =>
  useGetData<RevaluationResponse>('/api/student/exams/revaluation/', ['exams', 'revaluation'])

const REVALUATION_KEY = ['exams', 'revaluation']

/**
 * Optimistic: the row appears as PENDING immediately.
 *
 * Safe to be optimistic here — a revaluation request either validates or
 * returns a field error, and the failure case is a removed row plus a toast.
 * The `tmp-` id blocks row actions until the server assigns a real one.
 */
export const useRequestRevaluation = () => {
  const patch = useOptimistic<RevaluationResponse, CreateRevaluationRequest>(
    REVALUATION_KEY,
    (prev, vars) => {
      const course = prev.eligibleCourses.find((c) => c.id === vars.courseId)
      const reviewType = prev.reviewTypes.find((r) => r.id === vars.reviewTypeId)
      if (!course || !reviewType) return prev
      const optimisticRow: RevaluationRequestRow = {
        id: `tmp-${crypto.randomUUID()}`,
        course,
        examType: prev.examTypes.find((e) => e.id === vars.examTypeId)?.label ?? '',
        reviewType: reviewType.label,
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
        fee: reviewType.fee,
        outcome: null,
      }
      return { ...prev, requests: [optimisticRow, ...prev.requests] }
    },
  )

  return usePostData<RevaluationRequestRow, CreateRevaluationRequest>(
    '/api/student/exams/revaluation/',
    REVALUATION_KEY,
    patch,
  )
}

export const useExamAttendanceSheet = () =>
  useGetData<ExamAttendanceResponse>('/api/student/exams/attendance/', ['exams', 'attendance'])

export const useExamAnalytics = () =>
  useGetData<ExamAnalyticsResponse>('/api/student/exams/analytics/', ['exams', 'analytics'])
