import type { FirmwareCompat } from '../stores/device.store'
import type { FirmwareIdentity } from '../transport/types'
import type { LogLevel } from '../stores/log.store'

export interface HandshakeVerdict {
  compat: FirmwareCompat
  level: LogLevel
  message: string
}

const majorOf = (version: string): number => Number(version.split('.')[0] ?? 0)

export const handshakeVerdict = (
  identity: FirmwareIdentity,
  expectedMajor: number
): HandshakeVerdict => {
  const { version, protocol } = identity
  const got = majorOf(version)
  if (got === expectedMajor) {
    return {
      compat: { kind: 'compatible', protocol },
      level: 'success',
      message: `Connected to firmware v${version} (proto ${String(protocol)})`,
    }
  }
  return {
    compat: { kind: 'mismatch', expected: expectedMajor, got, version },
    level: 'error',
    message: `Firmware major mismatch — tuner expects ${String(expectedMajor)}.x, device reports ${version}. Burn disabled.`,
  }
}
