import { useFixture } from '@/lib/fixtures'

/** Certificates & Achievements — Figma 6:5438 / 6:1047. */
export const useCertificates = () =>
  useFixture<{
    certificates: { id: string; title: string; issuer: string; issued: string }[]
    streak: { days: string; note: string }
    notices: { title: string; body: string }[]
    printNote: string
  }>(['certificates'], {
    certificates: [
      { id: 'CERT-892014', title: 'Advanced Algorithms', issuer: 'Department of CSE', issued: 'Issued: 15 Jan 2026' },
      { id: 'CERT-772101', title: "Dean's Honor", issuer: 'UniGPT Academic Council', issued: 'Issued: 10 Dec 2025' },
      { id: 'CERT-102944', title: 'Python for Data Science', issuer: 'UniGPT Learning Hub', issued: 'Issued: 02 Feb 2026' },
      { id: 'CERT-445890', title: 'UI/UX Design', issuer: 'Faculty of Arts & Design', issued: 'Issued: 20 Dec 2025' },
    ],
    streak: { days: '12 Days', note: "You're in the top 5% this month!" },
    notices: [
      { title: 'Convocation 2026 Registration', body: 'Last date to apply is Oct 24th.' },
      { title: 'Holiday Notice', body: 'Campus closed on Friday for festival.' },
    ],
    printNote:
      'Order high-quality printed transcripts and degree certificates with secure digital verification links for employers worldwide.',
  })
