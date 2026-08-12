import { useEffect, useState } from 'react'
import { errorMessage } from '../lib/error-message'
import { useLogStore } from '../stores/log.store'

export interface CatalogueIndexEntry {
  id: string
  vendor: string
  label: string
}

interface CatalogueManifest {
  entries: CatalogueIndexEntry[]
}

export type CatalogueIndex = ReadonlyMap<string, string>

const CATALOGUE_URL = '/ecu-catalogue/index.json'

const EMPTY_INDEX: CatalogueIndex = new Map()

export const useCatalogueIndex = (): CatalogueIndex => {
  const [labels, setLabels] = useState<CatalogueIndex>(EMPTY_INDEX)
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
        setLabels(new Map(manifest.entries.map((entry) => [entry.id, entry.label])))
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setLabels(EMPTY_INDEX)
        log('warn', `ECU catalogue index unavailable — ${errorMessage(err)}`)
      })
    return () => {
      cancelled = true
    }
  }, [log])

  return labels
}
