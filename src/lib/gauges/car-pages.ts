import type { PageConfig, SignalDef, Widget } from '@canshift/core'
import { fillGrid, type FilledBand, type PlacedCell } from './car-page-bands'
import {
  CAR_PAGE_PLANS,
  type BandPlan,
  type CarPageId,
  type CarPagePlan,
  type SignalSlotPlan,
  type SlotPlan,
} from './car-page-plans'
import { SIGNAL_KINDS, lapTimerWidget, signalWidget } from './car-page-widgets'
import { buildBlankPage } from './layouts'

export interface CarPageProposal {
  id: CarPageId
  page: PageConfig
}

interface FillState {
  byName: ReadonlyMap<string, SignalDef>
  claimed: Set<string>
}

export const signalsToUse = (
  defined: readonly SignalDef[],
  incoming: readonly string[]
): SignalDef[] => {
  if (incoming.length === 0) return [...defined]
  const live = new Set(incoming)
  return defined.filter((def) => live.has(def.name))
}

const pickSignal = (slot: SignalSlotPlan, state: FillState): SignalDef | undefined =>
  slot.candidates
    .map((name) => state.byName.get(name))
    .find((def) => def !== undefined && !state.claimed.has(def.name))

const fillSlot = (slot: SlotPlan, state: FillState, id: string): Widget | null => {
  if (slot.kind === 'lapTimer') return lapTimerWidget(id, slot)
  const def = pickSignal(slot, state)
  if (def === undefined) return null
  if (SIGNAL_KINDS[slot.kind].claimsSignal) state.claimed.add(def.name)
  return signalWidget(id, slot, def)
}

const fillBand = (band: BandPlan, state: FillState, prefix: string): FilledBand<Widget> => ({
  rows: band.rows,
  fixed: band.fixed === true,
  cells: band.slots.flatMap((slot, index) => {
    const item = fillSlot(slot, state, `${prefix}_${String(index)}`)
    return item === null ? [] : [{ span: slot.span, item }]
  }),
})

const placed = ({ item, ...place }: PlacedCell<Widget>): Widget => ({
  ...item,
  layout: { ...item.layout, ...place },
})

const signalsOf = (widgets: readonly Widget[]): string[] => [
  ...new Set(widgets.map((widget) => widget.signal).filter((signal) => signal.length > 0)),
]

const meetsPlan = (plan: CarPagePlan, state: FillState, signals: readonly string[]): boolean =>
  plan.requires.every((name) => state.byName.has(name)) && signals.length >= plan.minSignals

const proposalFor = (
  plan: CarPagePlan,
  byName: ReadonlyMap<string, SignalDef>
): CarPageProposal | null => {
  const state: FillState = { byName, claimed: new Set() }
  const bands = plan.bands.map((band, index) =>
    fillBand(band, state, `${plan.id}_${String(index)}`)
  )
  const widgets = fillGrid(bands).map(placed)
  const signals = signalsOf(widgets)
  if (!meetsPlan(plan, state, signals)) return null
  return { id: plan.id, page: { ...buildBlankPage(), id: plan.id, widgets } }
}

export const proposeCarPages = (signals: readonly SignalDef[]): CarPageProposal[] => {
  const byName = new Map(signals.map((def) => [def.name, def]))
  return CAR_PAGE_PLANS.flatMap((plan) => proposalFor(plan, byName) ?? [])
}
