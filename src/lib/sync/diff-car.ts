import type { SignalDef } from '@canshift/core'
import { STRINGS } from '../../strings'
import { CATALOGUE_INDEX } from '../ecu-catalogue'
import { ecuLabelForKey } from '../../utils/ecu-label'
import type { Change } from './change'
import { signalName } from './describe'
import type { CarSetup } from './setup'
import { pathKey, sameValue, type SetupPath } from './setup-path'

const C = STRINGS.changes

const carLabel = (key: string): string => ecuLabelForKey(key, CATALOGUE_INDEX)

const carChange = (path: SetupPath, what: string, was: string, undoable = true): Change => ({
  id: pathKey(path),
  section: 'car',
  where: C.carWhere,
  what,
  was,
  revert: undoable ? { kind: 'path', path } : { kind: 'whole' },
  target: null,
})

const signalChange = (name: string, what: string, was: string): Change =>
  carChange(['car', 'signals', { id: name }], what, was)

const byName = (signals: readonly SignalDef[]): Map<string, SignalDef> =>
  new Map(signals.map((signal) => [signal.name, signal]))

const signalChanges = (before: readonly SignalDef[], after: readonly SignalDef[]): Change[] => {
  const previous = byName(before)
  const next = byName(after)
  const removed = before
    .filter((signal) => !next.has(signal.name))
    .map((signal) =>
      signalChange(signal.name, C.removedSignal(signalName(signal.name)), C.wasOnDash)
    )
  const touched = after.flatMap((signal) => {
    const old = previous.get(signal.name)
    if (old === undefined)
      return [signalChange(signal.name, C.addedSignal(signalName(signal.name)), C.newItem)]
    if (sameValue(old, signal)) return []
    return [signalChange(signal.name, C.adjustedSignal(signalName(signal.name)), '')]
  })
  return [...removed, ...touched]
}

export const carChanges = (device: CarSetup | null, draft: CarSetup | null): Change[] => {
  if (draft === null) return []
  if (device === null) return [carChange(['car'], C.carNotOnDash, '', false)]
  if (device.profileKey !== draft.profileKey) {
    return [
      carChange(
        ['car'],
        C.carChanged(carLabel(draft.profileKey)),
        C.was(carLabel(device.profileKey))
      ),
    ]
  }
  return signalChanges(device.signals, draft.signals)
}
