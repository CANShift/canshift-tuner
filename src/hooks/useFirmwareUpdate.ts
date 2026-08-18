import { useMemo } from 'react'
import { useDeviceStore } from '../stores/device.store'
import { useFirmwareReleases } from './useFirmwareReleases'
import { isNewerVersion } from '../lib/firmware/version'

export interface FirmwareUpdate {
  current: string
  latest: string
  notesUrl: string
}

export const useFirmwareUpdate = (): FirmwareUpdate | null => {
  const current = useDeviceStore((s) => s.firmwareVersion)
  const { state } = useFirmwareReleases()

  return useMemo(() => {
    if (current === null || state.kind !== 'ok') return null
    const newest = state.releases.find((release) => !release.prerelease)
    if (!newest || !isNewerVersion(newest.version, current)) return null
    return { current, latest: newest.version, notesUrl: newest.htmlUrl }
  }, [current, state])
}
