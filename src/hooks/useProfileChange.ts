import { useCallback, useState } from 'react'
import { ECU_PROFILES } from '@canshift/core'
import type { SignalDef } from '@canshift/core'
import { useDashboardStore } from '../stores/dashboard.store'
import { useSignalStore } from '../stores/signal.store'
import { useLogStore } from '../stores/log.store'
import { profileLabelFromFileName } from '../lib/profile-xml'
import {
  appliedSummary,
  changeSummary,
  lostBindingCount,
  parseProfileFile,
} from '../lib/profile-change'
import { loadCatalogueProfile } from '../lib/catalogue-profile'

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

type Stage = (key: string, label: string, next: SignalDef[], warnings: readonly string[]) => void

const CATALOGUE_SCHEME = 'catalogue'

const useStage = (setChange: (change: ProfileChange) => void): Stage => {
  const signals = useSignalStore((s) => s.signals)
  const config = useDashboardStore((s) => s.config)
  return useCallback(
    (key, label, next, warnings) => {
      const message = changeSummary(label, signals, next, lostBindingCount(config, next))
      setChange({ kind: 'pending', key, label, signals: next, message, warnings })
    },
    [config, signals, setChange]
  )
}

const stageCatalogue = async (
  key: string,
  id: string,
  stage: Stage,
  fail: (message: string) => void
) => {
  const profile = await loadCatalogueProfile(id)
  if (profile.kind === 'ok') {
    stage(key, profile.label, profile.signals, profile.warnings)
    return
  }
  if (profile.failure !== undefined) useLogStore.getState().push('error', profile.failure)
  fail(profile.message)
}

const useSelectKey = (stage: Stage, fail: (message: string) => void) =>
  useCallback(
    (key: string) => {
      const [scheme, ...rest] = key.split(':')
      const id = rest.join(':')
      if (scheme === CATALOGUE_SCHEME) {
        void stageCatalogue(key, id, stage, fail)
        return
      }
      const profile = ECU_PROFILES.find((entry) => entry.id === id)
      if (profile) stage(key, profile.name, [...profile.signals], [])
    },
    [stage, fail]
  )

const useImportXml = (stage: Stage, fail: (message: string) => void) =>
  useCallback(
    (fileName: string, xml: string) => {
      const parsed = parseProfileFile(fileName, xml)
      if (parsed.kind === 'error') {
        fail(parsed.message)
        return
      }
      stage(
        `import:${fileName}`,
        profileLabelFromFileName(fileName),
        parsed.signals,
        parsed.warnings
      )
    },
    [stage, fail]
  )

const useApply = (change: ProfileChange, setChange: (change: ProfileChange) => void) => {
  const applyProfile = useSignalStore((s) => s.applyProfile)
  const log = useLogStore((s) => s.push)
  return useCallback(() => {
    if (change.kind !== 'pending') return
    applyProfile(change.key, change.signals)
    log('success', `Applied "${change.label}" — ${String(change.signals.length)} signals`)
    setChange({ kind: 'applied', message: appliedSummary(change.label, change.signals.length) })
  }, [change, applyProfile, log, setChange])
}

export const useProfileChange = (): UseProfileChange => {
  const [change, setChange] = useState<ProfileChange>(IDLE)
  const fail = useCallback((message: string) => {
    setChange({ kind: 'error', message })
  }, [])
  const stage = useStage(setChange)
  const dismiss = useCallback(() => {
    setChange(IDLE)
  }, [])
  return {
    change,
    selectKey: useSelectKey(stage, fail),
    importXml: useImportXml(stage, fail),
    apply: useApply(change, setChange),
    dismiss,
  }
}
