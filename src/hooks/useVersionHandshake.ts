import { useEffect } from 'react'
import { useDeviceStore } from '../stores/device.store'
import { useLogStore } from '../stores/log.store'
import { usbService } from '../transport'
import type { FirmwareIdentityResult } from '../transport/types'
import { transportErrorText } from '../transport/humanize-transport-error'
import { errorMessage } from '../lib/error-message'
import { handshakeVerdict } from '../lib/firmware-handshake'
import { useLiveTransport } from './useLiveTransport'

const handshakeFailed = (reason: string) => {
  useLogStore.getState().push('warn', `Version handshake failed: ${reason}`)
  useDeviceStore.getState().setFirmwareCompat({ kind: 'unknown' })
}

const applyIdentity = (result: FirmwareIdentityResult) => {
  if (result.kind === 'error') {
    handshakeFailed(transportErrorText(result.error))
    return
  }
  const device = useDeviceStore.getState()
  const { version, isDay, boardId } = result.identity
  device.setFirmwareVersion(version)
  device.setBoardId(boardId ?? null)
  device.setIsDayMode(isDay)
  const verdict = handshakeVerdict(result.identity, __EXPECTED_FIRMWARE_MAJOR__)
  useLogStore.getState().push(verdict.level, verdict.message)
  device.setFirmwareCompat(verdict.compat)
}

const runHandshake = (): (() => void) => {
  let cancelled = false
  usbService
    .queryVersion()
    .then((result) => {
      if (!cancelled) applyIdentity(result)
    })
    .catch((err: unknown) => {
      if (!cancelled) handshakeFailed(errorMessage(err))
    })
  return () => {
    cancelled = true
  }
}

export const useVersionHandshake = (): void => {
  const transport = useLiveTransport()

  useEffect(() => {
    if (transport === null) return
    return runHandshake()
  }, [transport])
}
