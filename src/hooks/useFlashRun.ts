import { useEffect, useRef, useState } from 'react'
import type { ReleaseAsset, ReleaseInfo } from '@canshift/core'
import { useFirmwareSelectionStore } from '../stores/firmware-selection.store'
import { useFlashHistoryStore } from '../stores/flash-history.store'
import { useLogStore } from '../stores/log.store'
import { useFlasher } from './useFlasher'
import { downloadFirmwareAsset } from '../lib/firmware/download'
import { formatBytes } from '../lib/format'
import { errorMessage } from '../lib/error-message'

export interface FlashRunInputs {
  release: ReleaseInfo | null
  asset: ReleaseAsset | null
  sha256: string | null
  chip: string | null
}

export interface FlashRun {
  busy: boolean
  label: string
  downloadError: string | null
  start: () => void
  reset: () => void
}

const PERCENT = 100

export const useFlashRun = ({ release, asset, sha256, chip }: FlashRunInputs): FlashRun => {
  const selection = useFirmwareSelectionStore((s) => s.selection)
  const setReleaseFirmware = useFirmwareSelectionStore((s) => s.setReleaseFirmware)
  const record = useFlashHistoryStore((s) => s.record)
  const log = useLogStore((s) => s.push)
  const flasher = useFlasher()
  const [downloadPercent, setDownloadPercent] = useState<number | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const alreadyDownloaded =
    selection.kind === 'release' && release !== null && selection.release.tag === release.tag

  const flashedTag = useRef<string | null>(null)
  const lastKind = useRef(flasher.state.kind)
  useEffect(() => {
    const kind = flasher.state.kind
    if (kind === lastKind.current) return
    lastKind.current = kind
    if (kind !== 'success' && kind !== 'error') return
    record(flashedTag.current ?? 'firmware', kind === 'success')
  }, [flasher.state.kind, record])

  const run = async (): Promise<void> => {
    if (!release || !asset) return
    setDownloadError(null)
    if (!alreadyDownloaded) {
      setDownloadPercent(0)
      log('info', `Downloading ${asset.name} (${formatBytes(asset.sizeBytes)})`)
      const firmware = await downloadFirmwareAsset(
        asset,
        (loaded, total) => {
          setDownloadPercent(total > 0 ? (loaded / total) * PERCENT : 0)
        },
        sha256
      )
      setReleaseFirmware(release, firmware)
      setDownloadPercent(null)
    }
    flashedTag.current = release.tag
    flasher.flash(chip ?? undefined)
  }

  const start = () => {
    void run().catch((err: unknown) => {
      const message = errorMessage(err)
      setDownloadPercent(null)
      setDownloadError(message)
      log('error', `Could not fetch the firmware — ${message}`)
    })
  }

  const label =
    downloadPercent === null
      ? `FLASH ${release?.version ?? ''}`.trim()
      : `DOWNLOADING… ${downloadPercent.toFixed(0)}%`

  return {
    busy: downloadPercent !== null || flasher.state.kind === 'flashing',
    label,
    downloadError,
    start,
    reset: flasher.reset,
  }
}
