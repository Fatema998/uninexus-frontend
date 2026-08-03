import { useFixture } from '@/lib/fixtures'
import type { MetricTone } from '@/components/patterns/metric-card'

/**
 * AI module data (Phase 4.6 — 8 screens).
 *
 * The AI backing is unresolved (docs/prd.md §6.8). Every screen here renders
 * against fixtures and a mock "generate" that echoes canned output, so the UI
 * is complete and the model choice stays a one-file swap.
 */

export const useAiOverview = () =>
  useFixture<{
    metrics: { label: string; value: string; tone: MetricTone }[]
    recent: { title: string; snippet: string }[]
    actions: { label: string; note: string }[]
    trainingStatus: string
  }>(['ai', 'overview'], {
    metrics: [
      { label: 'Conversations', value: '48', tone: 'brand' },
      { label: 'Study Plans', value: '06', tone: 'accent' },
      { label: 'Notes', value: '23', tone: 'info' },
      { label: 'Assignments', value: '12', tone: 'warning' },
      { label: 'Quizzes', value: '19', tone: 'success' },
      { label: 'Learning Score', value: '86', tone: 'brand' },
    ],
    recent: [
      { title: 'Explaining time complexity…', snippet: 'O(log n) vs O(n)' },
      { title: 'Review of IS-LM model and…', snippet: 'Macroeconomics' },
      { title: 'Synthesizing Benzene rings', snippet: 'Organic chemistry' },
      { title: "Summarize Kant's…", snippet: 'Philosophy' },
    ],
    actions: [
      { label: 'Explain Topic', note: 'Break down complex theories simply.' },
      { label: 'Summarize PDF', note: 'Key insights from research papers.' },
      { label: 'Grammar Check', note: 'Academic tone and syntax review.' },
      { label: 'Translate Text', note: 'Multi-language support for docs.' },
      { label: 'Create Outline', note: 'Generate structures for essays.' },
      { label: 'Code Debug', note: 'Find errors in your programming tasks.' },
      { label: 'Citations Gen', note: 'APA, MLA, Chicago format support.' },
      { label: 'Math Solver', note: 'Step-by-step calculus help.' },
      { label: 'Voice Tutor', note: 'Real-time voice conversation mode.' },
    ],
    trainingStatus: 'Your assistant is synced with current course syllabus updates.',
  })

export const useAiChat = () =>
  useFixture<{
    greeting: string
    intro: string
    messages: { from: 'ai' | 'me'; text: string }[]
    deadlines: { title: string; due: string }[]
  }>(['ai', 'chat'], {
    greeting: 'Good morning',
    intro:
      "Ready to refine the upcoming \"Algorithm Analysis\" module. I've pre-indexed the latest slides on Computational Complexity.",
    messages: [
      {
        from: 'me',
        text: 'Can you explain the average case complexity of Quicksort and why it remains O(n log n)? Also, show me a Python implementation with a random pivot to avoid worst-case scenarios.',
      },
      {
        from: 'ai',
        text: "Quicksort's performance is highly dependent on the choice of the pivot. In the average case, the partition splits the array into two parts that are relatively balanced.",
      },
      {
        from: 'ai',
        text: 'Even with an unbalanced split like 9:1, the complexity still results in O(n log n), just with a larger constant factor.',
      },
    ],
    deadlines: [
      { title: 'Data Structures Lab', due: 'Due in 4 hours' },
      { title: 'DBMS Query Set', due: 'Due in 2 days' },
    ],
  })

export const useStudyPlanner = () =>
  useFixture<{
    exams: string[]
    grades: string[]
    goals: string[]
    nextExam: string
    days: { day: string; topic: string; blocks: { time: string; length: string; note: string }[] }[]
  }>(['ai', 'study-planner'], {
    exams: ['CSE 301 Midterm', 'CSE 305 Final', 'MAT 202 Quiz'],
    grades: ['A+', 'A', 'B+'],
    goals: ['2 Hrs', '3 Hrs', '4 Hrs'],
    nextExam: 'In 5 Days • Oct 31, 2023',
    days: [
      {
        day: 'Monday',
        topic: 'Algorithms & Complexity Basics',
        blocks: [
          { time: '09:00 AM', length: '60 mins', note: 'Quick recap of recursive structures and memoization techniques from last session. Focused deep-work.' },
        ],
      },
      { day: 'Tuesday', topic: 'Data Structures Recap', blocks: [] },
      {
        day: 'Wednesday (Today)',
        topic: 'Dynamic Programming Mastery',
        blocks: [
          { time: '10:30 AM', length: '90 mins', note: 'Implementing classic DP problems in Python. Focus on space complexity optimization.' },
          { time: '12:00 PM', length: '—', note: 'Join the CSE 301 Study Hub voice channel to discuss common mistakes in previous quizzes.' },
          { time: '02:00 PM', length: '30 mins', note: 'Rapid fire review of Big O notation and P vs NP classifications.' },
        ],
      },
      { day: 'Thursday', topic: 'Greedy Algorithms & Graphs', blocks: [] },
      { day: 'Friday', topic: 'Mock Midterm Practice', blocks: [] },
    ],
  })

