import { useState } from 'react'
import { useGetData, usePostData } from '@/hooks/use-api'
import { getAccessToken } from '@/lib/auth'
import type {
  AiAdvisorResponse,
  AiConversationResponse,
  AiMessage,
  AiOverviewResponse,
  AiStreamEvent,
  AssignmentHelperRequest,
  AssignmentHelperResponse,
  GenerateNoteRequest,
  GenerateQuizRequest,
  GeneratedNoteResponse,
  GeneratedQuizResponse,
  QuizGeneratorOptionsResponse,
  RecommendationsResponse,
  StudyPlanResponse,
  StudyPlannerOptionsResponse,
  StudyPlannerRequest,
} from '@/types'

/**
 * AI module data (8 screens). Contract: docs/api/student.md §3.7.
 *
 * Two shapes here. Read screens (overview, advisor, recommendations) are
 * plain GETs. Generator screens are options-GET + generate-POST, so no model
 * call happens until the student asks for one.
 */

export const useAiOverview = () =>
  useGetData<AiOverviewResponse>('/api/student/ai/overview/', ['ai', 'overview'])

export const useAdvisor = () =>
  useGetData<AiAdvisorResponse>('/api/student/ai/advisor/', ['ai', 'advisor'])

export const useRecommendations = () =>
  useGetData<RecommendationsResponse>('/api/student/ai/recommendations/', ['ai', 'recommendations'])

// ------------------------------------------------------------------- chat

export const useConversation = (id: string) =>
  useGetData<AiConversationResponse>(`/api/student/ai/conversations/${id}/`, ['ai', 'conversation', id])

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

/**
 * Streams one assistant reply over SSE.
 *
 * `apiFetch` cannot be reused: it calls `.json()` on the body, and this
 * endpoint returns `text/event-stream`. See docs/api/student.md §7.2.
 *
 * Returns the messages appended during this session — the student's own
 * message lands immediately, the reply fills in from `delta` frames.
 */
export function useAiStream(conversationId: string) {
  const [appended, setAppended] = useState<AiMessage[]>([])
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function send(text: string) {
    const mine: AiMessage = {
      id: `tmp-${crypto.randomUUID()}`,
      from: 'me',
      text,
      createdAt: new Date().toISOString(),
    }
    const replyId = `tmp-${crypto.randomUUID()}`
    setAppended((prev) => [
      ...prev,
      mine,
      { id: replyId, from: 'ai', text: '', createdAt: new Date().toISOString(), pending: true },
    ])
    setStreaming(true)
    setError(null)

    const patchReply = (fn: (m: AiMessage) => AiMessage) =>
      setAppended((prev) => prev.map((m) => (m.id === replyId ? fn(m) : m)))

    try {
      const res = await fetch(
        `${BASE_URL}/api/student/ai/conversations/${conversationId}/messages/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}),
          },
          body: JSON.stringify({ text }),
        },
      )
      if (!res.ok || !res.body) throw new Error(`Stream failed with ${res.status}`)

      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
      let buffer = ''

      for (;;) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += value

        // Frames are `data: {...}\n\n`; the tail may be a partial frame.
        const frames = buffer.split('\n\n')
        buffer = frames.pop() ?? ''

        for (const frame of frames) {
          if (!frame.startsWith('data: ')) continue
          const event = JSON.parse(frame.slice(6)) as AiStreamEvent
          if (event.type === 'delta') {
            patchReply((m) => ({ ...m, text: m.text + event.text }))
          } else if (event.type === 'done') {
            patchReply((m) => ({ ...m, id: event.messageId, pending: false }))
          } else {
            setError(event.message)
          }
        }
      }
      patchReply((m) => ({ ...m, pending: false }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The assistant is unavailable.')
      // Drop the empty placeholder — a blank bubble reads as a broken reply.
      setAppended((prev) => prev.filter((m) => m.id !== replyId))
    } finally {
      setStreaming(false)
    }
  }

  return { appended, streaming, error, send }
}

// --------------------------------------------------------------- generators

export const useStudyPlannerOptions = () =>
  useGetData<StudyPlannerOptionsResponse>('/api/student/ai/study-planner/options/', [
    'ai',
    'study-planner',
    'options',
  ])

export const useGenerateStudyPlan = () =>
  usePostData<StudyPlanResponse, StudyPlannerRequest>('/api/student/ai/study-planner/', [
    'ai',
    'study-planner',
  ])

export const useGenerateNote = () =>
  usePostData<GeneratedNoteResponse, GenerateNoteRequest>('/api/student/ai/notes/', ['ai', 'notes'])

export const useQuizGeneratorOptions = () =>
  useGetData<QuizGeneratorOptionsResponse>('/api/student/ai/quiz/options/', ['ai', 'quiz', 'options'])

export const useGenerateQuiz = () =>
  usePostData<GeneratedQuizResponse, GenerateQuizRequest>('/api/student/ai/quiz/', ['ai', 'quiz'])

export const useAssignmentHelper = () =>
  usePostData<AssignmentHelperResponse, AssignmentHelperRequest>(
    '/api/student/ai/assignment-helper/',
    ['ai', 'assignment-helper'],
  )
