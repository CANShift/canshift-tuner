import type { ChangeEvent, ReactNode } from 'react'
import { useRef, useState } from 'react'
import { cva } from 'class-variance-authority'
import type { ReleaseInfo } from '@canshift/core'
import type { FirmwareSelection } from '../../stores/firmware-selection.store'
import type { FirmwareReleasesState } from '../../hooks/useFirmwareReleases'
import { useFirmwareSelectionStore } from '../../stores/firmware-selection.store'
import { useLogStore } from '../../stores/log.store'
import { readFirmwareFile } from '../../lib/firmware/local-firmware'
import { findMergedAsset } from '../../lib/firmware/releases'
import { errorMessage } from '../../lib/error-message'
import { formatBytes } from '../../lib/format'
import { cn } from '@/lib/utils'
import { Eyebrow, MetaText } from '../ui/meta-text'

export interface BuildChooserProps {
  releasesState: FirmwareReleasesState
  selection: FirmwareSelection
  pickedTag: string | null
  installedVersion: string | null
  onPickRelease: (tag: string) => void
  onLocalPicked: () => void
  onRefresh: () => void
}

const SHA_PREFIX_CHARS = 12

const formatDate = (iso: string): string => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toISOString().slice(0, 10)
}

const describeRelease = (release: ReleaseInfo, installedVersion: string | null): string => {
  if (release.version === installedVersion) return 'On the device now — reflash or roll back'
  if (release.prerelease) return `Pre-release — ${release.name ?? 'unsigned nightly build'}`
  return release.name ?? 'Stable release'
}

interface ReleaseRowProps {
  release: ReleaseInfo
  active: boolean
  installedVersion: string | null
  onPick: (tag: string) => void
}

const ReleaseRow = ({ release, active, installedVersion, onPick }: ReleaseRowProps) => {
  const asset = findMergedAsset(release)
  return (
    <button
      type="button"
      disabled={asset === null}
      onClick={() => {
        onPick(release.tag)
      }}
      className={cn(row({ shape: 'release', active, disabled: asset === null }))}
    >
      <span className={cn(radio({ active }))} />
      <span className={TAG}>{release.tag}</span>
      <span className={cn(description({ active }))}>
        {describeRelease(release, installedVersion)}
      </span>
      <MetaText>{formatDate(release.publishedAt)}</MetaText>
      <MetaText>{asset ? formatBytes(asset.sizeBytes) : 'no build'}</MetaText>
    </button>
  )
}

interface ReleaseListProps {
  releasesState: FirmwareReleasesState
  pickedTag: string | null
  installedVersion: string | null
  onPickRelease: (tag: string) => void
}

const RELEASE_LIST: Record<FirmwareReleasesState['kind'], (props: ReleaseListProps) => ReactNode> =
  {
    loading: () => <div className={HINT_ROW}>Loading releases from GitHub…</div>,
    error: ({ releasesState }) =>
      releasesState.kind !== 'error' ? null : (
        <div className={ERROR_ROW}>Release fetch failed — {releasesState.message}</div>
      ),
    ok: ({ releasesState, pickedTag, installedVersion, onPickRelease }) =>
      releasesState.kind !== 'ok'
        ? null
        : releasesState.releases.map((release) => (
            <ReleaseRow
              key={release.tag}
              release={release}
              active={pickedTag === release.tag}
              installedVersion={installedVersion}
              onPick={onPickRelease}
            />
          )),
  }

