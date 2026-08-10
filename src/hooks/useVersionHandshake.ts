import { useEffect } from 'react'
import { useDeviceStore } from '../stores/device.store'
import { useLogStore } from '../stores/log.store'
import { usbService } from '../transport'
import { transportErrorText } from '../transport/humanize-transport-error'

export const useVersionHandshake = (): void => {
  const connected = useDeviceStore((s) => s.connected)
  const transport = useDeviceStore((s) => s.transport)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const setFirmwareVersion = useDeviceStore((s) => s.setFirmwareVersion)
  const setBoardId = useDeviceStore((s) => s.setBoardId)
  const setFirmwareCompat = useDeviceStore((s) => s.setFirmwareCompat)
  const setIsDayMode = useDeviceStore((s) => s.setIsDayMode)
  const log = useLogStore((s) => s.push)

  useEffect(() => {
    if (!connected || simulationMode || transport !== 'usb') return
    let cancelled = false
    void usbService.queryVersion().then((result) => {
      if (cancelled) return
      if (result.kind === 'error') {
        log('warn', `Version handshake failed: ${transportErrorText(result.error)}`)
        setFirmwareCompat({ kind: 'unknown' })
        return
      }
      const { version, protocol, isDay, boardId } = result.identity
      setFirmwareVersion(version)
      setBoardId(boardId ?? null)
      setIsDayMode(isDay)
      const reportedMajor = Number(version.split('.')[0] ?? 0)
      if (reportedMajor !== __EXPECTED_FIRMWARE_MAJOR__) {
        log(
          'error',
          `Firmware major mismatch — tuner expects ${String(__EXPECTED_FIRMWARE_MAJOR__)}.x, device reports ${version}. Burn disabled.`
        )
        setFirmwareCompat({
          kind: 'mismatch',
          expected: __EXPECTED_FIRMWARE_MAJOR__,
          got: reportedMajor,
          version,
        })
        return
      }
      setFirmwareCompat({ kind: 'compatible', protocol })
      log('success', `Connected to firmware v${version} (proto ${String(protocol)})`)
    })
    return () => {
      cancelled = true
    }
  }, [
    connected,
    simulationMode,
    transport,
    setFirmwareVersion,
    setBoardId,
    setFirmwareCompat,
    setIsDayMode,
    log,
  ])
}
