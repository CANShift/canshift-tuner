import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import type { ReleaseAsset, ReleaseInfo } from '@canshift/core'
import type { FirmwareSelection } from '../../stores/firmware-selection.store'
import { useFirmwareSelectionStore } from '../../stores/firmware-selection.store'
import { useFlashHistoryStore } from '../../stores/flash-history.store'
import { useFlasher } from '../../hooks/useFlasher'
import type { FlasherState } from '../../hooks/useFlasher'
import { useLogStore } from '../../stores/log.store'
import { downloadFirmwareAsset } from '../../lib/firmware/download'
import { formatBytes } from '../../lib/format'
import { errorMessage } from '../../lib/error-message'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { MetaText } from '../ui/meta-text'

export interface FlashActionsProps {
  selection: FirmwareSelection
  pickedRelease: ReleaseInfo | null
  mergedAsset: ReleaseAsset | null
  expectedChip?: string
  mergedSha256?: string | null
}

const SELECTION_LABELS: Record<FirmwareSelection['kind'], (s: FirmwareSelection) => string> = {
  release: (s) => (s.kind === 'release' ? s.release.tag : 'firmware'),
  local: (s) => (s.kind === 'local' ? s.firmware.name : 'firmware'),
  none: () => 'firmware',
}

const selectionLabel = (selection: FirmwareSelection): string =>
  SELECTION_LABELS[selection.kind](selection)

const flashPct = (state: FlasherState): number =>
  state.kind === 'flashing' && state.total > 0
    ? Math.min(100, (state.written / state.total) * 100)
    : 0

const RESETTABLE_KINDS: ReadonlySet<FlasherState['kind']> = new Set(['success', 'error'])

const FLASH_STATUS_CARDS: Record<FlasherState['kind'], (state: FlasherState) => ReactNode> = {
  idle: () => null,
  flashing: (state) => (
    <div className={PROGRESS_TRACK}>
      {/* eslint-disable-next-line no-inline-style/no-inline-style */}
      <div className={PROGRESS_FILL} style={{ width: `${flashPct(state).toFixed(1)}%` }} />
    </div>
  ),
  success: () => (
    <div className={cn(CARD, 'border-success')}>
      Flash complete. Unplug the dash from USB and plug it back in to boot the new firmware — the
      flasher's automatic reset is unreliable on this board.
    </div>
  ),
  error: (state) =>
    state.kind !== 'error' ? null : (
      <div className={cn(CARD, ERROR_CARD)}>
        Flash failed — {state.message}. Most common cause: BOOT was not held long enough. Press and
        hold BOOT, then retry.
      </div>
    ),
}

const useFlashHistoryRecorder = (
  state: FlasherState,
  flashedLabel: { current: string | null }
): void => {
  const record = useFlashHistoryStore((s) => s.record)
  const prevKind = useRef(state.kind)
  useEffect(() => {
    if (prevKind.current !== state.kind) {
      const label = flashedLabel.current ?? 'firmware'
      if (state.kind === 'success') record(label, true)
      if (state.kind === 'error') record(label, false)
      prevKind.current = state.kind
    }
  }, [state, flashedLabel, record])
}

