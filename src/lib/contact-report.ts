import type { FeedbackContext, FeedbackKind } from './feedback'

const KIND_LABELS: Record<FeedbackKind, string> = {
  bug: 'Bug report',
  'ecu-request': 'ECU profile request',
  info: 'Question',
}

const CONTEXT_LABELS: Record<keyof FeedbackContext, string> = {
  appVersion: 'Tuner',
  firmwareVersion: 'Firmware',
  boardModel: 'Board',
  platform: 'Platform',
  ecuProfile: 'ECU profile',
  busRate: 'Bus rate',
  pageCount: 'Pages',
  widgetCount: 'Widgets',
  simulation: 'Simulation',
}

const CONTEXT_ORDER = Object.keys(CONTEXT_LABELS) as (keyof FeedbackContext)[]

export interface ContactReportInput {
  kind: FeedbackKind
  email: string
  message: string
  context: FeedbackContext | null
  configJson: string | null
}

const contextLines = (context: FeedbackContext | null): string[] => {
  if (context === null) return ['(removed by the reporter)']
  return CONTEXT_ORDER.flatMap((key) => {
    const value = context[key]
    if (value === undefined) return []
    return [`${CONTEXT_LABELS[key]}: ${String(value)}`]
  })
}

export const buildContactReport = (input: ContactReportInput): string =>
  [
    `CANShift Tuner — ${KIND_LABELS[input.kind]}`,
    `Reply to: ${input.email.trim().length > 0 ? input.email.trim() : '(none given)'}`,
    '',
    'CONTEXT',
    ...contextLines(input.context),
    '',
    'MESSAGE',
    input.message.trim().length > 0 ? input.message.trim() : '(empty)',
    '',
    'CONFIG',
    input.configJson ?? '(not attached)',
    '',
  ].join('\n')

export const CONTACT_REPORT_FILENAME = 'canshift-report.txt'
