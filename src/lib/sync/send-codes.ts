import { STRINGS } from '../../strings'
import type { Refusal, SendFailure } from './refusal'

type CodeOutcome =
  'dropped' | 'outOfSpace' | 'newerFirmware' | 'carRefused' | 'layoutRefused' | 'retry'

export const SEND_CODE_OUTCOMES: Record<string, CodeOutcome> = {
  connection_closed: 'dropped',
  disconnected: 'dropped',
  ack_timeout: 'dropped',
  not_connected: 'dropped',
  send_failed: 'dropped',
  read_error: 'dropped',
  unreachable: 'dropped',
  too_large: 'outOfSpace',
  blob_too_large: 'outOfSpace',
  no_memory: 'outOfSpace',
  oom: 'outOfSpace',
  write_failed: 'outOfSpace',
  line_too_long: 'outOfSpace',
  unknown_command: 'newerFirmware',
  invalid_config: 'retry',
  empty_config: 'retry',
  chunk_rejected: 'retry',
  bad_args: 'retry',
  b64_decode: 'retry',
  out_of_sequence: 'retry',
  open_failed: 'retry',
  busy: 'retry',
  queue_full: 'retry',
  parse_error: 'retry',
  read_failed: 'retry',
  status_too_long: 'retry',
  config_not_found: 'retry',
  missing_payload: 'retry',
  missing_device_config: 'retry',
  invalid_device_config: 'retry',
  invalid_sound_settings: 'retry',
  device_error: 'retry',
  unknown_error: 'retry',
  mismatch: 'retry',
  exception: 'retry',
  invalid_signals: 'carRefused',
  config_refused: 'layoutRefused',
}

type Refused = Exclude<CodeOutcome, 'dropped'>

const REASONS: Record<Refused, Refusal> = {
  outOfSpace: {
    where: STRINGS.changes.gaugesWhere,
    text: STRINGS.refused.outOfSpace,
    target: null,
    section: 'gauges',
  },
  newerFirmware: {
    where: STRINGS.changes.dashWhere,
    text: STRINGS.refused.newerFirmware,
    target: null,
    section: 'dash',
  },
  carRefused: {
    where: STRINGS.changes.carWhere,
    text: STRINGS.refused.carSettings,
    target: null,
    section: 'car',
  },
  layoutRefused: {
    where: STRINGS.changes.gaugesWhere,
    text: STRINGS.refused.layout,
    target: null,
    section: 'gauges',
  },
  retry: {
    where: STRINGS.changes.dashWhere,
    text: STRINGS.refused.fallback,
    target: null,
    section: 'dash',
  },
}

export const failureForCode = (code: string): SendFailure => {
  const outcome = SEND_CODE_OUTCOMES[code.toLowerCase()] ?? 'retry'
  if (outcome === 'dropped') return { kind: 'dropped' }
  return { kind: 'refused', reasons: [REASONS[outcome]] }
}
