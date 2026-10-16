import type { SignalDef } from '@canshift/core'

export type Scaling = Pick<SignalDef, 'scale' | 'offset'>

const SAFE_SCALE = 1

export const rawFromShown = (shown: number, scaling: Scaling): number =>
  (shown - scaling.offset) / (scaling.scale === 0 ? SAFE_SCALE : scaling.scale)

export const shownFromRaw = (raw: number, scaling: Scaling): number =>
  raw * scaling.scale + scaling.offset

export const rescaled = (live: number, catalogue: Scaling, adjusted: Scaling): number =>
  shownFromRaw(rawFromShown(live, catalogue), adjusted)

export const sameScaling = (a: Scaling, b: Scaling): boolean =>
  a.scale === b.scale && a.offset === b.offset
