import type { PagePalette } from '@canshift/core'
import { UI_FONT, UI_LABEL_TRACKING, UI_LABEL_WEIGHT } from '../../lib/typography'
import {
  buttonPathD,
  centerBox,
  labelCenter,
  labelFontSize,
  quadrants,
  type Box,
  type Corner,
} from './cruise/cruise-geometry'

const STROKE_W = 2

const L_BUTTON_FILL = '#1A1A1A'
const L_BUTTON_STROKE = '#E03030'
const L_BUTTON_TEXT = '#FFFFFF'

const CENTER = 'absolute box-border flex flex-col items-center justify-center'

const CENTER_LABEL = [
  'text-center font-sans font-extrabold leading-none tracking-[0.18em] text-[#BABAB8]',
].join(' ')

const CENTER_VALUE = [
  'whitespace-nowrap text-center font-mono font-extrabold leading-none tracking-[0.02em]',
].join(' ')

const DEMO_SET_SPEED = 0
const SPEED_UNIT = 'km/h'

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

interface CruiseButtonShapeProps {
  button: CruiseButton
  box: Box
  scale: number
}

interface ButtonLabelProps {
  button: CruiseButton
  w: number
  h: number
  color: string
}

const ButtonLabel = ({ button, w, h, color }: ButtonLabelProps) => {
  const center = labelCenter(w, h, button.corner)
  return (
    <text
      x={center.x}
      y={center.y}
      fill={color}
      fontFamily={UI_FONT}
      fontWeight={UI_LABEL_WEIGHT}
      letterSpacing={UI_LABEL_TRACKING}
      fontSize={labelFontSize(button.label, w, h)}
      textAnchor="middle"
      dominantBaseline="central"
    >
      {button.label}
    </text>
  )
}

const CruiseButtonShape = ({ button, box, scale }: CruiseButtonShapeProps) => {
  const { w, h } = box
  const title = `${button.label} — ${button.hint}`
  return (
    <svg
      width={w * scale}
      height={h * scale}
      viewBox={`0 0 ${String(w)} ${String(h)}`}
      className="absolute overflow-visible"
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{ left: box.x * scale, top: box.y * scale }}
      aria-label={title}
    >
      <title>{title}</title>
      <path
        d={buttonPathD(w, h, button.corner)}
        fill={L_BUTTON_FILL}
        stroke={L_BUTTON_STROKE}
        strokeWidth={STROKE_W}
        strokeLinejoin="round"
      />
      <ButtonLabel button={button} w={w} h={h} color={L_BUTTON_TEXT} />
    </svg>
  )
}

const CenterLabel = ({ fontSize, text }: { fontSize: number; text: string }) => (
  // eslint-disable-next-line no-inline-style/no-inline-style
  <span className={CENTER_LABEL} style={{ fontSize }}>
    {text}
  </span>
)

const CruiseCenter = ({
  box,
  scale,
  palette,
}: {
  box: Box
  scale: number
  palette: PagePalette
}) => (
  <div
    className={CENTER}
    // eslint-disable-next-line no-inline-style/no-inline-style
    style={{
      left: box.x * scale,
      top: box.y * scale,
      width: box.w * scale,
      height: box.h * scale,
      gap: 2 * scale,
      color: palette.text,
    }}
  >
    <CenterLabel fontSize={10 * scale} text="SET" />
    <span
      className={CENTER_VALUE}
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{ color: palette.text, fontSize: Math.round(40 * scale) }}
    >
      {DEMO_SET_SPEED}
    </span>
    <CenterLabel fontSize={Math.max(8, Math.round(10 * scale))} text={SPEED_UNIT} />
  </div>
)

export const CruiseControlPreview = ({
  scale,
  canvasW,
  contentH,
  palette,
}: CruiseControlPreviewProps) => {
  const fwCanvasW = canvasW / scale
  const fwContentH = contentH / scale
  const boxes: Record<Corner, Box> = quadrants(fwCanvasW, fwContentH)
  return (
    <div className="pointer-events-none absolute inset-0" data-testid="cruise-control-preview">
      {BUTTONS.map((button) => (
        <CruiseButtonShape
          key={button.op}
          button={button}
          box={boxes[button.corner]}
          scale={scale}
        />
      ))}
      <CruiseCenter box={centerBox(fwCanvasW, fwContentH)} scale={scale} palette={palette} />
    </div>
  )
}
