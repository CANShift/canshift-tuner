import type { ChangeEvent, CSSProperties, ReactNode } from 'react'
import { useRef, useState } from 'react'
import type { ReleaseInfo } from '@canshift/core'
import type { FirmwareSelection } from '../../stores/firmware-selection.store'
import type { FirmwareReleasesState } from '../../hooks/useFirmwareReleases'
import { useFirmwareSelectionStore } from '../../stores/firmware-selection.store'
import { useLogStore } from '../../stores/log.store'
import { readFirmwareFile } from '../../lib/firmware/local-firmware'
import { findMergedAsset } from '../../lib/firmware/releases'
import { errorMessage } from '../../lib/error-message'
import { formatBytes } from '../../lib/format'
import { MONO_FONT } from '../../lib/typography'

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
      style={releaseRowStyle(active, asset === null)}
    >
      <span style={radioStyle(active)} />
      <span style={tagStyle}>{release.tag}</span>
      <span style={active ? descriptionActiveStyle : descriptionStyle}>
        {describeRelease(release, installedVersion)}
      </span>
      <span style={metaStyle}>{formatDate(release.publishedAt)}</span>
      <span style={metaStyle}>{asset ? formatBytes(asset.sizeBytes) : 'no build'}</span>
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
    loading: () => <div style={hintRowStyle}>Loading releases from GitHub…</div>,
    error: ({ releasesState }) =>
      releasesState.kind !== 'error' ? null : (
        <div style={errorRowStyle}>Release fetch failed — {releasesState.message}</div>
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
      <div style={sectionHeaderStyle}>
        <span>CHOOSE A BUILD</span>
        <button
          type="button"
          className="shell-link-button"
          onClick={onRefresh}
          style={refreshStyle}
        >
          REFRESH
        </button>
      </div>
      <div style={listStyle}>
        {RELEASE_LIST[releasesState.kind]({
          releasesState,
          pickedTag,
          installedVersion,
          onPickRelease,
        })}
        <div style={localRowStyle(localActive)}>
          <span style={radioStyle(localActive)} />
          <span style={tagStyle}>Local</span>
          {localActive && selection.kind === 'local' ? (
            <span style={descriptionActiveStyle}>
              {selection.firmware.name} · {formatBytes(selection.firmware.size)} · sha256{' '}
              {selection.firmware.sha256.slice(0, SHA_PREFIX_CHARS)}…
            </span>
          ) : (
            <span style={descriptionStyle}>
              Pick a .bin from disk — files over 16 MiB are rejected
            </span>
          )}
          <span style={localActionsStyle}>
            <button
              type="button"
              className="shell-link-button"
              onClick={() => inputRef.current?.click()}
              style={localButtonStyle}
            >
              CHOOSE FILE
            </button>
            {localActive && (
              <button
                type="button"
                className="shell-link-button"
                onClick={handleClearLocal}
                style={localButtonStyle}
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
            style={{ display: 'none' }}
          />
        </div>
        {localError && <div style={errorRowStyle}>Local firmware read failed — {localError}</div>}
      </div>
    </section>
  )
}

const sectionHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '22px 24px 10px',
  fontWeight: 800,
  fontSize: 10,
  letterSpacing: '0.2em',
  color: 'hsl(var(--brand-neutral-600))',
}

const refreshStyle: CSSProperties = {
  padding: '4px 10px',
  background: 'none',
  border: '1px solid hsl(var(--brand-neutral-400))',
  fontWeight: 800,
  fontSize: 10,
  letterSpacing: '0.08em',
  color: 'hsl(var(--brand-text))',
  cursor: 'pointer',
}

const listStyle: CSSProperties = {
  borderTop: '2px solid var(--brand-divider)',
  borderBottom: '2px solid var(--brand-divider)',
}

const rowBase: CSSProperties = {
  width: '100%',
  display: 'grid',
  gridTemplateColumns: '26px 96px 1fr 120px 96px',
  alignItems: 'center',
  gap: 12,
  padding: '14px 24px',
  background: 'none',
  border: 'none',
  borderBottom: '1px solid hsl(var(--brand-neutral-300))',
  textAlign: 'left',
  cursor: 'pointer',
  fontFamily: 'inherit',
}

const releaseRowStyle = (active: boolean, disabled: boolean): CSSProperties => ({
  ...rowBase,
  boxShadow: active ? 'inset 3px 0 0 hsl(var(--brand-accent))' : undefined,
  background: active ? 'hsl(var(--brand-neutral-100))' : 'none',
  opacity: disabled ? 0.45 : 1,
  cursor: disabled ? 'not-allowed' : 'pointer',
})

const localRowStyle = (active: boolean): CSSProperties => ({
  ...rowBase,
  gridTemplateColumns: '26px 96px 1fr auto',
  boxShadow: active ? 'inset 3px 0 0 hsl(var(--brand-accent))' : undefined,
  background: active ? 'hsl(var(--brand-neutral-100))' : 'none',
  borderBottom: 'none',
  cursor: 'default',
})

const radioStyle = (active: boolean): CSSProperties => ({
  width: 15,
  height: 15,
  border: `2px solid ${active ? 'hsl(var(--brand-accent))' : 'hsl(var(--brand-neutral-400))'}`,
  background: active ? 'hsl(var(--brand-accent))' : 'none',
})

const tagStyle: CSSProperties = {
  fontFamily: MONO_FONT,
  fontSize: 14,
  color: 'hsl(var(--brand-text))',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

const descriptionStyle: CSSProperties = {
  fontSize: 13,
  color: 'hsl(var(--brand-neutral-700))',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

const descriptionActiveStyle: CSSProperties = {
  ...descriptionStyle,
  color: 'hsl(var(--brand-text))',
}

const metaStyle: CSSProperties = {
  fontFamily: MONO_FONT,
  fontSize: 11,
  color: 'hsl(var(--brand-neutral-600))',
}

const localActionsStyle: CSSProperties = {
  display: 'flex',
  gap: 8,
}

const localButtonStyle: CSSProperties = {
  padding: '5px 12px',
  background: 'none',
  border: '1px solid hsl(var(--brand-neutral-400))',
  fontWeight: 800,
  fontSize: 10,
  letterSpacing: '0.08em',
  color: 'hsl(var(--brand-text))',
  cursor: 'pointer',
}

const hintRowStyle: CSSProperties = {
  padding: '14px 24px',
  fontSize: 12,
  color: 'hsl(var(--brand-neutral-500))',
}

const errorRowStyle: CSSProperties = {
  padding: '10px 24px',
  fontSize: 12,
  color: 'hsl(var(--brand-accent))',
}
