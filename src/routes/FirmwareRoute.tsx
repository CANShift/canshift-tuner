import { useEffect, useMemo, useState } from 'react'
import { BuildChooser } from '../components/firmware/BuildChooser'
import { BoardSelector } from '../components/firmware/BoardSelector'
import { BoardProfileProvision } from '../components/firmware/BoardProfileProvision'
import { FirmwareSidePanel } from '../components/firmware/FirmwareSidePanel'
import { FlashActions } from '../components/firmware/FlashActions'
import { KeyFigures } from '../components/firmware/KeyFigures'
import { WriteAndPreflight } from '../components/firmware/WriteAndPreflight'
import { useFirmwareReleases } from '../hooks/useFirmwareReleases'
import { useFirmwareManifest } from '../hooks/useFirmwareManifest'
import { useDeviceStore } from '../stores/device.store'
import { useFirmwareSelectionStore } from '../stores/firmware-selection.store'
import { resolveBoardSelection } from '../lib/firmware/board-resolution'
import { findBoard } from '../lib/firmware/manifest'
import { findAssetByName, findMergedAsset } from '../lib/firmware/releases'
import { cn } from '@/lib/utils'
import { RouteHeader } from '../components/shell/RouteHeader'
import { RouteBody, RoutePage } from '../components/ui/route-shell'
import { MetaText } from '../components/ui/meta-text'

const FirmwareRoute = () => {
  const { state: releasesState, refresh } = useFirmwareReleases()
  const selection = useFirmwareSelectionStore((s) => s.selection)
  const clearSelection = useFirmwareSelectionStore((s) => s.clear)
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const installedVersion = useDeviceStore((s) => s.firmwareVersion)
  const rawBoardId = useDeviceStore((s) => s.boardId)
  const [pickedTag, setPickedTag] = useState<string | null>(null)
  const [boardOverride, setBoardOverride] = useState<string | null>(null)

  const releases = useMemo(
    () => (releasesState.kind === 'ok' ? releasesState.releases : []),
    [releasesState]
  )
  const latestStable = useMemo(() => releases.find((r) => !r.prerelease) ?? null, [releases])
  const effectiveTag =
    selection.kind === 'local'
      ? null
      : (pickedTag ?? (selection.kind === 'release' ? selection.release.tag : null))
  const pickedRelease = useMemo(
    () => releases.find((r) => r.tag === effectiveTag) ?? null,
    [releases, effectiveTag]
  )

  const linked = connected && !simulationMode

  const manifestState = useFirmwareManifest(pickedRelease)
  const manifest = manifestState.kind === 'ok' ? manifestState.manifest : null
  const detectedBoardId = linked ? rawBoardId : null
  const resolution = resolveBoardSelection(manifest, detectedBoardId)

  useEffect(() => {
    setBoardOverride(null)
  }, [effectiveTag])

  const selectedBoardId = boardOverride ?? resolution.selectedId
  const selectedBoard = manifest && selectedBoardId ? findBoard(manifest, selectedBoardId) : null
  const boardDetected = resolution.source === 'detected' && boardOverride === null
  const expectedChip = selectedBoard?.chip

  const mergedAsset =
    pickedRelease === null
      ? null
      : selectedBoard
        ? findAssetByName(pickedRelease, selectedBoard.artifacts.merged)
        : findMergedAsset(pickedRelease)

  const pickRelease = (tag: string) => {
    if (selection.kind === 'local') clearSelection()
    setPickedTag(tag)
  }

  const localPicked = () => {
    setPickedTag(null)
  }

  return (
    <RoutePage>
      <RouteHeader
        title="Firmware"
        subtitle={
          <span className="flex items-center gap-2 border border-brand-neutral-400 px-2.5 py-1 font-mono text-[11px] text-brand-neutral-700">
            <span className={cn('size-[7px]', linked ? 'bg-success' : 'bg-brand-neutral-500')} />
            {linked ? 'tuner link active — released for the flash' : 'no device connected'}
          </span>
        }
        action={<MetaText>esptool-js · WebSerial</MetaText>}
      />
      <RouteBody>
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <KeyFigures
            installedVersion={installedVersion}
            latestStable={latestStable}
            selection={selection}
          />
          <BuildChooser
            releasesState={releasesState}
            selection={selection}
            pickedTag={effectiveTag}
            installedVersion={installedVersion}
            onPickRelease={pickRelease}
            onLocalPicked={localPicked}
            onRefresh={refresh}
          />
          <BoardSelector
            manifestState={manifestState}
            boards={resolution.boards}
            selectedId={selectedBoardId}
            detected={boardDetected}
            onSelect={setBoardOverride}
          />
          <WriteAndPreflight selection={selection} />
          <FlashActions
            selection={selection}
            pickedRelease={pickedRelease}
            mergedAsset={mergedAsset}
            {...(expectedChip !== undefined ? { expectedChip } : {})}
          />
          <BoardProfileProvision />
        </div>
        <FirmwareSidePanel
          release={
            pickedRelease ?? (selection.kind === 'release' ? selection.release : latestStable)
          }
        />
      </RouteBody>
    </RoutePage>
  )
}

export default FirmwareRoute
