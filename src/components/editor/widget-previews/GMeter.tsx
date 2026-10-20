import { memo, type ReactNode } from 'react'
import {
  G_METER,
  WIDGET_LOCK_INK_COLORS,
  WIDGET_LOCK_LINE_COLORS,
  WIDGET_TOP_RULE,
  gMeterEnvelopeVertex,
  gMeterPlotBox,
  gMeterPlotOffset,
  type GMeterPlotBox,
  type GMeterWidgetConfig,
  type Widget,
} from '@canshift/core'
import { shownKicker } from '../../../lib/widget-kicker'
import { MONO_FONT } from '../../../lib/typography'
import { WIDGET_DIM_COLOR } from '../widget-preview.styles'
import { type BaseRendererProps } from './shared'
import { TopRule } from './TopRule'
import { Kicker, UNIT_FONT_PX } from './ValueCluster'

const DEMO_FELT_G: readonly [number, number] = [0.55, 0.35]
const DEMO_PEAKS_G = [0.9, 0.7, 1.0, 0.5, 0.6, 0.5, 0.95, 0.7] as const
const KICKER_SEPARATOR = ' · '
const HUNDREDTHS = 100

const truncatedReading = (value: number): string =>
  (Math.trunc(value * HUNDREDTHS) / HUNDREDTHS).toFixed(G_METER.valueDecimals)

interface GMeterRendererProps extends BaseRendererProps {
  scale: number
  locked: boolean
}

interface PlotFrameProps {
  box: GMeterPlotBox
  scale: number
  children: ReactNode
}

interface PlotProps {
  side: number
  cfg: GMeterWidgetConfig
  ink: string
  guide: string
  live: boolean
}

const envelopePoints = (radius: number, rangeG: number): string =>
  [...DEMO_PEAKS_G, DEMO_PEAKS_G[0]]
    .map((peak, sector) => gMeterEnvelopeVertex(peak, sector, rangeG, radius))
    .map(({ dx, dy }) => `${radius + dx},${radius + dy}`)
    .join(' ')

const Guides = ({ side, guide }: { side: number; guide: string }) => {
  const r = side / 2
  const stroke = { stroke: guide, strokeWidth: G_METER.strokePx, fill: 'none' }
  return (
    <>
      <circle cx={r} cy={r} r={r - G_METER.strokePx / 2} {...stroke} />
      <circle cx={r} cy={r} r={side / G_METER.innerRingDivisor / 2} {...stroke} />
      <line x1={0} y1={r} x2={side} y2={r} {...stroke} />
      <line x1={r} y1={0} x2={r} y2={side} {...stroke} />
    </>
  )
}

const Live = ({ side, cfg, ink }: Omit<PlotProps, 'guide' | 'live'>) => {
  const radius = Math.floor(side / 2)
  const dot = gMeterPlotOffset(DEMO_FELT_G[0], DEMO_FELT_G[1], cfg.rangeG, radius)
  const corner = radius - G_METER.dotSidePx / 2
  return (
    <>
      {cfg.peakHold !== false && (
        <polyline
          points={envelopePoints(radius, cfg.rangeG)}
          fill="none"
          stroke={WIDGET_DIM_COLOR}
          strokeWidth={G_METER.strokePx}
        />
      )}
      <rect
        x={corner + dot.dx}
        y={corner + dot.dy}
        width={G_METER.dotSidePx}
        height={G_METER.dotSidePx}
        fill={ink}
      />
    </>
  )
}

const Plot = ({ side, cfg, ink, guide, live }: PlotProps) => (
  <svg viewBox={`0 0 ${side} ${side}`} width="100%" height="100%" aria-hidden="true">
    <Guides side={side} guide={guide} />
    {live && <Live side={side} cfg={cfg} ink={ink} />}
  </svg>
)

const Readout = ({ scale, ink }: { scale: number; ink: string }) => (
  <span
    className="absolute left-0 flex items-end gap-0.5 leading-none"
    // eslint-disable-next-line no-inline-style/no-inline-style
    style={{ top: G_METER.readoutTopPx * scale, fontFamily: MONO_FONT }}
  >
    {/* eslint-disable-next-line no-inline-style/no-inline-style */}
    <span className="font-extrabold" style={{ color: ink, fontSize: G_METER.valueFontPx * scale }}>
      {truncatedReading(Math.hypot(...DEMO_FELT_G))}
    </span>
    {/* eslint-disable-next-line no-inline-style/no-inline-style */}
    <span style={{ color: WIDGET_DIM_COLOR, fontSize: UNIT_FONT_PX * scale }}>{G_METER.unit}</span>
  </span>
)

interface GMeterKickerProps {
  widget: Widget
  locked: boolean
  scale: number
}

const GMeterKicker = ({ widget, locked, scale }: GMeterKickerProps) => (
  <Kicker
    text={
      locked
        ? `${shownKicker(widget)}${KICKER_SEPARATOR}${G_METER.noImuReason}`
        : shownKicker(widget)
    }
    scale={scale}
    color={locked ? WIDGET_LOCK_INK_COLORS.night : undefined}
  />
)

const PlotFrame = ({ box, scale, children }: PlotFrameProps) => (
  <div
    className="absolute"
    // eslint-disable-next-line no-inline-style/no-inline-style
    style={{
      left: box.x * scale,
      top: box.y * scale,
      width: box.side * scale,
      height: box.side * scale,
    }}
  >
    {children}
  </div>
)

export const GMeterPreview = memo(function GMeterPreview({
  widget,
  w,
  h,
  scale,
  locked,
}: GMeterRendererProps) {
  if (widget.config.type !== 'g_meter') return null
  const ink = locked ? WIDGET_LOCK_LINE_COLORS.night : widget.style.textColor
  const box = gMeterPlotBox(w / scale, h / scale)
  return (
    // eslint-disable-next-line no-inline-style/no-inline-style
    <div className="relative box-border overflow-hidden" style={{ width: w, height: h }}>
      <TopRule devicePx={WIDGET_TOP_RULE.primaryFontMin} scale={scale} inkColor={ink} />
      <GMeterKicker widget={widget} locked={locked} scale={scale} />
      {!locked && <Readout scale={scale} ink={ink} />}
      <PlotFrame box={box} scale={scale}>
        <Plot
          side={box.side}
          cfg={widget.config}
          ink={ink}
          guide={locked ? WIDGET_LOCK_LINE_COLORS.night : WIDGET_TOP_RULE.trackColor}
          live={!locked}
        />
      </PlotFrame>
    </div>
  )
})
