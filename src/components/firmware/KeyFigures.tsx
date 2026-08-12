import type { ReleaseInfo } from '@canshift/core'
import type { FirmwareSelection } from '../../stores/firmware-selection.store'
import { findMergedAsset } from '../../lib/firmware/releases'
import { formatBytes } from '../../lib/format'
import { cn } from '@/lib/utils'

export interface KeyFiguresProps {
  installedVersion: string | null
  latestStable: ReleaseInfo | null
  selection: FirmwareSelection
}

const formatDate = (iso: string): string => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toISOString().slice(0, 10)
}

export const KeyFigures = ({ installedVersion, latestStable, selection }: KeyFiguresProps) => {
  const latestAsset = latestStable ? findMergedAsset(latestStable) : null
  const updateAvailable =
    installedVersion !== null && latestStable !== null && latestStable.version !== installedVersion

  const selectedLabel =
    selection.kind === 'release'
      ? selection.release.tag
      : selection.kind === 'local'
        ? selection.firmware.name
        : '—'
  const selectedDetail =
    selection.kind === 'none'
      ? 'pick a build below'
      : `${formatBytes(selection.firmware.size)} · sha256 ${selection.firmware.sha256.slice(0, 12)}…`

  return (
    <div className="grid grid-cols-3 border-b-2 border-brand-divider">
      <div className={CELL}>
        <span className={LABEL}>INSTALLED</span>
        <span className={VALUE}>{installedVersion ?? '—'}</span>
        <span className={DETAIL}>
          {installedVersion ? 'read from the device' : 'no device link'}
        </span>
      </div>
      <div className={CELL}>
        <span className={cn(LABEL, updateAvailable && 'text-brand-accent')}>AVAILABLE</span>
        <span className={cn(VALUE, updateAvailable && 'text-brand-accent')}>
          {latestStable?.version ?? '—'}
        </span>
        <span className={DETAIL}>
          {latestStable
            ? `released ${formatDate(latestStable.publishedAt)}${latestAsset ? ` · ${formatBytes(latestAsset.sizeBytes)}` : ''}`
            : 'no stable release found'}
        </span>
      </div>
      <div className={cn(CELL, 'border-r-0')}>
        <span className={LABEL}>SELECTED</span>
        <span className={VALUE}>{selectedLabel}</span>
        <span className={DETAIL}>{selectedDetail}</span>
      </div>
    </div>
  )
}

const CELL = 'flex min-w-0 flex-col gap-[5px] border-r border-brand-neutral-300 px-6 py-5'

const LABEL = 'text-[10px] font-extrabold tracking-[0.18em] text-brand-neutral-600'

const VALUE =
  'overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[30px] leading-[1.1] text-brand-text'

const DETAIL =
  'overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[11px] text-brand-neutral-600'
