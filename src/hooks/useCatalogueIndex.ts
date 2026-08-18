import { useEffect, useState } from 'react'
import { errorMessage } from '../lib/error-message'
import { useLogStore } from '../stores/log.store'

export interface CatalogueEntry {
  id: string
  vendor: string
  label: string
  path: string
}

interface CatalogueManifest {
  entries: CatalogueEntry[]
}

export interface CatalogueIndex {
  entries: readonly CatalogueEntry[]
  labels: ReadonlyMap<string, string>
}

const CATALOGUE_URL = '/ecu-catalogue/index.json'

const EMPTY_INDEX: CatalogueIndex = { entries: [], labels: new Map() }

const toIndex = (manifest: CatalogueManifest): CatalogueIndex => ({
  entries: manifest.entries,
  labels: new Map(manifest.entries.map((entry) => [entry.id, entry.label])),
})

export const useCatalogueIndex = (): CatalogueIndex => {
  const [index, setIndex] = useState<CatalogueIndex>(EMPTY_INDEX)
  const log = useLogStore((s) => s.push)

  useEffect(() => {
    let cancelled = false
    void fetch(CATALOGUE_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${String(res.status)}`)
        return res.json() as Promise<CatalogueManifest>
      })
      .then((manifest) => {
        if (cancelled) return
        setIndex(toIndex(manifest))
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setIndex(EMPTY_INDEX)
        log('warn', `ECU catalogue index unavailable — ${errorMessage(err)}`)
      })
    return () => {
      cancelled = true
    }
  }, [log])

  return index
}
