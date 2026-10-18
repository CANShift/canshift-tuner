const OUTER_PAD = 6
const QUADRANT_GAP = 2
const CENTER_W = 100
const CENTER_H = 76
const NOTCH_MARGIN = 6
const CORNER_R = 8
const INNER_R = 5
const LABEL_PAD = 10

export type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export interface Box {
  x: number
  y: number
  w: number
  h: number
}

interface PathPoint {
  x: number
  y: number
}

interface Notch {
  w: number
  h: number
}

const NOTCH: Notch = {
  w: Math.round(CENTER_W / 2 + NOTCH_MARGIN),
  h: Math.round(CENTER_H / 2 + NOTCH_MARGIN),
}

export const centerBox = (canvasW: number, contentH: number): Box => ({
  x: Math.round((canvasW - CENTER_W) / 2),
  y: Math.round((contentH - CENTER_H) / 2),
  w: CENTER_W,
  h: CENTER_H,
})

export const quadrants = (canvasW: number, contentH: number): Record<Corner, Box> => {
  const halfW = Math.round(canvasW / 2)
  const halfH = Math.round(contentH / 2)
  const leftW = halfW - OUTER_PAD - QUADRANT_GAP
  const rightW = canvasW - halfW - OUTER_PAD - QUADRANT_GAP
  const topH = halfH - OUTER_PAD - QUADRANT_GAP
  const bottomH = contentH - halfH - OUTER_PAD - QUADRANT_GAP
  return {
    'top-left': { x: OUTER_PAD, y: OUTER_PAD, w: leftW, h: topH },
    'top-right': { x: halfW + QUADRANT_GAP, y: OUTER_PAD, w: rightW, h: topH },
    'bottom-left': { x: OUTER_PAD, y: halfH + QUADRANT_GAP, w: leftW, h: bottomH },
    'bottom-right': { x: halfW + QUADRANT_GAP, y: halfH + QUADRANT_GAP, w: rightW, h: bottomH },
  }
}

const NOTCH_TRANSFORMS: Record<Corner, (p: PathPoint, w: number, h: number) => PathPoint> = {
  'top-left': (p) => p,
  'top-right': (p, w) => ({ x: w - p.x, y: p.y }),
  'bottom-left': (p, _w, h) => ({ x: p.x, y: h - p.y }),
  'bottom-right': (p, w, h) => ({ x: w - p.x, y: h - p.y }),
}

const num = (v: number): string => (Number.isInteger(v) ? String(v) : v.toFixed(2))

export const buttonPathD = (w: number, h: number, corner: Corner): string => {
  const r = CORNER_R
  const ir = INNER_R
  const { w: nw, h: nh } = NOTCH
  const map = NOTCH_TRANSFORMS[corner]
  const pt = (x: number, y: number): string => {
    const p = map({ x, y }, w, h)
    return `${num(p.x)} ${num(p.y)}`
  }
  return [
    `M ${pt(r, 0)}`,
    `L ${pt(w - r, 0)}`,
    `Q ${pt(w, 0)} ${pt(w, r)}`,
    `L ${pt(w, h - nh - ir)}`,
    `Q ${pt(w, h - nh)} ${pt(w - ir, h - nh)}`,
    `L ${pt(w - nw + ir, h - nh)}`,
    `Q ${pt(w - nw, h - nh)} ${pt(w - nw, h - nh + ir)}`,
    `L ${pt(w - nw, h - ir)}`,
    `Q ${pt(w - nw, h)} ${pt(w - nw - ir, h)}`,
    `L ${pt(r, h)}`,
    `Q ${pt(0, h)} ${pt(0, h - r)}`,
    `L ${pt(0, r)}`,
    `Q ${pt(0, 0)} ${pt(r, 0)}`,
    'Z',
  ].join(' ')
}

const LABEL_SHIFT: Record<Corner, PathPoint> = {
  'top-left': { x: -1, y: -1 },
  'top-right': { x: 1, y: -1 },
  'bottom-left': { x: -1, y: 1 },
  'bottom-right': { x: 1, y: 1 },
}

export const labelCenter = (w: number, h: number, corner: Corner): PathPoint => {
  const shift = LABEL_SHIFT[corner]
  return {
    x: w / 2 + shift.x * Math.round(NOTCH.w / 4),
    y: h / 2 + shift.y * Math.round(NOTCH.h / 4),
  }
}

const SYMBOL_LABELS = new Set(['+', '−'])

export const labelFontSize = (label: string, w: number, h: number): number => {
  const armBudget = Math.min(w - NOTCH.w - LABEL_PAD * 2, h - NOTCH.h - LABEL_PAD * 2)
  return SYMBOL_LABELS.has(label)
    ? Math.max(28, Math.min(56, armBudget))
    : Math.max(14, Math.min(28, armBudget * 0.7))
}
