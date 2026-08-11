import type { PagePalette } from '@canshift/core'
import { MONO_FONT, UI_FONT, UI_LABEL_TRACKING, UI_LABEL_WEIGHT } from '../../lib/typography'

const OUTER_PAD = 6
const CENTER_W = 100
const CENTER_H = 76
const NOTCH_MARGIN = 6
const CORNER_R = 8
const INNER_R = 5
const LABEL_PAD = 10
const STROKE_W = 2

const DEMO_SET_SPEED = 0
const SPEED_UNIT = 'km/h'

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

interface CruiseButton {
  label: string
  hint: string
  op: 'increment' | 'decrement' | 'set' | 'off'
  corner: Corner
}

const BUTTONS: readonly CruiseButton[] = [
  { label: '−', hint: 'Decrement setpoint', op: 'decrement', corner: 'top-left' },
  { label: '+', hint: 'Increment setpoint', op: 'increment', corner: 'top-right' },
  { label: 'SET', hint: 'Capture current speed', op: 'set', corner: 'bottom-left' },
  { label: 'OFF', hint: 'Disable cruise', op: 'off', corner: 'bottom-right' },
]

interface CruiseControlPreviewProps {
  scale: number
  canvasW: number
  contentH: number
  palette: PagePalette
}

interface Box {
  x: number
  y: number
  w: number
  h: number
}

const computeLayout = (fwCanvasW: number, fwContentH: number) => {
  const centerX = Math.round((fwCanvasW - CENTER_W) / 2)
  const centerY = Math.round((fwContentH - CENTER_H) / 2)
  const center: Box = { x: centerX, y: centerY, w: CENTER_W, h: CENTER_H }

  const halfW = Math.round(fwCanvasW / 2)
  const halfH = Math.round(fwContentH / 2)

  return {
    center,
    'top-left': {
      x: OUTER_PAD,
      y: OUTER_PAD,
      w: halfW - OUTER_PAD - 2,
      h: halfH - OUTER_PAD - 2,
    } as Box,
    'top-right': {
      x: halfW + 2,
      y: OUTER_PAD,
      w: fwCanvasW - halfW - OUTER_PAD - 2,
      h: halfH - OUTER_PAD - 2,
    } as Box,
    'bottom-left': {
      x: OUTER_PAD,
      y: halfH + 2,
      w: halfW - OUTER_PAD - 2,
      h: fwContentH - halfH - OUTER_PAD - 2,
    } as Box,
    'bottom-right': {
      x: halfW + 2,
      y: halfH + 2,
      w: fwCanvasW - halfW - OUTER_PAD - 2,
      h: fwContentH - halfH - OUTER_PAD - 2,
    } as Box,
  }
}

interface PathPoint {
  x: number
  y: number
}

const NOTCH_TRANSFORMS: Record<Corner, (p: PathPoint, w: number, h: number) => PathPoint> = {
  'top-left': (p) => p,
  'top-right': (p, w) => ({ x: w - p.x, y: p.y }),
  'bottom-left': (p, _w, h) => ({ x: p.x, y: h - p.y }),
  'bottom-right': (p, w, h) => ({ x: w - p.x, y: h - p.y }),
}

const buttonPathD = (
  w: number,
  h: number,
  notchW: number,
  notchH: number,
  corner: Corner
): string => {
  const r = CORNER_R
  const ir = INNER_R
  const map = NOTCH_TRANSFORMS[corner]
  const pt = (x: number, y: number): string => {
    const p = map({ x, y }, w, h)
    return `${num(p.x)} ${num(p.y)}`
  }
  return [
    `M ${pt(r, 0)}`,
    `L ${pt(w - r, 0)}`,
    `Q ${pt(w, 0)} ${pt(w, r)}`,
    `L ${pt(w, h - notchH - ir)}`,
    `Q ${pt(w, h - notchH)} ${pt(w - ir, h - notchH)}`,
    `L ${pt(w - notchW + ir, h - notchH)}`,
    `Q ${pt(w - notchW, h - notchH)} ${pt(w - notchW, h - notchH + ir)}`,
    `L ${pt(w - notchW, h - ir)}`,
    `Q ${pt(w - notchW, h)} ${pt(w - notchW - ir, h)}`,
    `L ${pt(r, h)}`,
    `Q ${pt(0, h)} ${pt(0, h - r)}`,
    `L ${pt(0, r)}`,
    `Q ${pt(0, 0)} ${pt(r, 0)}`,
    'Z',
  ].join(' ')
}