export const useNoteGenerator = () =>
  useFixture<{
    title: string
    toc: string[]
    intro: string
    facts: { formula: string; note: string }[]
    recent: string[]
  }>(['ai', 'notes'], {
    title: 'Quantum Mechanics: Module 04',
    toc: ['Wave-particle duality', 'The de Broglie relation', 'Schrödinger equation', 'Wave function'],
    intro:
      'Quantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles. It is the foundation of all quantum physics including quantum chemistry, quantum field theory, and quantum technology.',
    facts: [
      { formula: 'λ = h / p', note: 'de Broglie wavelength equation relating wavelength (λ) to momentum (p).' },
      { formula: 'ĤΨ = EΨ', note: "The solution to this equation provides the Wave Function (Ψ), which contains all possible information about the system's state." },
    ],
    recent: ['Organic Chemistry: Benzene', 'Macroeconomics: IS-LM', 'Linear Algebra: Eigenvalues'],
  })

export const useQuizGenerator = () =>
  useFixture<{
    courses: string[]
    counts: string[]
    types: string[]
    difficulties: string[]
    sample: { prompt: string; options: string[]; answer: number }
    focus: { course: string; streak: string }
    insight: string
  }>(['ai', 'quiz'], {
    courses: ['Database Systems', 'Data Structures', 'Artificial Intelligence'],
    counts: ['5', '10', '20'],
    types: ['Multiple Choice', 'True / False', 'Short Answer'],
    difficulties: ['Easy', 'Medium', 'Hard'],
    sample: {
      prompt:
        'In the context of SQL Normalization, which normal form specifically addresses the issue of "transitive dependencies" by ensuring all non-key attributes are dependent solely on the primary key?',
      options: ['1NF', '2NF', '3NF', 'BCNF'],
      answer: 2,
    },
    focus: { course: 'Database Systems', streak: '3 days strong! Keep it up.' },
    insight:
      'Normalization is key to database integrity. You usually struggle with 3NF. Focus there.',
  })

export const useAssignmentHelper = () =>
  useFixture<{
    outline: string[]
    draft: string
    suggestions: { text: string; kind: 'STYLE' | 'CITATION' }[]
  }>(['ai', 'assignment-helper'], {
    outline: ['1. Introduction to Indexing Mechanisms', '2. B-Tree vs. Hash Indexing'],
    draft:
      'The efficacy of an index depends heavily on the selectivity of the column. Low selectivity columns, such as boolean flags, often perform poorly when indexed because the database optimizer might still choose a full table scan over an index seek.',
    suggestions: [
      { text: 'This sentence is complex. AI suggests breaking it into two for better technical flow.', kind: 'STYLE' },
      { text: 'Add a reference for the B-Tree time complexity (O(log n)).', kind: 'CITATION' },
    ],
  })

export const useAdvisor = () =>
  useFixture<{
    gpa: { current: string; target: string; percent: number }
    alerts: { title: string; body: string }[]
    stats: { label: string; value: string }[]
    plan: { title: string; body: string }[]
    insight: string
  }>(['ai', 'advisor'], {
    gpa: { current: '3.72', target: '3.80', percent: 92 },
    alerts: [
      {
        title: 'Discrete Math Alert',
        body: "Your performance in 'Set Theory' quizzes is 15% below the class average. This component weighs 30% of the midterm.",
      },
    ],
    stats: [
      { label: 'Peer Benchmark', value: 'Lower 25th Percentile' },
      { label: 'Submission Rate', value: '100% (On Time)' },
    ],
    plan: [
      { title: 'Midterm Prep: CS301', body: "Focus on 'Combinatorics' and 'Probability'. Attend Prof. Zhang's office hours tomorrow at 2PM." },
      { title: 'Python Algorithm Refactoring', body: 'Your last lab had O(N²) complexity. Review O(Log N) optimization techniques in Module 4.' },
      { title: 'Internship Readiness', body: "Maintain current GPA trend to qualify for the 'FAANG Prep' cohort in Spring." },
    ],
    insight:
      "Alex, you're only 4 graded assignments away from securing your target 3.80. Focus on Discrete Math tonight to bridge the gap.",
  })

export const useRecommendations = () =>
  useFixture<{
    track: string
    primary: { name: string; match: string; credits: number; why: string }[]
    others: { name: string; match: string; credits: number }[]
    futureReady: string
    advice: string
  }>(['ai', 'recommendations'], {
    track: 'AI Track',
    primary: [
      {
        name: 'Advanced Machine Learning',
        match: '96% Match',
        credits: 4,
        why: 'Matches your top-decile performance in Probability Theory and your career interest in Neural Networks. This is a foundational pillar for your AI Track.',
      },
      {
        name: 'Distributed Systems for ML',
        match: '91% Match',
        credits: 3,
        why: 'Highly recommended for scaling AI models. Your previous project work in Docker and Kubernetes shows readiness for this advanced curriculum.',
      },
    ],
    others: [
      { name: 'Data Visualization', match: '88% Match', credits: 3 },
      { name: 'Python for High Performance', match: '84% Match', credits: 2 },
    ],
    futureReady:
      'With these recommended AI and Data courses, you are on track to exceed industry standards for Machine Learning Engineer roles by 2027.',
    advice:
      'Based on your 94% score in Linear Algebra, you have a high aptitude for Machine Learning advanced modules.',
  })
