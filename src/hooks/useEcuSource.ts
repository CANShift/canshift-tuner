import { useState } from 'react'
import { parseCanXml } from '@canshift/core'
import type { SignalDef } from '@canshift/core'
import type { CatalogueItem } from '../components/ecu/EcuCatalogueList'
import { useLogStore } from '../stores/log.store'
import { errorMessage } from '../lib/error-message'

export type EcuSource =
  | { kind: 'none' }
  | { kind: 'import'; fileName: string; signals: SignalDef[]; warnings: string[] }
  | {
      kind: 'catalogue'
      itemId: string
      label: string
      vendor: string
      signals: SignalDef[]
      warnings: string[]
    }

export interface UseEcuSource {
  source: EcuSource
  importError: string | null
  setImportError: (message: string | null) => void
  selectCatalogueItem: (item: CatalogueItem) => Promise<void>
  loadImport: (fileName: string, xml: string) => void
  clear: () => void
}

const fetchCatalogueXml = async (item: CatalogueItem): Promise<string> => {
  const res = await fetch(item.path)
  if (!res.ok) throw new Error(`HTTP ${String(res.status)}`)
  return res.text()
}

export const useEcuSource = (): UseEcuSource => {
  const log = useLogStore((s) => s.push)
  const [source, setSource] = useState<EcuSource>({ kind: 'none' })
  const [importError, setImportError] = useState<string | null>(null)

  const selectCatalogueItem = async (item: CatalogueItem) => {
    setImportError(null)
    let xml: string
    try {
      xml = await fetchCatalogueXml(item)
    } catch (err) {
      const message = errorMessage(err)
      setImportError(`Catalogue load failed — ${message}`)
      log('error', `Catalogue entry "${item.label}" fetch failed: ${message}`)
      return
    }

    const result = parseCanXml(xml)
    if (result.signals.length === 0) {
      const reason = result.warnings[0] ?? 'no signals found'
      setImportError(`Catalogue load failed — ${reason}`)
      log('error', `Catalogue entry "${item.label}" failed: ${reason}`)
      return
    }
    setSource({
      kind: 'catalogue',
      itemId: item.id,
      label: item.label,
      vendor: item.vendor,
      signals: result.signals,
      warnings: result.warnings,
    })
  }

  const loadImport = (fileName: string, xml: string) => {
    setImportError(null)
    const result = parseCanXml(xml)
    if (result.signals.length === 0) {
      const reason = result.warnings[0] ?? 'no signals found'
      setImportError(`Import failed — ${reason}`)
      log('error', `XML import "${fileName}" failed: ${reason}`)
      return
    }
    setSource({
      kind: 'import',
      fileName,
      signals: result.signals,
      warnings: result.warnings,
    })
  }

  const clear = () => {
    setImportError(null)
    setSource({ kind: 'none' })
  }

  return { source, importError, setImportError, selectCatalogueItem, loadImport, clear }
}