export const FlashActions = ({
  selection,
  pickedRelease,
  mergedAsset,
  expectedChip,
  mergedSha256,
}: FlashActionsProps) => {
  const setReleaseFirmware = useFirmwareSelectionStore((s) => s.setReleaseFirmware)
  const log = useLogStore((s) => s.push)
  const { state, canFlash, flash, reset } = useFlasher()
  const flashedLabelRef = useRef<string | null>(null)
  useFlashHistoryRecorder(state, flashedLabelRef)

  const handleFlash = () => {
    flashedLabelRef.current = selectionLabel(selection)
    flash(expectedChip)
  }

  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [loadedBytes, setLoadedBytes] = useState(0)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const pickedAsset = mergedAsset
  const pickedIsDownloaded =
    selection.kind === 'release' &&
    pickedRelease !== null &&
    selection.release.tag === pickedRelease.tag
  const needsDownload = pickedRelease !== null && !pickedIsDownloaded

  const runDownload = async (release: ReleaseInfo, asset: ReleaseAsset): Promise<void> => {
    setDownloading(true)
    setProgress(0)
    setLoadedBytes(0)
    setDownloadError(null)
    log('info', `Downloading ${asset.name} (${formatBytes(asset.sizeBytes)})`)
    try {
      const firmware = await downloadFirmwareAsset(
        asset,
        (loaded, total) => {
          setLoadedBytes(loaded)
          setProgress(total > 0 ? loaded / total : 0)
        },
        mergedSha256
      )
      setReleaseFirmware(release, firmware)
      log(
        'success',
        `Downloaded ${asset.name} (${formatBytes(firmware.size)}, sha256 ${firmware.sha256.slice(0, 12)}…)`
      )
    } catch (err: unknown) {
      const message = errorMessage(err)
      setDownloadError(message)
      log('error', `Download failed for ${asset.name}: ${message}`)
    } finally {
      setDownloading(false)
      setProgress(0)
      setLoadedBytes(0)
    }
  }

  const handleDownload = () => {
    if (!pickedRelease || !pickedAsset) return
    void runDownload(pickedRelease, pickedAsset)
  }

  const flashing = state.kind === 'flashing'

  const burnLabel = flashing
    ? `FLASHING… ${String(Math.round(flashPct(state)))}%`
    : `BURN ${selectionLabel(selection).toUpperCase()}`

  return (
    <div className="flex flex-col gap-3.5 px-6 py-5">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!canFlash || flashing}
          onClick={handleFlash}
          className={cn(
            'shell-burn-button',
            flashButton({ tone: 'burn', disabled: !canFlash || flashing })
          )}
        >
          {burnLabel}
        </button>
        {needsDownload && (
          <button
            type="button"
            disabled={downloading || pickedAsset === null}
            onClick={handleDownload}
            className={cn(
              'shell-link-button',
              flashButton({ tone: 'secondary', disabled: downloading || pickedAsset === null })
            )}
          >
            {downloading ? 'DOWNLOADING…' : 'DOWNLOAD .BIN'}
          </button>
        )}
        {RESETTABLE_KINDS.has(state.kind) && (
          <button
            type="button"
            onClick={reset}
            className={cn('shell-link-button', flashButton({ tone: 'secondary', disabled: false }))}
          >
            RESET
          </button>
        )}
        <MetaText align="end">≈ 30 s · do not unplug</MetaText>
      </div>

      {downloading && pickedAsset && (
        <div className="flex flex-col gap-1">
          <div className={PROGRESS_TRACK}>
            {/* eslint-disable-next-line no-inline-style/no-inline-style */}
            <div className={PROGRESS_FILL} style={{ width: `${(progress * 100).toFixed(1)}%` }} />
          </div>
          <div className="flex justify-between font-mono text-[10px] text-brand-neutral-500">
            <span>
              {formatBytes(loadedBytes)} / {formatBytes(pickedAsset.sizeBytes)}
            </span>
            <span>{(progress * 100).toFixed(0)}%</span>
          </div>
        </div>
      )}
      {downloadError && (
        <div className={cn(CARD, ERROR_CARD)}>Download failed — {downloadError}</div>
      )}

      {FLASH_STATUS_CARDS[state.kind](state)}

      <ol className="m-0 flex flex-col gap-1 pl-[18px] text-[12px] leading-[1.45] text-brand-neutral-700">
        <li>Press and hold the BOOT button on the back of the dash — keep it held.</li>
        <li>Start the burn while still holding BOOT.</li>
        <li>Pick the dash's serial port in the browser prompt (USB-SERIAL CH340).</li>
        <li>Release BOOT once the progress bar starts moving; the flash takes ~30 seconds.</li>
      </ol>
    </div>
  )
}

const PROGRESS_TRACK = 'h-1.5 w-full overflow-hidden bg-brand-neutral-200'

const PROGRESS_FILL = 'h-full bg-brand-accent [transition:width_120ms_linear]'

const CARD = 'border px-3.5 py-2.5 text-[12px] leading-[1.5] text-brand-text'

const ERROR_CARD =
  'border-brand-accent bg-[color-mix(in_srgb,hsl(var(--brand-accent))_8%,transparent)]'

const flashButton = cva('border-none text-[13px] font-extrabold', {
  variants: {
    tone: {
      burn: 'px-[26px] py-[13px] tracking-[0.09em]',
      secondary:
        'border border-solid border-brand-neutral-400 bg-transparent px-5 py-[13px] tracking-[0.07em]',
    },
    disabled: {
      true: 'cursor-not-allowed',
      false: 'cursor-pointer',
    },
  },
  compoundVariants: [
    { tone: 'burn', disabled: true, class: 'bg-brand-neutral-300 text-brand-neutral-500' },
    { tone: 'burn', disabled: false, class: 'bg-brand-accent text-brand-ground' },
    { tone: 'secondary', disabled: true, class: 'text-brand-neutral-500' },
    { tone: 'secondary', disabled: false, class: 'text-brand-text' },
  ],
  defaultVariants: { disabled: false },
})