const num = (v: number): string => {
  return Number.isInteger(v) ? String(v) : v.toFixed(2)
}

const labelCenter = (w: number, h: number, notchW: number, notchH: number, corner: Corner) => {
  const offsetX = Math.round(notchW / 4)
  const offsetY = Math.round(notchH / 4)
  switch (corner) {
    case 'top-left':
      return { x: w / 2 - offsetX, y: h / 2 - offsetY }
    case 'top-right':
      return { x: w / 2 + offsetX, y: h / 2 - offsetY }
    case 'bottom-left':
      return { x: w / 2 - offsetX, y: h / 2 + offsetY }
    case 'bottom-right':
      return { x: w / 2 + offsetX, y: h / 2 + offsetY }
  }
}

export const CruiseControlPreview = ({
  scale,
  canvasW,
  contentH,
  palette,
}: CruiseControlPreviewProps) => {
  const fwCanvasW = canvasW / scale
  const fwContentH = contentH / scale
  const layout = computeLayout(fwCanvasW, fwContentH)

  const notchW = Math.round(CENTER_W / 2 + NOTCH_MARGIN)
  const notchH = Math.round(CENTER_H / 2 + NOTCH_MARGIN)

  return (
    <div
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      data-testid="cruise-control-preview"
    >
      {BUTTONS.map((btn) => {
        const box = layout[btn.corner]
        const w = box.w
        const h = box.h
        const path = buttonPathD(w, h, notchW, notchH, btn.corner)
        const labelXY = labelCenter(w, h, notchW, notchH, btn.corner)
        const isSymbol = btn.label === '+' || btn.label === '−'
        const armBudget = Math.min(w - notchW - LABEL_PAD * 2, h - notchH - LABEL_PAD * 2)
        const labelFontSize = isSymbol
          ? Math.max(28, Math.min(56, armBudget))
          : Math.max(14, Math.min(28, armBudget * 0.7))
        return (
          <svg
            key={btn.op}
            width={w * scale}
            height={h * scale}
            viewBox={`0 0 ${String(w)} ${String(h)}`}
            style={{
              position: 'absolute',
              left: box.x * scale,
              top: box.y * scale,
              overflow: 'visible',
              opacity: 0.92,
            }}
            aria-label={`${btn.label} — ${btn.hint}`}
          >
            <title>{`${btn.label} — ${btn.hint}`}</title>
            <path
              d={path}
              fill={palette.surface}
              stroke={palette.primary}
              strokeWidth={STROKE_W}
              strokeLinejoin="round"
            />
            <text
              x={labelXY.x}
              y={labelXY.y}
              fill={palette.text}
              fontFamily={UI_FONT}
              fontWeight={UI_LABEL_WEIGHT}
              letterSpacing={UI_LABEL_TRACKING}
              fontSize={labelFontSize}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {btn.label}
            </text>
          </svg>
        )
      })}

      <div
        style={{
          position: 'absolute',
          left: layout.center.x * scale,
          top: layout.center.y * scale,
          width: layout.center.w * scale,
          height: layout.center.h * scale,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2 * scale,
          color: palette.text,
        }}
      >
        <span
          style={{
            fontFamily: UI_FONT,
            fontWeight: UI_LABEL_WEIGHT,
            fontSize: 10 * scale,
            color: '#888888',
            lineHeight: 1,
            letterSpacing: UI_LABEL_TRACKING,
            textAlign: 'center',
          }}
        >
          SET
        </span>
        <span
          style={{
            color: palette.text,
            fontFamily: MONO_FONT,
            fontWeight: 800,
            fontSize: Math.round(40 * scale),
            lineHeight: 1,
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
            textAlign: 'center',
          }}
        >
          {DEMO_SET_SPEED}
        </span>
        <span
          style={{
            color: '#888888',
            fontFamily: UI_FONT,
            fontWeight: UI_LABEL_WEIGHT,
            fontSize: Math.max(8, Math.round(10 * scale)),
            lineHeight: 1,
            letterSpacing: UI_LABEL_TRACKING,
            textAlign: 'center',
          }}
        >
          {SPEED_UNIT}
        </span>
      </div>
    </div>
  )
}
