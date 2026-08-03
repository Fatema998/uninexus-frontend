import { useFixture } from '@/lib/fixtures'
import type { MetricTone } from '@/components/patterns/metric-card'

/**
 * Admin operations data — System Health, Settings, Support.
 *
 * No Figma frames exist for these three (they are sidebar entries only), so
 * the screens are composed from existing tokens and the health vocabulary
 * that IS designed: the LMS/DB/API service tiles on the executive dashboard
 * and "All API nodes responsive" from the Admin Master Workspace (7:16795).
 * Replace wholesale if designs arrive.
 */

export type ServiceState = 'OPERATIONAL' | 'DEGRADED' | 'DOWN'

export const useSystemHealth = () =>
  useFixture<{
    overall: { state: ServiceState; note: string }
    metrics: { label: string; value: string; tone: MetricTone }[]
    services: { name: string; state: ServiceState; uptime: string; latency: string }[]
    incidents: { title: string; when: string; resolved: boolean }[]
  }>(['admin', 'health'], {
    overall: { state: 'OPERATIONAL', note: 'All API nodes responsive' },
    metrics: [
      { label: 'Uptime (30d)', value: '99.98%', tone: 'success' },
      { label: 'Avg Response', value: '142ms', tone: 'brand' },
      { label: 'Active Sessions', value: '1,284', tone: 'info' },
      { label: 'Open Incidents', value: '01', tone: 'warning' },
    ],
    services: [
      { name: 'LMS', state: 'OPERATIONAL', uptime: '99.99%', latency: '118ms' },
      { name: 'Database', state: 'OPERATIONAL', uptime: '99.98%', latency: '24ms' },
      { name: 'API Gateway', state: 'OPERATIONAL', uptime: '99.97%', latency: '142ms' },
      { name: 'Payment Gateway', state: 'DEGRADED', uptime: '98.42%', latency: '612ms' },
      { name: 'Notification Service', state: 'OPERATIONAL', uptime: '99.95%', latency: '88ms' },
      { name: 'AI Assistant', state: 'OPERATIONAL', uptime: '99.90%', latency: '340ms' },
    ],
    incidents: [
      { title: 'Payment gateway latency above threshold', when: 'Started 42 minutes ago', resolved: false },
      { title: 'Scheduled database maintenance', when: 'Completed 2 days ago', resolved: true },
      { title: 'LMS file upload failures', when: 'Resolved 6 days ago', resolved: true },
    ],
  })

export const useAdminSettings = () =>
  useFixture<{
    institution: { label: string; value: string }[]
    term: { label: string; value: string }[]
    toggles: { key: string; label: string; note: string; on: boolean }[]
  }>(['admin', 'settings'], {
    institution: [
      { label: 'Institution Name', value: 'UniGPT University' },
      { label: 'Short Code', value: 'UNIGPT' },
      { label: 'Primary Contact', value: 'registry@unigpt.edu' },
      { label: 'Timezone', value: 'Asia/Dhaka (GMT+6)' },
    ],
    term: [
      { label: 'Active Semester', value: 'Spring 2026' },
      { label: 'Term Starts', value: '12 January 2026' },
      { label: 'Term Ends', value: '30 May 2026' },
      { label: 'Full-time Credit Minimum', value: '12' },
    ],
    toggles: [
      { key: 'registration', label: 'Course registration open', note: 'Students can add or drop courses.', on: true },
      { key: 'results', label: 'Publish results to students', note: 'Newly approved results become visible immediately.', on: true },
      { key: 'payments', label: 'Online payments enabled', note: 'Disable during gateway maintenance.', on: false },
      { key: 'ai', label: 'AI assistant enabled', note: 'Turns the assistant off across every persona.', on: true },
    ],
  })

export const useSupport = () =>
  useFixture<{
    channels: { label: string; value: string; note: string }[]
    tickets: { id: string; subject: string; from: string; status: 'OPEN' | 'PENDING' | 'CLOSED'; when: string }[]
    topics: string[]
  }>(['admin', 'support'], {
    channels: [
      { label: 'Email', value: 'support@unigpt.edu', note: 'Response within 1 business day' },
      { label: 'Phone', value: '+880 9600 123456', note: 'Sun–Thu, 09:00–17:00' },
      { label: 'Emergency', value: 'ops@unigpt.edu', note: 'Platform outages only' },
    ],
    tickets: [
      { id: 'TCK-4412', subject: 'Payment gateway timeout on bulk fee collection', from: 'Finance Office', status: 'OPEN', when: '38 minutes ago' },
      { id: 'TCK-4408', subject: 'Faculty unable to publish CSE-402 results', from: 'Dr. Hasan Mahmud', status: 'PENDING', when: '3 hours ago' },
      { id: 'TCK-4390', subject: 'Bulk user import failed for 12 records', from: 'Registry', status: 'CLOSED', when: '2 days ago' },
    ],
    topics: [
      'Reset a user password',
      'Restore a deleted course',
      'Correct a published result',
      'Refund a duplicate payment',
    ],
  })
