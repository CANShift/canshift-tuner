import { STRINGS } from '../../strings'

const F = STRINGS.firmware

export interface FirmwareFailure {
  cause: string
  advice: string
}

type FailureKind = 'signature' | 'dropped' | 'otherDash'

const CODE_KINDS: Record<string, FailureKind> = {
  ota_bad_signature: 'signature',
  ota_unsigned: 'signature',
  connection_closed: 'dropped',
  disconnected: 'dropped',
  ack_timeout: 'dropped',
  not_connected: 'dropped',
  send_failed: 'dropped',
  size_out_of_range: 'otherDash',
  not_app_image: 'otherDash',
}

const OTHER_DASH_DETAIL = '0x1503'

const FAILURES: Record<FailureKind, (version: string) => FirmwareFailure> = {
  signature: (version) => ({ cause: F.signatureMismatch(version), advice: F.signatureAdvice }),
  dropped: (version) => ({ cause: F.wifiDropped, advice: F.stillRuns(version) }),
  otherDash: (version) => ({ cause: F.otherDashGeneric, advice: F.stillRuns(version) }),
}

const kindOf = (code: string, detail: string | undefined): FailureKind | undefined =>
  detail?.toLowerCase() === OTHER_DASH_DETAIL ? 'otherDash' : CODE_KINDS[code]

export const firmwareFailure = (
  code: string,
  detail: string | undefined,
  message: string,
  runningVersion: string
): FirmwareFailure => {
  const kind = kindOf(code, detail)
  if (kind !== undefined) return FAILURES[kind](runningVersion)
  return { cause: message, advice: F.stillRuns(runningVersion) }
}
