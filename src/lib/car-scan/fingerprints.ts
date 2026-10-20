import { ECU_PROFILES } from '@canshift/core'
import type { SignalDef } from '@canshift/core'
import { CATALOGUE_INDEX } from '../ecu-catalogue'
import { loadCatalogueProfile } from '../catalogue-profile'
import { parseHexFrameId } from '../../utils/frame-id'

export interface CarFingerprint {
  key: string
  label: string
  frameIds: ReadonlySet<number>
}

const POLLED_PROTOCOLS: ReadonlySet<string> = new Set(['obd2_j1979'])

const frameIdsOf = (signals: readonly SignalDef[]): ReadonlySet<number> =>
  new Set(signals.map((signal) => parseHexFrameId(signal.canFrameId)).filter((id) => id >= 0))

const builtInFingerprints = (): CarFingerprint[] =>
  ECU_PROFILES.filter((profile) => !POLLED_PROTOCOLS.has(profile.protocol)).map((profile) => ({
    key: `builtin:${profile.id}`,
    label: profile.name,
    frameIds: frameIdsOf(profile.signals),
  }))

const catalogueFingerprint = async (id: string): Promise<CarFingerprint | null> => {
  const profile = await loadCatalogueProfile(id)
  if (profile.kind === 'error') return null
  return { key: `catalogue:${id}`, label: profile.label, frameIds: frameIdsOf(profile.signals) }
}

const loadAll = async (): Promise<readonly CarFingerprint[]> => {
  const catalogue = await Promise.all(
    CATALOGUE_INDEX.entries.map((entry) => catalogueFingerprint(entry.id))
  )
  const known = [...builtInFingerprints(), ...catalogue.filter((print) => print !== null)]
  return known.filter((print) => print.frameIds.size > 0)
}

let cached: Promise<readonly CarFingerprint[]> | null = null

export const carFingerprints = (): Promise<readonly CarFingerprint[]> => {
  cached ??= loadAll()
  return cached
}
