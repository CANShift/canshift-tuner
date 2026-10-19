export type CarPageId = 'street' | 'track' | 'engine'

export type SignalSlotKind = 'gauge' | 'barGauge' | 'revGauge' | 'gear' | 'shiftLight'

export interface SignalSlotPlan {
  kind: SignalSlotKind
  span: number
  candidates: readonly string[]
  big?: number
}

export interface TimerSlotPlan {
  kind: 'lapTimer'
  span: number
  big?: number
}

export type SlotPlan = SignalSlotPlan | TimerSlotPlan

export interface BandPlan {
  rows: number
  fixed?: boolean
  slots: readonly SlotPlan[]
}

export interface CarPagePlan {
  id: CarPageId
  minSignals: number
  requires: readonly string[]
  bands: readonly BandPlan[]
}

const HERO = 96
const LARGE = 88
const MEDIUM = 64
const SMALL = 44

const STREET: CarPagePlan = {
  id: 'street',
  minSignals: 4,
  requires: [],
  bands: [
    {
      rows: 6,
      slots: [
        { kind: 'gauge', span: 7, big: HERO, candidates: ['speed_kph'] },
        { kind: 'gear', span: 5, big: HERO, candidates: ['gear'] },
      ],
    },
    {
      rows: 3,
      slots: [
        { kind: 'barGauge', span: 6, big: SMALL, candidates: ['rpm'] },
        { kind: 'gauge', span: 3, candidates: ['coolant_temp_c'] },
        { kind: 'barGauge', span: 3, candidates: ['fuel_level_pct'] },
      ],
    },
    {
      rows: 3,
      slots: [
        { kind: 'gauge', span: 4, candidates: ['oil_temp_c'] },
        { kind: 'gauge', span: 4, candidates: ['oil_press_bar'] },
        { kind: 'gauge', span: 4, candidates: ['battery_volts'] },
      ],
    },
  ],
}

const TRACK: CarPagePlan = {
  id: 'track',
  minSignals: 4,
  requires: ['rpm'],
  bands: [
    { rows: 1, fixed: true, slots: [{ kind: 'shiftLight', span: 12, candidates: ['rpm'] }] },
    {
      rows: 5,
      slots: [
        { kind: 'revGauge', span: 7, big: LARGE, candidates: ['rpm'] },
        { kind: 'gear', span: 5, big: LARGE, candidates: ['gear'] },
      ],
    },
    {
      rows: 3,
      slots: [
        { kind: 'lapTimer', span: 7, big: SMALL },
        { kind: 'gauge', span: 5, big: SMALL, candidates: ['oil_press_bar', 'speed_kph'] },
      ],
    },
    {
      rows: 3,
      slots: [
        { kind: 'gauge', span: 3, candidates: ['coolant_temp_c'] },
        { kind: 'gauge', span: 3, candidates: ['oil_temp_c'] },
        { kind: 'gauge', span: 3, candidates: ['boost_bar', 'map_kpa'] },
        { kind: 'gauge', span: 3, candidates: ['lambda_1', 'afr_1', 'throttle_pos'] },
      ],
    },
  ],
}

const ENGINE: CarPagePlan = {
  id: 'engine',
  minSignals: 4,
  requires: [],
  bands: [
    {
      rows: 5,
      slots: [
        { kind: 'barGauge', span: 6, big: MEDIUM, candidates: ['coolant_temp_c'] },
        { kind: 'barGauge', span: 6, big: MEDIUM, candidates: ['oil_temp_c'] },
      ],
    },
    {
      rows: 4,
      slots: [
        { kind: 'barGauge', span: 6, big: MEDIUM, candidates: ['oil_press_bar'] },
        { kind: 'barGauge', span: 6, big: MEDIUM, candidates: ['fuel_press_bar'] },
      ],
    },
    {
      rows: 3,
      slots: [
        { kind: 'gauge', span: 4, candidates: ['gearbox_temp_c', 'egt_c'] },
        { kind: 'gauge', span: 4, candidates: ['diff_temp_c', 'iat_c'] },
        { kind: 'gauge', span: 4, candidates: ['battery_volts'] },
      ],
    },
  ],
}

export const CAR_PAGE_PLANS: readonly CarPagePlan[] = [STREET, TRACK, ENGINE]
