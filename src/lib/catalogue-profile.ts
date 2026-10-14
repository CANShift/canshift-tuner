import { parseCanXml } from '@canshift/core'
import type { SignalDef } from '@canshift/core'
import { CATALOGUE_INDEX, loadCatalogueXml, type CatalogueEntry } from './ecu-catalogue'
import { errorMessage } from './error-message'

export type CatalogueProfile =
  | { kind: 'ok'; label: string; signals: SignalDef[]; warnings: readonly string[] }
  | { kind: 'error'; message: string; failure?: string }

const fromXml = (entry: CatalogueEntry, xml: string | null): CatalogueProfile => {
  if (xml === null) return { kind: 'error', message: `"${entry.label}" is missing from this build` }
  const parsed = parseCanXml(xml)
  if (parsed.signals.length === 0) {
    return {
      kind: 'error',
      message: `"${entry.label}" — ${parsed.warnings[0] ?? 'no signals found'}`,
    }
  }
  return {
    kind: 'ok',
    label: `${entry.vendor} · ${entry.label}`,
    signals: parsed.signals,
    warnings: parsed.warnings,
  }
}

const loadEntry = async (entry: CatalogueEntry): Promise<CatalogueProfile> => {
  try {
    return fromXml(entry, await loadCatalogueXml(entry.id))
  } catch (err) {
    const message = errorMessage(err)
    return {
      kind: 'error',
      message: `Could not load "${entry.label}" — ${message}`,
      failure: `Catalogue entry "${entry.label}" failed to load: ${message}`,
    }
  }
}

export const loadCatalogueProfile = async (id: string): Promise<CatalogueProfile> => {
  const entry = CATALOGUE_INDEX.entries.find((candidate) => candidate.id === id)
  if (!entry) return { kind: 'error', message: `The catalogue has no entry called "${id}"` }
  return loadEntry(entry)
}