export const BuildChooser = ({
  releasesState,
  selection,
  pickedTag,
  installedVersion,
  onPickRelease,
  onLocalPicked,
  onRefresh,
}: BuildChooserProps) => {
  const setLocalFirmware = useFirmwareSelectionStore((s) => s.setLocalFirmware)
  const clear = useFirmwareSelectionStore((s) => s.clear)
  const log = useLogStore((s) => s.push)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)

  const localActive = selection.kind === 'local'

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setLocalError(null)
    void readLocalFirmware(file).finally(() => {
      event.target.value = ''
    })
  }

  const readLocalFirmware = async (file: File): Promise<void> => {
    try {
      const firmware = await readFirmwareFile(file)
      setLocalFirmware(firmware)
      onLocalPicked()
      log(
        'info',
        `Selected local firmware ${firmware.name} (${formatBytes(firmware.size)}, sha256 ${firmware.sha256.slice(0, SHA_PREFIX_CHARS)}…)`
      )
    } catch (err: unknown) {
      const message = errorMessage(err)
      setLocalError(message)
      log('error', `Local firmware read failed: ${message}`)
    }
  }

  const handleClearLocal = () => {
    clear()
    setLocalError(null)
    log('info', 'Cleared local firmware selection')
  }

  return (
    <section>
      <Eyebrow className="flex items-center justify-between px-6 pb-2.5 pt-[22px]">
        <span>CHOOSE A BUILD</span>
        <button
          type="button"
          className={cn('shell-link-button', GHOST_BUTTON, 'px-2.5 py-1')}
          onClick={onRefresh}
        >
          REFRESH
        </button>
      </Eyebrow>
      <div className="border-y-2 border-brand-divider">
        {RELEASE_LIST[releasesState.kind]({
          releasesState,
          pickedTag,
          installedVersion,
          onPickRelease,
        })}
        <div className={cn(row({ shape: 'local', active: localActive }))}>
          <span className={cn(radio({ active: localActive }))} />
          <span className={TAG}>Local</span>
          {localActive && selection.kind === 'local' ? (
            <span className={cn(description({ active: true }))}>
              {selection.firmware.name} · {formatBytes(selection.firmware.size)} · sha256{' '}
              {selection.firmware.sha256.slice(0, SHA_PREFIX_CHARS)}…
            </span>
          ) : (
            <span className={cn(description({ active: false }))}>
              Pick a .bin from disk — files over 16 MiB are rejected
            </span>
          )}
          <span className="flex gap-2">
            <button
              type="button"
              className={cn('shell-link-button', GHOST_BUTTON, 'px-3 py-[5px]')}
              onClick={() => inputRef.current?.click()}
            >
              CHOOSE FILE
            </button>
            {localActive && (
              <button
                type="button"
                className={cn('shell-link-button', GHOST_BUTTON, 'px-3 py-[5px]')}
                onClick={handleClearLocal}
              >
                CLEAR
              </button>
            )}
          </span>
          <input
            ref={inputRef}
            type="file"
            accept=".bin,application/octet-stream"
            onChange={handleFile}
            className="hidden"
          />
        </div>
        {localError && <div className={ERROR_ROW}>Local firmware read failed — {localError}</div>}
      </div>
    </section>
  )
}

const GHOST_BUTTON =
  'cursor-pointer border border-brand-neutral-400 bg-none text-[10px] font-extrabold tracking-[0.08em] text-brand-text'

const TAG = 'overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[14px] text-brand-text'

const HINT_ROW = 'px-6 py-3.5 text-[12px] text-brand-neutral-500'

const ERROR_ROW = 'px-6 py-2.5 text-[12px] text-brand-accent'

const row = cva('grid w-full items-center gap-3 border-none px-6 py-3.5 text-left font-[inherit]', {
  variants: {
    shape: {
      release:
        'grid-cols-[26px_96px_1fr_120px_96px] border-b border-solid border-b-brand-neutral-300 cursor-pointer',
      local: 'grid-cols-[26px_96px_1fr_auto] cursor-default',
    },
    active: {
      true: 'bg-brand-neutral-100 shadow-[inset_3px_0_0_hsl(var(--brand-accent))]',
      false: 'bg-transparent',
    },
    disabled: {
      true: 'cursor-not-allowed opacity-45',
      false: '',
    },
  },
  defaultVariants: { active: false, disabled: false },
})

const radio = cva('size-[15px] border-2 border-solid', {
  variants: {
    active: {
      true: 'border-brand-accent bg-brand-accent',
      false: 'border-brand-neutral-400 bg-transparent',
    },
  },
  defaultVariants: { active: false },
})

const description = cva('overflow-hidden text-ellipsis whitespace-nowrap text-[13px]', {
  variants: {
    active: {
      true: 'text-brand-text',
      false: 'text-brand-neutral-700',
    },
  },
  defaultVariants: { active: false },
})
