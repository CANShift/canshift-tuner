import type { ReactNode } from 'react'
import type { TopBarItem, UnitSystem } from '@canshift/core'
import { TOP_BAR_METRICS } from '@canshift/core'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { previewItemText } from '../../../lib/status-preview'
import { isStatusItem } from '../../../lib/status-row'

const PREVIEW_CAN_RATE = '842 Hz'
const PREVIEW_LAP = 'LAP 4\u00A0\u00A0\u00A01:38.42'

const dimText = cva('font-mono leading-none tracking-widest', {
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
    dot: Math.round(h * TOP_BAR_METRICS.dotRatio),
    fs: Math.round(TOP_BAR_METRICS.labelFontPx * scale),
    sep: Math.round(h * TOP_BAR_METRICS.separatorRatio),
    gap: Math.round(h * TOP_BAR_METRICS.gapRatio),
    px: Math.round(h * TOP_BAR_METRICS.paddingRatio),
    flagSquare: Math.round(TOP_BAR_METRICS.flagSquarePx * scale),
    flagGap: Math.round(TOP_BAR_METRICS.flagGapPx * scale),
  }
}

export interface ItemContext {
  metrics: BarMetrics
  isDayMode: boolean
  textColor: string
  units: UnitSystem
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

const StatusText = ({ item, ctx }: { item: TopBarItem; ctx: ItemContext }) => (
  <DimText ctx={ctx}>{isStatusItem(item) ? previewItemText(item, ctx.units) : ''}</DimText>
)

const itemText = (item: TopBarItem): string => ('text' in item ? (item.text ?? '') : '')

const ITEM_RENDERERS: Record<TopBarItem['type'], ItemRenderer> = {
  statusDot: (_item, { metrics }) => (
    // eslint-disable-next-line no-inline-style/no-inline-style
    <span className={STATUS_DOT} style={{ width: metrics.dot, height: metrics.dot }} />
  ),
  label: (item, ctx) => <DimText ctx={ctx}>{itemText(item)}</DimText>,
  // eslint-disable-next-line no-inline-style/no-inline-style
  separator: (_item, { metrics }) => <span className={SEPARATOR} style={{ height: metrics.sep }} />,
  signal: (item, ctx) => <StatusText item={item} ctx={ctx} />,
  signalMax: (item, ctx) => <StatusText item={item} ctx={ctx} />,
  timer: (item, ctx) => <StatusText item={item} ctx={ctx} />,
  flagWord: (item, ctx) => <StatusText item={item} ctx={ctx} />,
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
