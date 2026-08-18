import { useCallback, useState } from 'react'
import { ECU_PROFILES, parseCanXml } from '@canshift/core'
import type { SignalDef } from '@canshift/core'
import { useDashboardStore } from '../stores/dashboard.store'
import { useSignalStore } from '../stores/signal.store'
import { useLogStore } from '../stores/log.store'
import { errorMessage } from '../lib/error-message'
import { profileLabelFromFileName } from '../lib/profile-xml'
import {
  appliedSummary,
  changeSummary,
  lostBindingCount,
  parseProfileFile,
} from '../lib/profile-change'
import type { CatalogueIndex } from './useCatalogueIndex'

export type ProfileChange =
  | { kind: 'idle' }
  | {
      kind: 'pending'
      key: string
      label: string
      signals: SignalDef[]
      message: string
      warnings: readonly string[]
    }
  | { kind: 'applied'; message: string }
  | { kind: 'error'; message: string }

export interface UseProfileChange {
  change: ProfileChange
  selectKey: (key: string) => void
  importXml: (fileName: string, xml: string) => void
  apply: () => void
  dismiss: () => void
}

const IDLE: ProfileChange = { kind: 'idle' }

export const useProfileChange = (catalogue: CatalogueIndex): UseProfileChange => {
  const signals = useSignalStore((s) => s.signals)
  const applyProfile = useSignalStore((s) => s.applyProfile)
  const config = useDashboardStore((s) => s.config)
  const log = useLogStore((s) => s.push)
  const [change, setChange] = useState<ProfileChange>(IDLE)

  const stage = useCallback(
    (key: string, label: string, next: SignalDef[], warnings: readonly string[]) => {
      const lost = lostBindingCount(config, next)
      setChange({
        kind: 'pending',
        key,
        label,
        signals: next,
        message: changeSummary(label, signals, next, lost),
        warnings,
      })
    },
    [config, signals]
  )

  const stageCatalogue = useCallback(
    async (key: string, id: string) => {
      const entry = catalogue.entries.find((candidate) => candidate.id === id)
      if (!entry) {
        setChange({ kind: 'error', message: `The catalogue has no entry called "${id}"` })
        return
      }
      try {
        const res = await fetch(entry.path)
        if (!res.ok) throw new Error(`HTTP ${String(res.status)}`)
        const parsed = parseCanXml(await res.text())
        if (parsed.signals.length === 0) {
          setChange({
            kind: 'error',
            message: `"${entry.label}" — ${parsed.warnings[0] ?? 'no signals found'}`,
          })
          return
        }
        stage(key, `${entry.vendor} · ${entry.label}`, parsed.signals, parsed.warnings)
      } catch (err) {
        const message = errorMessage(err)
        log('error', `Catalogue entry "${entry.label}" fetch failed: ${message}`)
        setChange({ kind: 'error', message: `Could not load "${entry.label}" — ${message}` })
      }
    },
    [catalogue, stage, log]
  )

  const selectKey = useCallback(
    (key: string) => {
      const [scheme, ...rest] = key.split(':')
      const id = rest.join(':')
      if (scheme === 'catalogue') {
        void stageCatalogue(key, id)
        return
      }
      const profile = ECU_PROFILES.find((entry) => entry.id === id)
      if (!profile) return
      stage(key, profile.name, [...profile.signals], [])
    },
    [stage, stageCatalogue]
  )

  const importXml = useCallback(
    (fileName: string, xml: string) => {
      const parsed = parseProfileFile(fileName, xml)
      if (parsed.kind === 'error') {
        setChange({ kind: 'error', message: parsed.message })
        return
      }
      stage(
        `import:${fileName}`,
        profileLabelFromFileName(fileName),
        parsed.signals,
        parsed.warnings
      )
    },
    [stage]
  )

  const apply = useCallback(() => {
    if (change.kind !== 'pending') return
    applyProfile(change.key, change.signals)
    log('success', `Applied "${change.label}" — ${String(change.signals.length)} signals`)
    setChange({ kind: 'applied', message: appliedSummary(change.label, change.signals.length) })
  }, [change, applyProfile, log])

  const dismiss = useCallback(() => {
    setChange(IDLE)
  }, [])

  return { change, selectKey, importXml, apply, dismiss }
}
