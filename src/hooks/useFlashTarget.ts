import { useEffect, useMemo, useState } from 'react'
import { BOARD_PROFILES } from '@canshift/core'
import type { ReleaseAsset, ReleaseInfo } from '@canshift/core'
import { useDeviceStore } from '../stores/device.store'
import { useFirmwareReleases } from './useFirmwareReleases'
import { useFirmwareManifest, type ManifestState } from './useFirmwareManifest'
import { findAssetByName, findMergedAsset } from '../lib/firmware/releases'
import { FALLBACK_BOARD_ID } from '../lib/firmware/manifest'
import type { ModelOption } from '../components/firmware/ModelSelect'
import type { VersionOption } from '../components/firmware/VersionRow'

export interface FlashBuild {
  asset: ReleaseAsset | null
  sha256: string | null
  chip: string | null
  blocked: string | null
}

export interface FlashTarget {
  models: readonly ModelOption[]
  modelId: string
  modelDetected: boolean
  setModelId: (id: string) => void
  versions: readonly VersionOption[]
  release: ReleaseInfo | null
  selectedTag: string
  setSelectedTag: (tag: string) => void
  rollback: string | null
  build: FlashBuild
  releasesError: string | null
  refresh: () => void
}

const LATEST_SUFFIX = ' LATEST'
const PRERELEASE_SUFFIX = ' PRE'

const modelOptions = (): ModelOption[] =>
  BOARD_PROFILES.map((profile) => ({
    id: profile.boardId,
    label: profile.boardName,
    hint: `${profile.chipFamily} · ${profile.lcd.driver} ${String(profile.lcd.panelWidth)}×${String(profile.lcd.panelHeight)}`,
  }))

const versionOptions = (
  releases: readonly ReleaseInfo[],
  latestTag: string | null
): VersionOption[] =>
  releases.map((release) => ({
    tag: release.tag,
    label: `${release.version}${release.tag === latestTag ? LATEST_SUFFIX : ''}${release.prerelease ? PRERELEASE_SUFFIX : ''}`,
  }))

const buildFor = (
  release: ReleaseInfo | null,
  manifest: ManifestState,
  modelId: string,
  modelLabel: string
): FlashBuild => {
  if (!release) return { asset: null, sha256: null, chip: null, blocked: 'No release selected.' }
  if (manifest.kind === 'loading' || manifest.kind === 'idle')
    return { asset: null, sha256: null, chip: null, blocked: 'Reading the release manifest…' }
  if (manifest.kind === 'error')
    return {
      asset: null,
      sha256: null,
      chip: null,
      blocked: `Could not read this release's manifest — ${manifest.message}`,
    }
  if (manifest.kind === 'none') {
    if (modelId !== FALLBACK_BOARD_ID)
      return {
        asset: null,
        sha256: null,
        chip: null,
        blocked: `${release.version} predates per-model builds — it only ships an image for the CrowPanel 2.8".`,
      }
    return { asset: findMergedAsset(release), sha256: null, chip: null, blocked: null }
  }
  const board = manifest.manifest.boards.find((entry) => entry.id === modelId)
  if (!board)
    return {
      asset: null,
      sha256: null,
      chip: null,
      blocked: `${release.version} has no build for the ${modelLabel}. Pick another version.`,
    }
  return {
    asset: findAssetByName(release, board.artifacts.merged.file),
    sha256: board.artifacts.merged.sha256,
    chip: board.chip,
    blocked: null,
  }
}

const rollbackNote = (release: ReleaseInfo | null, latest: ReleaseInfo | null): string | null => {
  if (!release || !latest || release.tag === latest.tag) return null
  return `${release.version} is older than ${latest.version}. Flashing it is a rollback — the config format may be newer than this build understands.`
}

export const useFlashTarget = (): FlashTarget => {
  const { state: releasesState, refresh } = useFirmwareReleases()
  const detectedBoardId = useDeviceStore((s) => s.boardId)
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)

  const models = useMemo(modelOptions, [])
  const linked = connected && !simulationMode
  const detected = linked && models.some((model) => model.id === detectedBoardId)
  const [override, setOverride] = useState<string | null>(null)
  const modelId =
    override ?? (detected ? (detectedBoardId ?? FALLBACK_BOARD_ID) : FALLBACK_BOARD_ID)

  const releases = useMemo(
    () => (releasesState.kind === 'ok' ? releasesState.releases : []),
    [releasesState]
  )
  const latest = releases.find((release) => !release.prerelease) ?? releases[0] ?? null
  const [pickedTag, setPickedTag] = useState<string | null>(null)
  const selectedTag = pickedTag ?? latest?.tag ?? ''
  const release = releases.find((entry) => entry.tag === selectedTag) ?? null

  const manifest = useFirmwareManifest(release)

  useEffect(() => {
    if (pickedTag !== null && !releases.some((entry) => entry.tag === pickedTag)) setPickedTag(null)
  }, [pickedTag, releases])

  const modelLabel = models.find((model) => model.id === modelId)?.label ?? modelId

  return {
    models,
    modelId,
    modelDetected: detected && override === null,
    setModelId: setOverride,
    versions: versionOptions(releases, latest?.tag ?? null),
    release,
    selectedTag,
    setSelectedTag: setPickedTag,
    rollback: rollbackNote(release, latest),
    build: buildFor(release, manifest, modelId, modelLabel),
    releasesError: releasesState.kind === 'error' ? releasesState.message : null,
    refresh,
  }
}
