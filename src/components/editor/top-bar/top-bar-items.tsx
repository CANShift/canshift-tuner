import type { ReactNode } from 'react'
import type { TopBarItem } from '@canshift/core'
import { TopBarMetrics } from '@canshift/core'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const PREVIEW_SIGNAL_VALUES: Record<string, number> = {
  battery_volts: 12.4,
  rpm: 3500,
  speed_kph: 80,
  coolant_temp_c: 88,
  oil_press_bar: 4.2,
  oil_temp_c: 95,
  map_number: 1,
}

const PREVIEW_CAN_RATE = '842 Hz'
const PREVIEW_LAP = 'LAP 4\u00A0\u00A0\u00A01:38.42'

const dimText = cva('leading-none tracking-[0.1em]', {
  variants: {
    day: { true: 'text-[#5A5A5A]', false: 'text-[#BABABA]' },
  },
  defaultVariants: { day: false },
})

const STATUS_DOT = 'inline-block shrink-0 bg-[#44CC44]'

const SEPARATOR = 'w-px shrink-0 bg-[#2A2A2A]'

const BLE_ICON = 'leading-none tracking-[0.04em] text-[#4499FF]'

const THEME_TOGGLE = 'shrink-0 leading-none'

const TRACK_BADGE = 'whitespace-nowrap'

const FLAG_BADGE = 'inline-flex items-center opacity-40'

const FLAG_SQUARE = 'shrink-0 bg-[#FF8800]'

const FLAG_TEXT = 'leading-none text-[#FF8800]'

const formatPreviewSignal = (signal: string, format?: string): string => {
  const value = PREVIEW_SIGNAL_VALUES[signal]
  if (value === undefined) return '--'
  if (!format) return value.toFixed(1)
  const m = /%\.(\d+)f(.*)/.exec(format)
  if (!m) return format.replace('%f', value.toFixed(1))
  const decimals = parseInt(m[1] ?? '1', 10)
  const suffix = m[2] ?? ''
  return value.toFixed(decimals) + suffix
}

export interface BarMetrics {
  h: number
  dot: number
  fs: number
  sep: number
  gap: number
  px: number
  flagSquare: number
  flagGap: number
}

export const barMetrics = (height: number, scale: number): BarMetrics => {
  const h = height * scale
  return {
    h,
    dot: Math.round(h * TopBarMetrics.dotRatio),
    fs: Math.round(TopBarMetrics.labelFontPx * scale),
    sep: Math.round(h * TopBarMetrics.separatorRatio),
    gap: Math.round(h * TopBarMetrics.gapRatio),
    px: Math.round(h * TopBarMetrics.paddingRatio),
    flagSquare: Math.round(TopBarMetrics.flagSquarePx * scale),
    flagGap: Math.round(TopBarMetrics.flagGapPx * scale),
  }
}

export interface ItemContext {
  metrics: BarMetrics
  isDayMode: boolean
  textColor: string
}

type ItemRenderer = (item: TopBarItem, ctx: ItemContext) => ReactNode

const DimText = ({ ctx, children }: { ctx: ItemContext; children: ReactNode }) => (
  // eslint-disable-next-line no-inline-style/no-inline-style
  <span className={cn(dimText({ day: ctx.isDayMode }))} style={{ fontSize: ctx.metrics.fs }}>
    {children}
  </span>
)

const FlagBadge = ({ text, metrics }: { text: string; metrics: BarMetrics }) => (
  // eslint-disable-next-line no-inline-style/no-inline-style
  <span className={FLAG_BADGE} style={{ gap: metrics.flagGap }}>
    <span
      className={FLAG_SQUARE}
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{ width: metrics.flagSquare, height: metrics.flagSquare }}
    />
    {/* eslint-disable-next-line no-inline-style/no-inline-style */}
    <span className={FLAG_TEXT} style={{ fontSize: metrics.fs }}>
      {text}
    </span>
  </span>
)

const signalText = (item: TopBarItem): string => {
  if (item.type === 'signal') return formatPreviewSignal(item.signal, item.format)
  if (item.type === 'signalMax')
    return `${item.text} ${formatPreviewSignal(item.signal, item.format)}`
  return ''
}

const itemText = (item: TopBarItem): string => ('text' in item ? item.text : '')

const ITEM_RENDERERS: Record<TopBarItem['type'], ItemRenderer> = {
  statusDot: (_item, { metrics }) => (
    // eslint-disable-next-line no-inline-style/no-inline-style
    <span className={STATUS_DOT} style={{ width: metrics.dot, height: metrics.dot }} />
  ),
  label: (item, ctx) => <DimText ctx={ctx}>{itemText(item)}</DimText>,
  // eslint-disable-next-line no-inline-style/no-inline-style
  separator: (_item, { metrics }) => <span className={SEPARATOR} style={{ height: metrics.sep }} />,
  signal: (item, ctx) => <DimText ctx={ctx}>{signalText(item)}</DimText>,
  signalMax: (item, ctx) => <DimText ctx={ctx}>{signalText(item)}</DimText>,
  canRate: (_item, ctx) => <DimText ctx={ctx}>{PREVIEW_CAN_RATE}</DimText>,
  bleIcon: (_item, { metrics }) => (
    // eslint-disable-next-line no-inline-style/no-inline-style
    <span className={BLE_ICON} style={{ fontSize: metrics.fs }}>
      BLE
    </span>
  ),
  themeToggle: (_item, ctx) => (
    <span
      className={THEME_TOGGLE}
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{ fontSize: ctx.metrics.fs + 1, color: ctx.textColor }}
    >
      {ctx.isDayMode ? '☀' : '☾'}
    </span>
  ),
  modeFlag: (item, { metrics }) => <FlagBadge text={itemText(item)} metrics={metrics} />,
  trackBadge: (_item, ctx) => (
    <span
      className={cn(dimText({ day: ctx.isDayMode }), TRACK_BADGE)}
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{ fontSize: ctx.metrics.fs }}
    >
      {PREVIEW_LAP}
    </span>
  ),
}

export const renderTopBarItem: ItemRenderer = (item, ctx) => ITEM_RENDERERS[item.type](item, ctx)
